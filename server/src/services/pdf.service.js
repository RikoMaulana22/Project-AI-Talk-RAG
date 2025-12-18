import { createRequire } from "module";
const require = createRequire(import.meta.url);

// pdf-parse adalah CommonJS, kadang require() mengembalikan function, kadang { default: function }
const pdfParseImport = require("pdf-parse");
const pdfParse = typeof pdfParseImport === "function"
  ? pdfParseImport
  : pdfParseImport?.default;

export async function extractTextFromPdfBuffer(buffer) {
  if (typeof pdfParse !== "function") {
    throw new Error("pdf-parse tidak ter-load sebagai fungsi. Cek versi/interop module.");
  }

  const data = await pdfParse(buffer);
  const text = (data?.text || "").replace(/\n\s*\n/g, "\n");
  return text;
}
