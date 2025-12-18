<script setup>
import { ref, nextTick } from 'vue';
import axios from 'axios';
import MarkdownIt from 'markdown-it';

// --- CONFIG ---
const API_URL = 'http://localhost:3000/api/chat'; // Pastikan port 3000
const md = new MarkdownIt();

// --- STATE ---
const userInput = ref('');
const messages = ref([
  { role: 'assistant', content: 'Halo! Upload PDF Anda, dan saya siap menjawab pertanyaan mengenainya.' }
]);
const isLoading = ref(false);
const isUploading = ref(false);
const documentStatus = ref('');
const chatWindow = ref(null);

// --- FUNCTIONS ---

const scrollToBottom = async () => {
  await nextTick();
  if (chatWindow.value) chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  isUploading.value = true;
  documentStatus.value = 'Sedang membaca PDF...';

  try {
    // Endpoint Upload yang Baru
    const res = await axios.post(`${API_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    documentStatus.value = `✅ ${file.name} siap! (${res.data.charCount} karakter)`;
    messages.value.push({ role: 'assistant', content: `Saya sudah membaca dokumen **${file.name}**. Silakan tanya apa saja!` });
    scrollToBottom();
  } catch (error) {
    console.error("Upload error:", error);
    documentStatus.value = '❌ Gagal membaca dokumen.';
    alert("Gagal upload: Pastikan backend berjalan di port 3000");
  } finally {
    isUploading.value = false;
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const userMsg = userInput.value;
  messages.value.push({ role: 'user', content: userMsg });
  userInput.value = '';
  isLoading.value = true;
  scrollToBottom();

  try {
    // Endpoint Chat yang Baru
    const response = await axios.post(`${API_URL}/send`, {
      message: userMsg
    });

    messages.value.push({
      role: 'assistant',
      content: response.data.reply
    });
  } catch (error) {
    console.error(error);
    messages.value.push({
      role: 'assistant',
      content: '⚠️ *Terjadi kesalahan koneksi atau API Key bermasalah.*'
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
    <!-- Header -->
    <header class="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center shadow-lg">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <h1 class="text-lg font-bold text-white tracking-wide">Gemini RAG v2.0</h1>
      </div>

      <div class="flex items-center gap-4">
        <span v-if="documentStatus" class="text-xs font-mono text-emerald-400 bg-gray-900 px-2 py-1 rounded">
          {{ documentStatus }}
        </span>
        <label
          class="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span v-if="!isUploading">Upload PDF</span>
          <span v-else>Processing...</span>
          <input type="file" class="hidden" @change="handleFileUpload" accept=".pdf" :disabled="isUploading" />
        </label>
      </div>
    </header>

    <!-- Chat Area -->
    <!-- Chat Area -->
    <main class="flex-1 overflow-y-auto px-4 py-6" ref="chatWindow">
      <div class="max-w-5xl mx-auto space-y-4">
        <div v-for="(msg, index) in messages" :key="index"
          :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
          <div :class="[
            'w-full sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%]',
            'px-4 py-3 rounded-2xl border shadow-sm',
            msg.role === 'user'
              ? 'bg-blue-600 text-white border-blue-500 rounded-tr-md'
              : 'bg-gray-800 text-gray-100 border-gray-700 rounded-tl-md'
          ]">
            <div v-if="msg.role === 'assistant'" class="markdown-body text-sm leading-6"
              v-html="md.render(msg.content)" />
            <div v-else class="text-sm leading-6 whitespace-pre-wrap">
              {{ msg.content }}
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-md border border-gray-700 text-sm text-gray-300">
            AI sedang berpikir...
          </div>
        </div>
      </div>
    </main>

    <!-- Input Area -->
    <footer class="bg-gray-900/70 border-t border-gray-800 backdrop-blur sticky bottom-0">
      <div class="max-w-5xl mx-auto px-4 py-4">
        <div class="flex gap-2">
          <input v-model="userInput" @keyup.enter="sendMessage" type="text"
            placeholder="Tanyakan sesuatu tentang PDF..."
            class="flex-1 bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
            :disabled="isLoading" />
          <button @click="sendMessage" :disabled="isLoading || !userInput.trim()"
            class="min-w-[92px] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold transition">
            Kirim
          </button>
        </div>
      </div>
    </footer>


    <!-- Input Area -->
    
  </div>
</template>

<style>
/* CSS Reset untuk Markdown agar rapi di dark mode */
.markdown-body p {
  margin-bottom: 0.75em;
}

.markdown-body ul,
.markdown-body ol {
  margin-left: 1.25em;
  margin-bottom: 0.75em;
}

.markdown-body li {
  margin: 0.25em 0;
}

.markdown-body code {
  background: #111827;
  border: 1px solid #374151;
  padding: 0.15em 0.35em;
  border-radius: 6px;
  /* ✅ bukan 'rounded' */
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.9em;
}

.markdown-body pre {
  background: #0b1220;
  border: 1px solid #243043;
  padding: 0.9em;
  border-radius: 12px;
  /* ✅ bukan 'rounded' */
  overflow-x: auto;
  margin: 0.75em 0;
}

.markdown-body pre code {
  background: transparent;
  border: none;
  padding: 0;
}
</style>
