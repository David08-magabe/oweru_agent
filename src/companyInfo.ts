import { pool } from "./db";

export interface CompanyInfo {
  aboutText: string;
  services: string[];
}

/**
 * Reads Oweru's company description and service list from the database.
 * Editable directly via pgAdmin (UPDATE company_info SET ...) — no code
 * change or redeploy needed to update what the assistant says about
 * the company.
 */
export async function getCompanyInfo(): Promise<CompanyInfo | null> {
  const result = await pool.query<{ about_text: string; services: string[] }>(
    `SELECT about_text, services FROM company_info ORDER BY id LIMIT 1`
  );
  if (result.rows.length === 0) return null;
  return {
    aboutText: result.rows[0].about_text,
    services: result.rows[0].services,
  };
}
