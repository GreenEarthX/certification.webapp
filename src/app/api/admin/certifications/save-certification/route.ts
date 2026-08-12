import { NextRequest, NextResponse } from 'next/server';
import { certificationService } from '@/services/admin/certifications/certificationService';
import { requireAdminUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const body = await req.json();
    const saved = await certificationService.saveCertification(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    // Do not echo the raw error to the client - it leaks internals.
    console.error('❌ Error in save-certification route:', error);
    return NextResponse.json({ error: 'Failed to save certification' }, { status: 500 });
  }
}
