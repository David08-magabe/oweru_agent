import { pool } from "./db";

export interface Stats {
  totalConversations: number;
  totalMessages: number;
  messagesLast24h: number;
  conversationsLast7Days: { date: string; count: number }[];
  frequentQuestions: { question: string; count: number; lastAskedAt: string }[];
  mjengoMembersByStatus: { status: string; count: number }[];
  mjengoTotalContributed: number;
}

export async function getStats(): Promise<Stats> {
  const [
    totalConversations,
    totalMessages,
    messagesLast24h,
    conversationsLast7Days,
    frequentQuestions,
    mjengoMembersByStatus,
    mjengoTotalContributed,
  ] = await Promise.all([
    pool.query<{ count: string }>(`SELECT COUNT(*) FROM conversations`),
    pool.query<{ count: string }>(`SELECT COUNT(*) FROM messages`),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM messages WHERE created_at >= now() - interval '24 hours'`
    ),
    pool.query<{ date: string; count: string }>(
      `SELECT to_char(date_trunc('day', started_at), 'YYYY-MM-DD') AS date, COUNT(*)
       FROM conversations
       WHERE started_at >= now() - interval '7 days'
       GROUP BY 1 ORDER BY 1`
    ),
    pool.query<{ sample_question: string; ask_count: number; last_asked_at: string }>(
      `SELECT sample_question, ask_count, last_asked_at
       FROM faq_entries
       ORDER BY ask_count DESC, last_asked_at DESC
       LIMIT 10`
    ),
    pool.query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) FROM mjengo_members GROUP BY status ORDER BY COUNT(*) DESC`
    ),
    pool.query<{ total: string | null }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM mjengo_contributions`
    ),
  ]);

  return {
    totalConversations: Number(totalConversations.rows[0].count),
    totalMessages: Number(totalMessages.rows[0].count),
    messagesLast24h: Number(messagesLast24h.rows[0].count),
    conversationsLast7Days: conversationsLast7Days.rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
    frequentQuestions: frequentQuestions.rows.map((r) => ({
      question: r.sample_question,
      count: Number(r.ask_count),
      lastAskedAt: r.last_asked_at,
    })),
    mjengoMembersByStatus: mjengoMembersByStatus.rows.map((r) => ({
      status: r.status,
      count: Number(r.count),
    })),
    mjengoTotalContributed: Number(mjengoTotalContributed.rows[0].total ?? 0),
  };
}
