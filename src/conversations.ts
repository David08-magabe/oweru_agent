import { pool } from "./db";

export async function createConversation(sessionId: string): Promise<number> {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO conversations (session_id) VALUES ($1) RETURNING id`,
    [sessionId]
  );
  return result.rows[0].id;
}

export async function getConversationBySession(
  sessionId: string
): Promise<{ id: number } | null> {
  const result = await pool.query(
    `SELECT id FROM conversations WHERE session_id = $1 ORDER BY started_at DESC LIMIT 1`,
    [sessionId]
  );
  return result.rows[0] ?? null;
}

export async function logMessage(
  conversationId: number,
  role: "user" | "agent",
  content: string
): Promise<number> {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING id`,
    [conversationId, role, content]
  );

  if (role === "user") {
    await recordFaqEntry(content);
  }

  return result.rows[0].id;
}

export async function getRecentMessages(
  conversationId: number,
  limit = 10
): Promise<{ role: "user" | "agent"; content: string }[]> {
  const result = await pool.query<{ role: "user" | "agent"; content: string }>(
    `SELECT role, content FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );
  return result.rows;
}

export async function recordMessageFeedback(
  messageId: number,
  feedback: "up" | "down"
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE messages SET feedback = $1 WHERE id = $2 AND role = 'agent'`,
    [feedback, messageId]
  );
  return (result.rowCount ?? 0) > 0;
}

function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

async function recordFaqEntry(rawQuestion: string): Promise<void> {
  const normalized = normalizeQuestion(rawQuestion);
  if (!normalized || normalized.length < 3) return;

  await pool.query(
    `INSERT INTO faq_entries (normalized_question, sample_question, ask_count, first_asked_at, last_asked_at)
     VALUES ($1, $2, 1, now(), now())
     ON CONFLICT (normalized_question)
     DO UPDATE SET ask_count = faq_entries.ask_count + 1, last_asked_at = now()`,
    [normalized, rawQuestion]
  );
}
