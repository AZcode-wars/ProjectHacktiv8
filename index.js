import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
// import fs from "fs/promises";
const app = express();
const upload = multer();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const GEMINI_MODEL = "gemini-3.5-flash";

app.use(express.json());

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post("/generate-text", async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    res.status(200).json({ text: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  const { prompt } = req.body;
  const base64Image = req.file.buffer.toString("base64");
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt, type: "text" },
        { inlineData: { data: base64Image, mimeType: req.file.mimetype } },
      ],
    });
    res.status(200).json({ text: response.text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});
// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-3.5-flash",
//     contents: "kalau boleh tau, nama asli kamu siapa sih? kok kamu bisa ada?",
//   });

//   console.log(response.text);
// }

// main();
