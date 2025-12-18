import express from "express";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.routes.js";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export function createApp() {
  dotenv.config();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => res.send("✅ API OK"));
  app.use("/api/chat", chatRoutes);

  app.use(errorMiddleware);

  return { app, PORT };
}
