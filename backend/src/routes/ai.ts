import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { GoogleGenAI } from "@google/genai";
import * as chrono from "chrono-node";

const router = Router();

// All routes require signed-in user
router.use(requireAuth);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const MODEL_ID = process.env.GEMINI_MODEL_ID || "gemini-2.5-flash";

const systemPrompt = `Today Date: ${new Date().toLocaleDateString()} You are a helpful assistant that turns a short user todo or reminder into a crisp task suggestion.
Respond ONLY as strict JSON with keys: title, description. No markdown, no extra keys. 
- "title": 5-9 words, action-oriented and specific.
- "description": a single sentence with concrete next action and channel (email/slack/call) if obvious.
Example input: "follow up with designer"
Example output: {"title":"Follow up with UI Designer","description":"Send a Slack message to confirm wireframe delivery status."}`;

/**
 * POST /api/ai/suggest
 * body: { text: string }
 * returns: { title, description, deadline_iso|null, deadline_source_text|null }
 */
router.post("/suggest", async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { text } = req.body as { text?: string };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ message: "text is required" });
    }

    // Generate title and description via Gemini
    const gen = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\nUser input: ${text.trim()}` }],
        },
      ],
    });

    const raw = gen.text?.trim() || "";
    // Ensure we parse JSON even if model added stray text
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      return res.status(502).json({ message: "AI response parse error" });
    }

    let parsed: { title?: string; description?: string } = {};
    try {
      parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    } catch {
      return res.status(502).json({ message: "AI response invalid JSON" });
    }

    const title = (parsed.title || "").toString().trim();
    const description = (parsed.description || "").toString().trim();

    if (!title || !description) {
      return res.status(502).json({ message: "AI response missing fields" });
    }

    // Extract deadline using chrono from user text
    const results = chrono.parse(text, new Date());
    let deadlineISO: string | null = null;
    let deadlineSource: string | null = null;

    if (results && results.length > 0) {
      // Choose the first parsed date range
      const first = results[0];
      const dt = first.date();
      if (!isNaN(dt.getTime())) {
        deadlineISO = dt.toISOString();
        deadlineSource = first.text; // the matched substring
      }
    }

    return res.json({
      input: text,
      suggestion: {
        title,
        description,
      },
      deadline_iso: deadlineISO,
      deadline_source_text: deadlineSource,
      created_for_user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("AI suggest error:", e);
    }
    return res.status(500).json({ message: "Failed to generate suggestion" });
  }
});

export default router;
