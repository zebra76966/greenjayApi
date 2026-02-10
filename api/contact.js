import { sendMail } from "../lib/graphMailer.js";

export default async function handler(req, res) {
  // ✅ CORS HEADERS (always set first)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const body = `
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}

Message:
${message}
    `;

    await sendMail({
      subject: "New Contact Form Submission",
      body,
      replyTo: email,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("GRAPH ERROR FULL:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Unknown Graph error",
    });
  }
}
