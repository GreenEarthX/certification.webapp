import { NextRequest, NextResponse } from 'next/server';
import { plantService } from '@/services/plants/plantService';
import { getSessionUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    // Only requested from authenticated plant-operator pages.
    await getSessionUser(req);

    const schema = await plantService.getManagePlantFormSchema();
    return NextResponse.json(schema, { status: 200 });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    console.error('❌ Failed to fetch form schema:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
