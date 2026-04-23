import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "@/db/db.config";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const base64UrlEncode = (input) => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(JSON.stringify(input));
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const base64UrlDecode = (input) => {
  const data = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = data + "=".repeat((4 - (data.length % 4)) % 4);
  return Buffer.from(padded, "base64");
};

const signJwt = (payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  return `${encodedHeader}.${encodedPayload}.${base64UrlEncode(signature)}`;
};

const verifyJwt = (token, secret) => {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const expectedSignature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const signature = base64UrlDecode(encodedSignature);

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(signature, expectedSignature)
  ) {
    throw new Error("Invalid token");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
  return payload;
};

export const POST = async (req) => {
  try {
    const { email, password } = await req.json();

    if ([email, password].some((field) => field?.trim() === "")) {
      return NextResponse.json({
        message: "Please fill all the fields",
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found", status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid password", status: 400 });
    }

    const authToken = signJwt({ id: user.id }, JWT_SECRET);

    cookies().set("authToken", authToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      status: 200,
      message: "User logged in successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: error.message || "Something went wrong",
      status: 400,
    });
  }
};

export const GET = async () => {
  try {
    const authToken = cookies().get("authToken")?.value || "";

    if (!authToken) {
      return NextResponse.json({
        message: "Please login to continue",
        status: 400,
      });
    }

    const data = verifyJwt(authToken, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: data.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        posts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found", status: 400 });
    }

    return NextResponse.json({
      status: 200,
      message: "User fetch successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: error.message || "Something went wrong",
      status: 400,
    });
  }
};