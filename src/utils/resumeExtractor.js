import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const extractResumeText = async (resumeUrl) => {
  try {
    // 1. Download PDF
    const pdfBuffer = (
      await axios.get(resumeUrl, { responseType: "arraybuffer" })
    ).data;

    // 2. Convert PDF buffer → base64
    const base64Pdf = Buffer.from(pdfBuffer).toString("base64");

    // 3. Create Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // 4. Send base64 PDF directly to Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Extract all text from this resume PDF. Return plain text only." },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Pdf,
              },
            },
          ],
        },
      ],
    });

    const extractedText = result.response.text();

    return extractedText;

  } catch (error) {
    console.log("Resume OCR Error:", error);
    throw new Error("Gemini OCR failed");
  }
};
