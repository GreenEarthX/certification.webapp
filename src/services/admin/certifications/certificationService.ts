import pool from '@/lib/db';

class CertificationService {
  private geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  async extractCertification(input: string): Promise<any> {
    try {
      const apiKey = process.env.GEMINI_API_KEY!;
      const response = await fetch(`${this.geminiEndpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }]
        }),
      });

      const data = await response.json();

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const cleaned = rawText.trim().replace(/^```json/, '').replace(/```$/, '');
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('❌ Error extracting certification from Gemini:', error);
      throw new Error('Failed to extract certification data');
    }
  }

  async saveCertification(certData: {
    certification_scheme_name: string;
    overview: object;
    coverage: string;
    certification_details: object;
  }): Promise<any> {
    const {
      certification_scheme_name,
      overview,
      coverage,
      certification_details
    } = certData;

    try {
      const result = await pool.query(
        `INSERT INTO certification_schemes (
          certification_scheme_name,
          overview,
          coverage,
          certification_details
        ) VALUES (
          $1, $2::jsonb, $3, $4::jsonb
        ) RETURNING *`,
        [
          certification_scheme_name,
          JSON.stringify(overview),
          coverage,
          JSON.stringify(certification_details)
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error saving certification to DB:', error);
      throw new Error('Failed to save certification');
    }
  }
}

export const certificationService = new CertificationService();
