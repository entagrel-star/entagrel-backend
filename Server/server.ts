import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

// Configure CORS to allow frontend requests
app.use(cors({
  origin: "http://localhost:5173", // Replace with your Vite dev server URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Save email route
app.post("/api/saveEmail", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const savedEmail = await prisma.email.create({
      data: { email },
    });
    res.json({ message: "Subscribed successfully!", data: savedEmail });
  } catch (err: any) {
    console.error(err);

    if (err.code === "P2002") {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    res.status(500).json({ error: "Failed to subscribe" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
