import { GoogleGenerativeAI } from "@google/generative-ai";

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY tidak ditemukan di .env");
  return key;
}

function getModelNamePrimary() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

function getModelNameFallback() {
  // fallback bisa Anda atur di .env juga kalau mau
  return process.env.GEMINI_MODEL_FALLBACK || "gemini-pro";
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isOverloaded503(err) {
  const msg = String(err?.message || "");
  return err?.status === 503 || msg.includes("503") || msg.toLowerCase().includes("overloaded");
}

async function generateWithModel(modelName, prompt) {
  const genAI = new GoogleGenerativeAI(getApiKey());
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateAnswer({ prompt }) {
  const primary = getModelNamePrimary();
  const fallback = getModelNameFallback();

  // Retry untuk model utama (exponential backoff)
  const delays = [500, 1200, 2500, 5000]; // ms

  let lastErr;
  for (let i = 0; i < delays.length; i++) {
    try {
      return await generateWithModel(primary, prompt);
    } catch (err) {
      lastErr = err;
      if (!isOverloaded503(err)) break; // kalau bukan 503, jangan retry
      await sleep(delays[i]);
    }
  }

  // Kalau 503 terus, coba fallback model
  try {
    return await generateWithModel(fallback, prompt);
  } catch (err) {
    // lempar error paling jelas
    throw lastErr || err;
  }
}
