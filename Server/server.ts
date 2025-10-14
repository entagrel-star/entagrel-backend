import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

// ✅ Use express.json() instead of body-parser (modern + lighter)
app.use(express.json());

// ✅ CORS: Allow both local dev and your deployed frontend
app.use(cors({
  origin: [
    "http://localhost:5173", // Local Vite dev server
    "https://entagrel-frontend.onrender.com", // Replace this with your actual frontend Render URL
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

// ✅ Health check route for Render
app.get("/healthz", (req, res) => {
  res.send("Server is healthy 🚀");
});

// ✅ Root route (optional)
app.get("/", (req, res) => {
  res.send("Entagrel Backend is running!");
});

// ✅ Newsletter subscription route
app.post("/api/saveEmail", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email is required" });
  }

  try {
    const savedEmail = await prisma.email.create({
      data: { email },
    });

    console.log("✅ New subscriber:", email);
    res.json({ message: "Subscribed successfully!", data: savedEmail });

  } catch (err: any) {
    console.error("❌ Subscription error:", err);

    if (err.code === "P2002") {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Use Render’s dynamic PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
