// import axios from "axios";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export const extractResumeText = async (resumeUrl) => {
//   try {
//     // 1. Download PDF
//     const pdfBuffer = (
//       await axios.get(resumeUrl, { responseType: "arraybuffer" })
//     ).data;

//     // 2. Convert PDF buffer → base64
//     const base64Pdf = Buffer.from(pdfBuffer).toString("base64");

//     // 3. Create Gemini model
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash",
//     });

//     // 4. Send base64 PDF directly to Gemini
//     const result = await model.generateContent({
//       contents: [
//         {
//           role: "user",
//           parts: [
//             { text: "Extract all text from this resume PDF. Return plain text only." },
//             {
//               inlineData: {
//                 mimeType: "application/pdf",
//                 data: base64Pdf,
//               },
//             },
//           ],
//         },
//       ],
//     });

//     const extractedText = result.response.text();

//     return extractedText;

//   } catch (error) {
//     console.log("Resume OCR Error:", error);
//     throw new Error("Gemini OCR failed");
//   }
// };


const originalWarn = console.warn;
console.warn = (...args) => {
    // Suppress specific PDF warnings we don't care about
    if (
        args[0] && 
        typeof args[0] === 'string' && 
        (args[0].includes("Unsupported: field.type") || args[0].includes("Fake worker"))
    ) {
        return;
    }
    originalWarn.apply(console, args);
};
import axios from "axios";
import PDFParser from "pdf2json";

/**
 * HELPER: Converts Google Drive View URL to Direct Download URL
 */
const convertToDownloadUrl = (url) => {
  // Regex to extract the File ID from common Drive URL patterns
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  
  if (match && match[1]) {
    const fileId = match[1];
    // This endpoint forces a file download instead of opening the viewer
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  // If it's not a Google Drive link, return it as-is
  return url;
};

/**
 * HELPER: Safe Text Decoding
 */
const decodeText = (text) => {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    return text;
  }
};

/**
 * PARSER: Manually extracts text to avoid library crashes
 */
const parsePdfBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (errData) => reject(new Error(errData.parserError)));

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        let fullText = "";
        if (!pdfData || !pdfData.Pages) {
          resolve("");
          return;
        }

        pdfData.Pages.forEach((page) => {
          if (page.Texts) {
            page.Texts.forEach((textBlock) => {
              if (textBlock.R && textBlock.R.length > 0) {
                const rawString = textBlock.R[0].T;
                fullText += decodeText(rawString) + " ";
              }
            });
          }
          fullText += "\n";
        });
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
};

export const extractResumeText = async (resumeUrl) => {
  try {
    if (!resumeUrl) throw new Error("Resume URL is missing");

    // 1. CONVERT THE URL
    const downloadUrl = convertToDownloadUrl(resumeUrl);
    console.log("⬇️ Downloading from:", downloadUrl);

    // 2. DOWNLOAD
    const response = await axios.get(downloadUrl, { 
      responseType: "arraybuffer" 
    });

    // 3. PARSE
    const extractedText = await parsePdfBuffer(response.data);

    // 4. CLEAN
    const cleanText = extractedText.replace(/\s+/g, " ").trim();
    
    if (!cleanText) throw new Error("Extracted text is empty");

    return cleanText;

  } catch (err) {
    console.error("❌ PDF Extract Error:", err.message);
    throw new Error("Failed to process resume. Please ensure the file is 'Public' or 'Anyone with the link'.");
  }
};