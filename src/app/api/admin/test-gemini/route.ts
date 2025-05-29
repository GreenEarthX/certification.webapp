import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY!;
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: input }] }]
      })
    });

    const data = await res.json();

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    // 🔍 Clean & Parse Gemini's markdown-wrapped JSON
    const cleaned = rawText.trim().replace(/^```json/, '').replace(/```$/, '');
    const extractedJSON = JSON.parse(cleaned);

    return NextResponse.json(extractedJSON, { status: 200 });
  } catch (err) {
    console.error('❌ Error extracting Gemini content:', err);
    return NextResponse.json({ error: 'Failed to extract certification data' }, { status: 500 });
  }
}
