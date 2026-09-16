import { NextRequest, NextResponse } from 'next/server';
import { plantService } from '@/services/plants/plantService';
import { getSessionUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Previously unauthenticated: any plant's full details were readable by
    // id. The lookup is now scoped to plants this user operates, and a plant
    // that exists but belongs to someone else returns 404 rather than 403 so
    // this does not leak which plant ids exist.
    const userSub = await getSessionUser(req);

    const { id: plantId } = await context.params;
    const parsedId = parseInt(plantId, 10);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid plant ID' }, { status: 400 });
    }

    const plantDetails = await plantService.getPlantDetailsById(userSub, parsedId);
    return NextResponse.json(plantDetails);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    if (error instanceof Error && error.message === 'Plant not found') {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    console.error('Error fetching plant details:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
