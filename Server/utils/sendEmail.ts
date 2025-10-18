import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SERVICE_USER,
      pass: process.env.EMAIL_SERVICE_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Entagrel Marketing" <${process.env.EMAIL_SERVICE_USER}>`,
    to,
    subject,
    html,
  });
};
