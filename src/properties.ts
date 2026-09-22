import { pool } from "./db";

/**
 * Returns distinct regions/neighborhoods where Oweru has available
 * listings, with counts — used by the general assistant to answer
 * "which areas do you operate in?" without exposing individual listing
 * search (that lives in the full assistant on rental.oweru.com).
 */
export interface ServiceArea {
  region: string;
  neighborhood: string | null;
  propertyCount: number;
}

export async function getServiceAreas(): Promise<ServiceArea[]> {
  const result = await pool.query<{
    region: string;
    neighborhood: string | null;
    property_count: string;
  }>(
    `SELECT region, neighborhood, COUNT(*) as property_count
     FROM properties
     WHERE status = 'available'
     GROUP BY region, neighborhood
     ORDER BY region, neighborhood`
  );
  return result.rows.map((r) => ({
    region: r.region,
    neighborhood: r.neighborhood,
    propertyCount: Number(r.property_count),
  }));
}
