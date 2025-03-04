import { NextResponse } from "next/server";
import recommendationsData from '../../../data/recommendationsData.json'

export async function GET() {
  return NextResponse.json(recommendationsData);
}
