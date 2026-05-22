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

// Endpoint universal untuk semua jenis file (Gambar, Dokumen, Audio, Video)
app.post("/generate-from-file", upload.single("file"), async (req, res) => {
  try {
    // 1. Validasi apakah file benar-benar diunggah
    if (!req.file) {
      return res.status(400).json({
        message: "Tidak ada file yang diunggah. Pastikan key bernama 'file'.",
      });
    }

    const { prompt } = req.body;
    const mimeType = req.file.mimetype;
    const base64Data = req.file.buffer.toString("base64");

    // 2. Menentukan prompt default otomatis jika user tidak mengisi prompt teks
    let finalPrompt = prompt;
    if (!finalPrompt) {
      if (mimeType.startsWith("image/")) {
        finalPrompt = "Tolong jelaskan gambar ini secara detail.";
      } else if (mimeType.startsWith("audio/")) {
        finalPrompt = "Tolong buatkan transkrip dari rekaman berikut.";
      } else if (mimeType.startsWith("video/")) {
        finalPrompt = "Tolong analisis dan rangkum video ini.";
      } else if (
        mimeType === "application/pdf" ||
        mimeType.includes("document")
      ) {
        finalPrompt = "Tolong buat ringkasan dari dokumen berikut.";
      } else {
        finalPrompt = "Tolong analisis file ini.";
      }
    }

    // 3. Format payload yang 100% BENAR untuk SDK @google/genai terbaru
    // JANGAN gunakan struktur { text: finalPrompt, type: "text" } karena akan membuat server crash!
    const contents = [
      finalPrompt, // Kirimkan teks sebagai string murni
      { inlineData: { data: base64Data, mimeType: mimeType } }, // Data file biner
    ];

    // 4. Hit ke Gemini API
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
    });

    res.status(200).json({ text: response.text });
  } catch (e) {
    console.error("Error pada /generate-from-file:", e); // Log error di terminal agar mudah di-debug
    res.status(500).json({ message: e.message });
  }
});

// app.post("/generate-from-image", upload.single("image"), async (req, res) => {
//   const { prompt } = req.body;
//   const base64Image = req.file.buffer.toString("base64");
//   try {
//     const response = await ai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents: [
//         { text: prompt, type: "text" },
//         { inlineData: { data: base64Image, mimeType: req.file.mimetype } },
//       ],
//     });
//     res.status(200).json({ text: response.text });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ message: e.message });
//   }
// });

// app.post(
//   "/generate-from-document",
//   upload.single("document"),
//   async (req, res) => {
//     const { prompt } = req.body;
//     const base64Document = req.file.buffer.toString("base64");
//     try {
//       const response = await ai.models.generateContent({
//         model: GEMINI_MODEL,
//         contents: [
//           {
//             text: prompt ?? "Tolong buat ringkasan dari dokumen berikut",
//             type: "text",
//           },
//           { inlineData: { data: base64Document, mimeType: req.file.mimetype } },
//         ],
//       });
//       res.status(200).json({ text: response.text });
//     } catch (e) {
//       console.log(e);
//       res.status(500).json({ message: e.message });
//     }
//   },
// );

// app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
//   const base64Audio = req.file.buffer.toString("base64");
//   try {
//     const response = await ai.models.generateContent({
//       model: GEMINI_MODEL,
//       contents: [
//         {
//           text: prompt ?? "Tolong buatkan transkrip dari rekaman berikut",
//           type: "text",
//         },
//         { inlineData: { data: base64Audio, mimeType: req.file.mimetype } },
//       ],
//     });
//     res.status(200).json({ text: response.text });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({ message: e.message });
//   }
// });

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-3.5-flash",
//     contents: "kalau boleh tau, nama asli kamu siapa sih? kok kamu bisa ada?",
//   });

//   console.log(response.text);
// }

// main();
