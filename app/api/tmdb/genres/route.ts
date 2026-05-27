import { NextResponse } from "next/server";
import { getGenres } from "@/lib/tmdb";

export async function GET() {
  return NextResponse.json({ genres: await getGenres() });
}
