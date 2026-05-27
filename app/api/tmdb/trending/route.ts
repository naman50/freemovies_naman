import { NextResponse } from "next/server";
import { getTrending } from "@/lib/tmdb";

export async function GET() {
  const data = await getTrending();
  return NextResponse.json(data);
}
