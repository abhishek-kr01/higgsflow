import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.GOOGLE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

function guessMimeType(contentType: string | undefined) {
  if (contentType?.startsWith("image/")) return contentType.split(";")[0];
  return "image/jpeg";
}

export async function createImage(
  userPrompt: string,
  imageUrl: string,
  outputFilePath: string,
) {
  if (!ai) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }

  const response = await axios.get<ArrayBuffer>(imageUrl, {
    responseType: "arraybuffer",
    timeout: 30_000,
    headers: {
      "User-Agent": "HiggsFlow/1.0",
    },
  });

  const imageBase64 = Buffer.from(response.data).toString("base64");
  const mimeType = guessMimeType(response.headers["content-type"]);

  const result = await ai.models.generateContent({
    model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image",
    contents: [
      { text: userPrompt },
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  const parts = result.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error("The image model did not return an image");
  }

  await mkdir(path.dirname(outputFilePath), { recursive: true });
  await writeFile(outputFilePath, Buffer.from(imagePart.inlineData.data, "base64"));

  return {
    filePath: outputFilePath,
    mimeType: "image/png",
  };
}
