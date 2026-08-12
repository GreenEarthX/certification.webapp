import { NextRequest, NextResponse } from 'next/server';
import { plantService } from '@/services/plants/plantService';
import { requireAdminUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const coverageId = req.nextUrl.searchParams.get('coverageId');
    if (!coverageId) {
      return NextResponse.json({ error: 'coverageId required' }, { status: 400 });
    }

    const form = await plantService.getPlantFormByCoverageId(coverageId);
    return NextResponse.json(form);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    console.error("GET form error:", error);
    return NextResponse.json({ error: "Failed to fetch plant form" }, { status: 500 });
  }
}