import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store chat history temporarily (for demonstration)
let conversationHistory = [];

router.post("/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // Merge previous messages from frontend with latest message
    const messages = history
      ? history.map(msg => ({
          role: msg.from === "user" ? "user" : "assistant",
          content: msg.text
        }))
      : [];

    messages.push({ role: "user", content: message });

    // Call OpenAI GPT
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 250,
    });

    const reply = response.choices[0].message.content;

    // Optional: store in server-side history
    conversationHistory.push({ role: "user", content: message });
    conversationHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
