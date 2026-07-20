import pool from "@/lib/db";

class CoverageService {
  async getAllCoverages() {
    try {
      const query = "SELECT * FROM coverage ORDER BY coverage_label ASC";
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error fetching coverages:", error);
      throw new Error("Failed to load coverage data");
    }
  }
}

export const coverageService = new CoverageService();
