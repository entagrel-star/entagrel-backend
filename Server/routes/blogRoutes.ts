import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../utils/authMiddleware";
import { sendEmail } from "../utils/sendEmail";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Get all blogs
router.get("/", async (req, res) => {
  const blogs = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });
  res.json(blogs);
});

// ✅ Get single blog
router.get("/:slug", async (req, res) => {
  const blog = await prisma.blog.findUnique({ where: { slug: req.params.slug } });
  if (!blog) return res.status(404).json({ error: "Blog not found" });
  res.json(blog);
});

// ✅ Create blog (Admin only)
router.post("/", authMiddleware, async (req, res) => {
  const { title, slug, category, description, content, thumbnail } = req.body;

  const blog = await prisma.blog.create({
    data: {
      title,
      slug,
      category,
      description,
      content,
      thumbnail,
      authorId: req.user.id,
    },
  });

  // ✅ Notify all subscribers
  const subscribers = await prisma.email.findMany();
  for (const user of subscribers) {
    await sendEmail(
      user.email,
      `🆕 New Blog: ${title}`,
      `<h3>${title}</h3><p>${description}</p>
       <a href="https://www.entagrel.com/blog/${slug}">Read More →</a>`
    );
  }

  res.json({ message: "Blog published successfully", blog });
});

export default router;
