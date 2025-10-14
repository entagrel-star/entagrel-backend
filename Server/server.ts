// Server/server.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

// Use express.json() to parse JSON body
app.use(express.json());

// Allowed origins - add/remove as needed
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://entagrel.com",
  "https://www.entagrel.com",
  "https://entagrel-frontend.onrender.com"
]);

// CORS middleware that handles preflight and sets proper headers
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;

  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  // Always allow these for preflight and requests
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // If you will use cookies or auth later, keep this true; otherwise can be omitted
  res.header("Access-Control-Allow-Credentials", "true");

  // Respond to preflight requests fast
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Health check for Render or other platforms
app.get("/healthz", (_req, res) => {
  res.send("Server is healthy 🚀");
});

// Root - quick message
app.get("/", (_req, res) => {
  res.send("Entagrel Backend is running!");
});

// Save email endpoint
app.post("/api/saveEmail", async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email is required" });
  }

  try {
    const savedEmail = await prisma.email.create({
      data: { email },
    });

    console.log("✅ New subscriber:", email);
    return res.json({ message: "Subscribed successfully!", data: savedEmail });
  } catch (err: any) {
    console.error("❌ Subscription error:", err);

    // Prisma unique constraint code for duplicate
    if (err?.code === "P2002") {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

// Use Render's dynamic PORT or fallback to 5000
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
