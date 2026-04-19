"use client";
import { createPost, hidePost } from "@/app/redux/PostSlice";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const TextEdit = () => {
  const { toast } = useToast();
  const [postDetail, setPostDetails] = useState({
    title: "",
    description: "",
    image: "",
    userId: "",
  });
  const [imageUploaded, setImageUploaded] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [loading, setLoading] = useState(false);
  const widgetRef = useRef(null);
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.user?.entity?.data?.id ?? "");
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const cloudApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";

  const handleChnage = (e) => {
    setPostDetails({
      ...postDetail,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    setPostDetails((prevDetails) => ({
      ...prevDetails,
      userId: userId,
    }));
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.cloudinary) {
      setWidgetReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => setWidgetReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleImageUpload = (info) => {
    if (!info?.secure_url) {
      setImageUploaded(false);
      return;
    }
    setPostDetails((prevDetails) => ({
      ...prevDetails,
      image: info.secure_url,
    }));
    setImageUploaded(true);
  };

  const openCloudinaryWidget = async () => {
    if (!widgetReady || !cloudName || !window.cloudinary) return;

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          apiKey: cloudApiKey,
          sources: ["local", "url", "unsplash"],
          multiple: false,
          maxFiles: 1,
          uploadSignature: async (callback, paramsToSign) => {
            const response = await fetch("/api/sign-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paramsToSign }),
            });
            const data = await response.json();
            callback(data.signature);
          },
        },
        (error, result) => {
          if (!error && result.event === "success") {
            handleImageUpload(result.info);
          }
        }
      );
    }

    widgetRef.current.open();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageUploaded) {
      return;
    }
    const serializablePostDetail = {
      title: postDetail.title,
      description: postDetail.description,
      userId: postDetail.userId,
      image: postDetail.image,
    };
    dispatch(createPost({ postDetail: serializablePostDetail }));
    dispatch(hidePost());
    toast({
      title: "Post created",
      description: "Your post has been created successfully",
      variant: "default",
    });
  };

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/ai-assist', {
        prompt: aiPrompt,
        currentText: postDetail.description,
      });
      setPostDetails(prev => ({
        ...prev,
        description: response.data.text,
      }));
      setShowAiPrompt(false);
      setAiPrompt("");
      toast({
        title: "AI Assist",
        description: "Text generated successfully",
      });
    } catch (error) {
      const message = error.response?.data?.error || "Failed to generate text";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleGrammarCheck = async () => {
    if (!postDetail.description.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/grammar-check', {
        text: postDetail.description,
      });
      setPostDetails(prev => ({
        ...prev,
        description: response.data.improvedText,
      }));
      toast({
        title: "Grammar Check",
        description: "Text improved successfully",
      });
    } catch (error) {
      const message = error.response?.data?.error || "Failed to improve text";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleTranslate = async () => {
    if (!postDetail.description.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/translate', {
        text: postDetail.description,
        targetLanguage,
      });
      setPostDetails(prev => ({
        ...prev,
        description: response.data.translatedText,
      }));
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
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center relative p-5 flex-col bg-indigo-800 rounded-md shadow-md dark:bg-gray-800"
    >
      <div className="flex w-full">
        <label htmlFor="title" className="w-full text-white dark:text-gray-200">
          Title:
          <input
            type="text"
            name="title"
            id="title"
            value={postDetail.title}
            onChange={handleChnage}
            className="w-full px-3 py-2 placeholder-gray-400 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            placeholder="Title"
            required
          />
        </label>
      </div>
      <div className="flex w-full mt-4">
        <label
          htmlFor="description"
          className="w-full text-white dark:text-gray-200"
        >
          Description:
          <textarea
            name="description"
            id="description"
            rows="3"
            cols={50}
            value={postDetail.description}
            onChange={handleChnage}
            className="w-full px-3 py-2 placeholder-gray-400 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            placeholder="Description"
            required
          ></textarea>
        </label>
      </div>
      <div className="flex w-full mt-4 space-x-2">
        <button
          type="button"
          onClick={() => setShowAiPrompt(!showAiPrompt)}
          className="px-3 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          AI Writing Assistant
        </button>
        <button
          type="button"
          onClick={handleGrammarCheck}
          className="px-3 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          disabled={loading || !postDetail.description.trim()}
        >
          Improve Text
        </button>
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
          type="button"
          onClick={handleTranslate}
          className="px-3 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
          disabled={loading || !postDetail.description.trim()}
        >
          Translate
        </button>
      </div>
      {showAiPrompt && (
        <div className="flex w-full mt-4">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Enter prompt for AI assistance"
            className="flex-1 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={handleAiAssist}
            className="px-4 py-2 text-white bg-blue-600 rounded-r-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !aiPrompt.trim()}
          >
            Generate
          </button>
        </div>
      )}
      <div className="flex w-full mt-4">
        <div className="flex w-full mt-4">
          {cloudName ? (
            <button
              type="button"
              className="w-full px-3 py-2 text-white bg-gray-700 border dark:bg-indigo-600   rounded-md font-semibold text-xs uppercase tracking-widest hover:bg-gray-900 dark:hover:bg-indigo-700 disabled:opacity-25 transition ease-in-out duration-150"
              disabled={!postDetail.title.trim() || !postDetail.description.trim() || !widgetReady}
              onClick={openCloudinaryWidget}
            >
              {widgetReady ? "Upload Image" : "Loading upload widget..."}
            </button>
          ) : (
            <div className="text-sm text-yellow-200">
              Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.
            </div>
          )}
        </div>
      </div>
      <div className="flex w-full mt-4">
        <button
          type="submit"
          className="w-full px-3 py-2 text-white bg-black rounded-md"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default TextEdit;
