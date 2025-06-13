import { NextResponse } from 'next/server';
import { plantService } from '@/services/plants/plantService';

export async function GET() {
  try {
    const schema = await plantService.getManagePlantFormSchema();
    return NextResponse.json(schema, { status: 200 });
  } catch (error) {
    console.error('❌ Failed to fetch form schema:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
