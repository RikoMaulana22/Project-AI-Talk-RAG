import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Konfigurasi OpenAI dengan API Key dari .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    console.log("User bertanya:", message);

    // Panggil API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        { role: "system", content: "Kamu adalah asisten AI yang membantu dan ramah. Jawablah dalam Bahasa Indonesia." },
        { role: "user", content: message },
      ],
    });

    // Ambil isi jawaban dari OpenAI
    const aiResponse = completion.choices[0].message.content;

    // Kirim jawaban ke Frontend
    res.json({
      success: true,
      reply: aiResponse
    });

  } catch (error) {
    console.error("Error OpenAI:", error);
    
    // Penanganan Error 
    let errorMessage = "Terjadi kesalahan pada AI.";
    if (error.status === 401) errorMessage = "API Key tidak valid/salah.";
    if (error.status === 429) errorMessage = "Kuota API habis (Rate Limit).";

    res.status(500).json({ 
      success: false, 
      reply: errorMessage, 
      error: error.message 
    });
  }
};