import { NextRequest, NextResponse } from 'next/server';
import { certificationService } from '@/services/admin/certifications/certificationService';

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    const extractedJSON = await certificationService.extractCertification(input);
    return NextResponse.json(extractedJSON, { status: 200 });
  } catch (err) {
    console.error('❌ Error in extract-certification route:', err);
    return NextResponse.json({ error: 'Failed to extract certification data' }, { status: 500 });
  }
}
