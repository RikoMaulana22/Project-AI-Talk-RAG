import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Sedang mengecek ketersediaan model...");
    // Coba ping sederhana
    const result = await model.generateContent("Tes");
    console.log("✅ Model 'gemini-1.5-flash' BERHASIL diakses!");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("❌ Gagal akses model:", error.message);
    console.log("\n--- TIPS ---");
    console.log("Jika error 404, coba ganti model di chatController.js menjadi 'gemini-pro'");
  }
};

run();
