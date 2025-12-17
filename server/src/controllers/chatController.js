// server/src/controllers/chatController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    console.log("-----------------------------------------");
    console.log("User bertanya:", message);

    // --- DIAGNOSA OTOMATIS: LIST MODEL YANG TERSEDIA ---
    // Ini akan memunculkan daftar model valid di terminal Anda jika koneksi berhasil
    /* try {
      const modelList = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).run(); 
      // Note: ListModels feature might differ in SDK, but let's focus on the model usage first.
    } catch (e) {} 
    */
   
    // KITA GUNAKAN MODEL YANG PALING STABIL SAAT INI
    // Opsi lain jika ini gagal: "gemini-1.0-pro" atau "gemini-pro"
    const modelName = "gemini-1.5-flash"; 
    
    console.log(`Menggunakan model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini menjawab (sukses):", text.substring(0, 30) + "...");

    res.json({
      success: true,
      reply: text
    });

  } catch (error) {
    console.error("❌ ERROR GEMINI:", error.message);
    
    // Pesan error yang lebih membantu untuk Frontend
    let userMessage = "Maaf, terjadi kesalahan pada AI.";
    if (error.message.includes("404")) {
      userMessage = "Model AI tidak ditemukan. Coba update library atau ganti nama model.";
      console.log("\n💡 TIPS: Coba jalankan 'npm install @google/generative-ai@latest' di folder server.");
    } else if (error.message.includes("API key")) {
      userMessage = "API Key tidak valid.";
    }

    res.status(500).json({ 
      success: false, 
      reply: userMessage,
      error: error.message 
    });
  }
};