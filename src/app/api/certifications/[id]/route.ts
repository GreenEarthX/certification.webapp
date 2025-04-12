import { NextResponse } from 'next/server';
import { certificationService } from '@/services/certifications/certificationService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Certification ID is required' },
      { status: 400 }
    );
  }

  try {
    const certification = await certificationService.getCertificationById(id);

    if (!certification) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    return NextResponse.json(certification);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
