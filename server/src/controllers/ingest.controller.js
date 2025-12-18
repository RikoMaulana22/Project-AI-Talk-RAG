import { documentStore } from "../store/document.store.js";
import { extractTextFromPdfBuffer } from "../services/pdf.service.js";

export async function uploadPdf(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file PDF yang diunggah (field: file)." });
    }

    // Optional: validasi tipe file
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "File harus PDF." });
    }

    const text = await extractTextFromPdfBuffer(req.file.buffer);

    // Simpan ke store (dibatasi agar stabil / hemat token)
    const cleaned = (text || "").replace(/\n\s*\n/g, "\n").slice(0, 30000);
    documentStore.set(cleaned);

    return res.status(200).json({
      message: "✅ Dokumen berhasil diproses",
      fileName: req.file.originalname,
      charCount: cleaned.length,
      textPreview: cleaned.substring(0, 200) + "...",
    });
  } catch (err) {
    return next(err);
  }
}

// (Opsional) endpoint untuk cek apakah dokumen sudah ada
export function getDocumentStatus(req, res) {
  const ctx = documentStore.get();
  return res.json({
    hasDocument: !!ctx,
    charCount: ctx?.length || 0,
  });
}

// (Opsional) endpoint reset dokumen
export function clearDocument(req, res) {
  documentStore.clear();
  return res.json({ message: "✅ Dokumen dihapus dari memori." });
}
