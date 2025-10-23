// server.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes";
import blogRoutes from "./routes/blogRoutes";
import seoRoutes from "./routes/seoRoutes";

const app = express();
const prisma = new PrismaClient();

// ✅ Parse incoming JSON
app.use(express.json());

// ✅ Allowed origins for frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://entagrel.com",
  "https://www.entagrel.com",
  "https://api.entagrel.com",
  "https://entagrel-frontend.onrender.com",
];

// ✅ Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Health check
app.get("/healthz", (_req, res) => {
  res.send("Server is healthy 🚀");
});

// ✅ Root endpoint
app.get("/", (_req, res) => {
  res.send("Entagrel Backend is running!");
});

// ✅ Newsletter subscription route
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
    if (err?.code === "P2002") {
      return res.status(400).json({ error: "Email already subscribed" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Attach routes
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/seo", seoRoutes);

// ✅ Handle not found routes
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Start server
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
