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
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",              // ✅ covers your current Vite port
    "https://entagrel.com",               // ✅ backend custom domain
    "https://www.entagrel.com",           // ✅ www version
    "https://entagrel-frontend.onrender.com" // ✅ Render frontend (if used)
  ],
  methods: ["GET", "POST", "OPTIONS"],     // ✅ allow preflight
  allowedHeaders: ["Content-Type"],        // ✅ allow JSON headers
  credentials: true,                       // ✅ optional: if you send cookies later
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
