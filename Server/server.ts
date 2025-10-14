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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://entagrel.com",
  "https://www.entagrel.com",
  "https://entagrel-frontend.onrender.com"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin!)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");

  // ✅ Handle preflight (OPTIONS) requests immediately
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});



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
