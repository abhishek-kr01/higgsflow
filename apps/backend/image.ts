import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function createImage(
  userPrompt: string,
  imageUrl: string,
  outputFile: string,
) {
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  const imageBase64 = Buffer.from(response.data).toString("base64");

  const prompt = [
    {
      type: "text",
      text: "Create a left side profile for this user. Given the image, create a profile headshot from the left side of this user",
    },
    {
      type: "image",
      mime_type: "image/png",
      data: imageBase64,
    },
  ];

  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-image",
    input: prompt,
  });
  const generatedImage = interaction.output_image;
  if (generatedImage) {
    const buffer = Buffer.from(generatedImage.data!, "base64");
    fs.writeFileSync("./assets/gemini-native-image.png", buffer);
    console.log("Image saved as gemini-native-image.png");
  }
}
