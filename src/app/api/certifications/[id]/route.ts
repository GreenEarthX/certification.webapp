import { NextRequest, NextResponse } from 'next/server';
import { certificationService } from '@/services/certifications/certificationService';
import { getSessionUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Previously unauthenticated: any certification was readable by id.
    // TODO: also scope to certifications on the caller's own plants; this
    // needs the certifications -> plants -> operator join verified first.
    await getSessionUser(request);

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Certification ID is required' },
        { status: 400 }
      );
    }

    const certification = await certificationService.getCertificationById(id);

    if (!certification) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    return NextResponse.json(certification);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    console.error('Error fetching certification:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
