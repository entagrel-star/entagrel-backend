import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Register Admin (only once)
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: { email, password: hashedPassword, name },
  });

  res.json({ message: "Admin registered successfully", admin });
});

// ✅ Login Admin
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return res.status(400).json({ error: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.json({ message: "Login successful", token });
});

export default router;
