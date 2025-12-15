// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';

// Load konfigurasi .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Agar Vue (port beda) bisa akses server ini
app.use(express.json()); // Agar bisa baca JSON dari request body

// Routing
// Semua route di chatRoutes akan diawali dengan /api
app.use('/api', chatRoutes);

// Route Cek Kesehatan Server
app.get('/', (req, res) => {
  res.send('Server AI berjalan dengan aman! 🚀');
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});