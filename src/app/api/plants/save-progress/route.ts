import { plantService } from '@/services/plants/plantService'; // adjust path if needed
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { plant_id, data } = await req.json();

    if (!plant_id || !data) {
      return NextResponse.json({ error: 'Missing plant_id or data' }, { status: 400 });
    }

    await plantService.updatePlantDetailsById(plant_id, data);

    return NextResponse.json({ message: 'Progress saved successfully' });
  } catch (error) {
    console.error('❌ Autosave failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
