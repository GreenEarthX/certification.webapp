import { NextRequest, NextResponse } from 'next/server';
import { certificationService } from '@/services/admin/certifications/certificationService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const saved = await certificationService.saveCertification(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('❌ Error in save-certification route:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
