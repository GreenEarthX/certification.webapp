import { NextRequest, NextResponse } from 'next/server';
import { plantService } from '@/services/plants/plantService'; 

export async function GET(
  req: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  const { id: plantId } = await context.params;
  const parsedId = parseInt(plantId);

  if (isNaN(parsedId)) {
    return NextResponse.json({ error: 'Invalid plant ID' }, { status: 400 });
  }

  try {
    const plantDetails = await plantService.getPlantDetailsById(parsedId);
    return NextResponse.json(plantDetails);
  } catch (error:any) {
    const msg = error.message === 'Plant not found' ? error.message : 'Internal error';
    const status = error.message === 'Plant not found' ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
