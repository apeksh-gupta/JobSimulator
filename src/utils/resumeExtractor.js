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
import fs from "fs"; 
import path from "path";

// Helper to convert Drive URL
const convertToDownloadUrl = (url) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  return url;
};

// Safe Text Decoder
const decodeText = (text) => {
  try { return decodeURIComponent(text); } catch (e) { return text; }
};

// Parser Logic
const parsePdfBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on("pdfParser_dataError", (errData) => reject(new Error(errData.parserError)));
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        let fullText = "";
        if (!pdfData || !pdfData.Pages) { resolve(""); return; }
        pdfData.Pages.forEach((page) => {
          if (page.Texts) {
            page.Texts.forEach((textBlock) => {
              if (textBlock.R && textBlock.R.length > 0) {
                fullText += decodeText(textBlock.R[0].T) + " ";
              }
            });
          }
          fullText += "\n";
        });
        resolve(fullText);
      } catch (err) { reject(err); }
    });
    pdfParser.parseBuffer(buffer);
  });
};

export const extractResumeText = async (resumeSource) => {
  try {
    if (!resumeSource) throw new Error("Resume source is missing");

    let pdfBuffer;

    // 1. RESOLVE ABSOLUTE PATH (Fixes "File not found" errors)
    // This handles cases where 'uploads/' is relative to root
    const absolutePath = path.resolve(process.cwd(), resumeSource);

    // SCENARIO 1: Local File
    if (fs.existsSync(absolutePath)) {
      console.log("📂 Reading local file:", absolutePath);
      pdfBuffer = fs.readFileSync(absolutePath);
    } 
    // SCENARIO 2: URL (Drive/Cloud)
    else if (resumeSource.startsWith("http")) {
      const downloadUrl = convertToDownloadUrl(resumeSource);
      console.log("⬇️ Downloading from URL:", downloadUrl);
      const response = await axios.get(downloadUrl, { responseType: "arraybuffer" });
      pdfBuffer = response.data;
    } 
    // FAILURE
    else {
      // Log the failed path to help you debug
      console.error("❌ File not found at:", absolutePath);
      throw new Error(`Invalid resume path. File not found on server.`);
    }

    const extractedText = await parsePdfBuffer(pdfBuffer);
    const cleanText = extractedText.replace(/\s+/g, " ").trim();
    
    if (!cleanText) throw new Error("Extracted text is empty");

    return cleanText;

  } catch (err) {
    console.error("❌ PDF Extract Error:", err.message);
    throw new Error("Failed to read resume file: " + err.message);
  }
};