import { NextRequest, NextResponse } from 'next/server';
import { plantService } from '@/services/plants/plantService';

export async function GET(req: NextRequest) {
  const coverageId = req.nextUrl.searchParams.get('coverageId');

  if (!coverageId) {
    return NextResponse.json({ error: 'coverageId required' }, { status: 400 });
  }

  try {
    const form = await plantService.getPlantFormByCoverageId(coverageId);
    return NextResponse.json(form);
  } catch (error) {
    console.error("GET form error:", error);
    return NextResponse.json({ error: "Failed to fetch plant form" }, { status: 500 });
  }
}