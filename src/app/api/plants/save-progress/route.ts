import { plantService } from '@/services/plants/plantService';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    // Previously unauthenticated: anyone could overwrite ANY plant's details
    // by guessing its plant_id. The update is now scoped to plants this user
    // operates (enforced in the SQL WHERE clause).
    const userSub = await getSessionUser(req);

    const { plant_id, data } = await req.json();

    if (!plant_id || !data) {
      return NextResponse.json({ error: 'Missing plant_id or data' }, { status: 400 });
    }

    await plantService.updatePlantDetailsById(userSub, plant_id, data);

    return NextResponse.json({ message: 'Progress saved successfully' });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    if (error instanceof Error && error.message === 'Plant not found') {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    console.error('❌ Autosave failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
