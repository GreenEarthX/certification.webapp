import { NextRequest, NextResponse } from 'next/server';
import { certificationService } from '@/services/admin/certifications/certificationService';
import { requireAdminUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const { input } = await req.json();
    const extractedJSON = await certificationService.extractCertification(input);
    return NextResponse.json(extractedJSON, { status: 200 });
  } catch (err) {
    const denied = authErrorResponse(err);
    if (denied) return denied;

    console.error('❌ Error in extract-certification route:', err);
    return NextResponse.json({ error: 'Failed to extract certification data' }, { status: 500 });
  }
}
