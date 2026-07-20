import { Prompt } from '@/models/prompt';

export const extractCertificationData = async (file: File, prompt: Prompt) => {
  const text = await file.text();
  const input = `${prompt.template}\n\n--- File Content ---\n${text}`;

  const response = await fetch('/api/admin/certifications/extract-certification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error('Failed to extract certification data');
  }

  return await response.json();
};


export async function submitCertificationData(data: any): Promise<any> {
  const response = await fetch('/api/admin/certifications/save-certification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("❌ Save API error:", errText);
    throw new Error('Failed to save certification data');
  }

  return await response.json();
}
