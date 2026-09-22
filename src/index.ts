import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { pool } from "./db";
import {
  createConversation,
  getConversationBySession,
  logMessage,
  getRecentMessages,
  recordMessageFeedback,
} from "./conversations";
import { runAgentTurn } from "./agent";
import { getStats } from "./analytics";

const app = express();

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : undefined;
app.use(cors({ origin: allowedOrigins ?? "*" }));

app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_requests", message: "Tafadhali subiri kidogo kabla ya kutuma ujumbe mwingine." },
});

const feedbackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

function requireAdminKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.header("x-admin-key");
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", database: "unreachable" });
  }
});

app.post("/agent/chat", chatLimiter, async (req, res) => {
  try {
    const { sessionId, message } = req.body as { sessionId?: string; message?: string };

    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }

    let conversation = await getConversationBySession(sessionId);
    let conversationId: number;
    if (!conversation) {
      conversationId = await createConversation(sessionId);
    } else {
      conversationId = conversation.id;
    }

    const history = await getRecentMessages(conversationId, 20);
    await logMessage(conversationId, "user", message);

    const result = await runAgentTurn(conversationId, history, message);
    const agentMessageId = await logMessage(conversationId, "agent", result.reply);

    res.json({ reply: result.reply, messageId: agentMessageId });
  } catch (err) {
    console.error("Agent chat failed:", err);
    res.status(500).json({ error: "agent_failed" });
  }
});

app.post("/agent/feedback", feedbackLimiter, async (req, res) => {
  try {
    const { messageId, feedback } = req.body as { messageId?: number; feedback?: "up" | "down" };
    if (!messageId || (feedback !== "up" && feedback !== "down")) {
      return res.status(400).json({ error: "messageId and feedback ('up'|'down') are required" });
    }
    const updated = await recordMessageFeedback(messageId, feedback);
    if (!updated) return res.status(404).json({ error: "message_not_found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Feedback save failed:", err);
    res.status(500).json({ error: "feedback_failed" });
  }
});

app.get("/admin/stats", requireAdminKey, async (_req, res) => {
  try {
    res.json(await getStats());
  } catch (err) {
    console.error("Stats query failed:", err);
    res.status(500).json({ error: "stats_failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Oweru general assistant backend running on http://localhost:${PORT}`);
});
