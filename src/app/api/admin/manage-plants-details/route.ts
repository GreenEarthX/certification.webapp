import { NextRequest, NextResponse } from 'next/server';
import { plantService } from '@/services/plants/plantService';
import { requireAdminUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const body = await req.json();
    await plantService.upsertPlantForm(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    console.error("POST form error:", error);
    return NextResponse.json({ error: "Failed to save plant form" }, { status: 500 });
  }
}
