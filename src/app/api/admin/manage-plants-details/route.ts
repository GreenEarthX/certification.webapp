import { NextRequest, NextResponse } from 'next/server';
import { plantService } from '@/services/plants/plantService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await plantService.upsertPlantForm(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST form error:", error);
    return NextResponse.json({ error: "Failed to save plant form" }, { status: 500 });
  }
}
