import { pool } from "./db";

export interface MjengoMember {
  id: number;
  full_name: string;
  phone_number: string;
  monthly_target_amount: string;
  total_goal_amount: string | null;
  start_date: string;
  status: "interested" | "active" | "completed" | "paused";
}

export interface MjengoProgress {
  member: {
    fullName: string;
    phoneNumber: string;
    monthlyTargetAmount: number;
    totalGoalAmount: number | null;
    startDate: string;
    status: string;
  };
  totalContributed: number;
  contributionCount: number;
  lastContributionDate: string | null;
  percentComplete: number | null; // null if no total_goal_amount set
}

/**
 * Looks up a Mjengo Challenge member by phone number and summarizes
 * their contribution progress so far.
 */
export async function getMemberProgressByPhone(
  phoneNumber: string
): Promise<MjengoProgress | null> {
  const memberResult = await pool.query<MjengoMember>(
    `SELECT * FROM mjengo_members WHERE phone_number = $1 LIMIT 1`,
    [phoneNumber]
  );
  const member = memberResult.rows[0];
  if (!member) return null;

  const contribResult = await pool.query<{
    total: string | null;
    count: string;
    last_date: string | null;
  }>(
    `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count, MAX(contribution_date) as last_date
     FROM mjengo_contributions WHERE member_id = $1`,
    [member.id]
  );

  const totalContributed = Number(contribResult.rows[0].total ?? 0);
  const totalGoal = member.total_goal_amount ? Number(member.total_goal_amount) : null;

  return {
    member: {
      fullName: member.full_name,
      phoneNumber: member.phone_number,
      monthlyTargetAmount: Number(member.monthly_target_amount),
      totalGoalAmount: totalGoal,
      startDate: member.start_date,
      status: member.status,
    },
    totalContributed,
    contributionCount: Number(contribResult.rows[0].count),
    lastContributionDate: contribResult.rows[0].last_date,
    percentComplete: totalGoal ? Math.round((totalContributed / totalGoal) * 1000) / 10 : null,
  };
}

export interface RegisterMjengoInterestInput {
  fullName: string;
  phoneNumber: string;
  monthlyTargetAmount?: number;
}

/**
 * Registers a new person's interest in joining Mjengo Challenge. Creates
 * the member with status 'interested' — the Oweru team follows up to
 * formally activate them (status -> 'active') once contributions begin.
 * If the phone number already exists, returns the existing member as-is
 * rather than creating a duplicate.
 */
export async function registerMjengoInterest(
  input: RegisterMjengoInterestInput
): Promise<{ member: MjengoMember; alreadyExisted: boolean }> {
  const existing = await pool.query<MjengoMember>(
    `SELECT * FROM mjengo_members WHERE phone_number = $1 LIMIT 1`,
    [input.phoneNumber]
  );
  if (existing.rows[0]) {
    return { member: existing.rows[0], alreadyExisted: true };
  }

  const result = await pool.query<MjengoMember>(
    `INSERT INTO mjengo_members (full_name, phone_number, monthly_target_amount, status)
     VALUES ($1, $2, $3, 'interested')
     RETURNING *`,
    [input.fullName, input.phoneNumber, input.monthlyTargetAmount ?? 100000]
  );
  return { member: result.rows[0], alreadyExisted: false };
}
