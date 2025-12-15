<script setup>
import { ref } from 'vue';
import axios from 'axios';

// Variabel untuk menyimpan pesan
const inputMessage = ref('');
const messages = ref([
  { text: 'Halo! Ada yang bisa saya bantu?', sender: 'ai' }
]);
const isLoading = ref(false);

// Fungsi Kirim Pesan
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  // 1. Masukkan pesan user ke layar
  messages.value.push({
    text: inputMessage.value,
    sender: 'user'
  });

  const userText = inputMessage.value;
  inputMessage.value = ''; // Kosongkan input
  isLoading.value = true;

  try {
    // 2. Kirim ke Backend (Node.js yang sedang jalan di port 3000)
    const response = await axios.post('http://localhost:3000/api/chat', {
      message: userText
    });

    // 3. Masukkan balasan AI ke layar
    messages.value.push({
      text: response.data.reply,
      sender: 'ai'
    });

  } catch (error) {
    console.error(error);
    messages.value.push({
      text: "Maaf, terjadi kesalahan koneksi ke server.",
      sender: 'ai'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[80vh]">
      
      <div class="bg-blue-600 p-4 text-white font-bold text-lg flex justify-between">
        <span>AI Assistant</span>
        <span class="text-xs bg-blue-500 px-2 py-1 rounded">Vue + Node</span>
      </div>

      <div class="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          class="flex"
          :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div 
            class="max-w-[80%] p-3 rounded-lg text-sm shadow-sm"
            :class="msg.sender === 'user' 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'"
          >
            {{ msg.text }}
          </div>
        </div>
        
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-gray-200 text-gray-500 p-2 rounded-lg text-xs animate-pulse">
            Sedang mengetik...
          </div>
        </div>
      </div>

      <div class="p-4 bg-white border-t border-gray-100">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input 
            v-model="inputMessage" 
            type="text" 
            placeholder="Ketik pesan..." 
            class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            :disabled="isLoading"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            Kirim
          </button>
        </form>
      </div>

    </div>
  </div>
</template>