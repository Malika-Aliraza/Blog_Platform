"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import CommentSection from "../_components/CommentSection";
import { Trash } from "lucide-react";
import Dialog from "../../_components/Dialog";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, getSignlePostDetails } from "@/app/redux/PostSlice";
import Link from "next/link";
import EditProfile from "../../_components/EditProfile";
import { updatePostParagraph, updateTitle } from "@/app/redux/UpdateSlice";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const Post = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [para, setPara] = useState("");
  const [translatedContent, setTranslatedContent] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [isTranslating, setIsTranslating] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(getSignlePostDetails(id));
  }, [id, dispatch]);

  const handleDelete = () => {
    dispatch(deletePost(id));
    router.push("/");
  };

  const post = useSelector((state) => state?.post?.post?.data);
  const loading = useSelector((state) => state?.post?.loading);
  const userId = useSelector((state) => state?.user?.entity?.data?.id);

  // update Tilte
  useEffect(() => {
    setTitle(post?.title);
  }, [post?.title]);

  const udateTitle = () => {
    dispatch(updateTitle({ id: post?.id, title: title }));
  };
  // update Paragraph
  useEffect(() => {
    setPara(post?.content);
  }, [post?.content]);
  const udatePara = () => {
    dispatch(updatePostParagraph({ id: post?.id, content: para }));
  };

  const handleTranslate = async () => {
    if (!post?.content) return;
    setIsTranslating(true);
    try {
      const response = await axios.post('/api/translate', {
        text: post.content,
        targetLanguage,
      });
      setTranslatedContent(response.data.translatedText);
      toast({
        title: "Translation",
        description: `Translated to ${targetLanguage}`,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Failed to translate";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    setIsTranslating(false);
  };
  if (loading) {
    return (
      <div className="flex flex-col bg-gray-100 dark:bg-gray-900 rounded-lg p-5 mt-5 mx-5 animate-pulse">
        <div className="w-full overflow-hidden xl:h-[55vh] bg-gray-300 dark:bg-gray-700"></div>
        <h2 className="text-2xl font-bold mt-4 bg-gray-300 dark:bg-gray-700 p-5"></h2>
        <p className="text-gray-700 mt-2 dark:text-gray-200 bg-gray-300 dark:bg-gray-700 p-5"></p>
        <div className="flex justify-between items-center mt-4 p-5">
          <div>
            <p className="text-sm dark:text-gray-300 text-gray-500 bg-gray-300 dark:bg-gray-700 py-5 px-10"></p>
            <p className="text-sm dark:text-gray-300 text-gray-500 bg-gray-300 dark:bg-gray-700 py-5 px-10"></p>
          </div>
          <div className="flex items-center justify-center">
            <div className="m-2 bg-gray-300 dark:bg-gray-700 p-5"></div>
            <div className="m-2 bg-gray-300 dark:bg-gray-700 p-5"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 rounded-lg p-5 mt-5 mx-5">
      <div className="w-full overflow-hidden xl:h-[55vh]">
        {post?.image ? (
          <Image
            src={post.image}
            width={1780}
            height={500}
            alt="blog Image"
            loading="lazy"
            className="object-contain w-full h-full object-center rounded-lg"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 rounded-lg">
            No image available
          </div>
        )}
      </div>
      {post?.userId === userId && (
        <div className="flex items-center justify-center mt-5">
          <span>
            <Dialog
              item={<Trash strokeWidth={3} size={17} />}
              onYes={handleDelete}
            />
          </span>
        </div>
      )}
      <h2 className="text-2xl font-bold mt-4 flex items-center justify-start">
        {post?.title}{" "}
        {post?.userId === userId && (
          <span className="m-3 text-sm font-normal flex items-center justify-between px-2 dark:bg-gray-800  bg-gray-200 rounded-lg ">
            <p>Edit Title:</p>
            <EditProfile
              name={"Title"}
              value={title}
              updateInfo={udateTitle}
              onChange={(e) => setTitle(e.target.value)}
            />
          </span>
        )}
      </h2>
      <div className="text-gray-700 mt-2 dark:text-gray-200 flex-col flex">
        {post?.userId === userId && (
          <span className="m-3 text-sm font-normal flex items-center justify-between px-2 w-44 dark:bg-gray-800  bg-gray-200 rounded-lg ">
            <p>Edit Paragraph: </p>
            <EditProfile
              name={"Paragraph"}
              value={para}
              onChange={(e) => setPara(e.target.value)}
              updateInfo={udatePara}
            />
          </span>
        )}
        {translatedContent || post?.content}
      </div>
      <div className="flex items-center mt-4 space-x-2">
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
        >
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Italian">Italian</option>
          <option value="Portuguese">Portuguese</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="Korean">Korean</option>
        </select>
        <button
          onClick={handleTranslate}
          className="px-3 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
          disabled={isTranslating}
        >
          {isTranslating ? "Translating..." : "Translate"}
        </button>
        {translatedContent && (
          <button
            onClick={() => setTranslatedContent("")}
            className="px-3 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Show Original
          </button>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>
          <p className="text-sm dark:text-gray-300 text-gray-500">
            Author: {post?.user?.name}
          </p>
          <p className="text-sm dark:text-gray-300 text-gray-500">
            Date:{" "}
            {new Date(post?.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {userId ? (
        <CommentSection postId={post?.id} userId={userId} post={post} />
      ) : (
        <div className="flex w-full items-center justify-center flex-col">
          <p
            className=" dark:text-gray-300 text-gray-500 font-semibold text-lg md:text-2xl"
            style={{ textAlign: "center" }}
          >
            Please login to view the comment section.
          </p>
          <Link
            href={"/signup"}
            className="text-gray-700 dark:text-gray-200 font-semibold underline"
            style={{ textAlign: "center" }}
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default Post;
