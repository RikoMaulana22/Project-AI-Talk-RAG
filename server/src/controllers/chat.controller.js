import { documentStore } from "../store/document.store.js";
import { extractTextFromPdfBuffer } from "../services/pdf.service.js";
import { generateAnswer } from "../services/gemini.service.js";

export async function uploadPdf(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File PDF wajib diupload (field: file)." });
    }

    const text = await extractTextFromPdfBuffer(req.file.buffer);
    // Batasi supaya tidak kebesaran (stabil & hemat token)
    documentStore.set(text.slice(0, 30000));

    res.json({
      message: "✅ Dokumen berhasil diproses",
      fileName: req.file.originalname,
      charCount: documentStore.get().length,
    });
  } catch (e) {
    next(e);
  }
}

export async function sendChat(req, res, next) {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Field 'message' wajib diisi." });

    const context = documentStore.get() || "Belum ada dokumen yang diunggah.";

    const prompt = `
Anda adalah asisten AI.
Jawab berdasarkan KONTEKS DOKUMEN jika relevan.
Jika tidak ada di dokumen, jawab jujur bahwa tidak ada di dokumen, lalu boleh beri jawaban umum singkat.

KONTEKS DOKUMEN:
"""
${context}
"""

PERTANYAAN:
${message}
`.trim();

    const reply = await generateAnswer({ prompt });
    res.json({ reply });
  } catch (e) {
    next(e);
  }
}
