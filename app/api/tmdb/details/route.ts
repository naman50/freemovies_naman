import { NextRequest, NextResponse } from "next/server";
import { getDetails } from "@/lib/tmdb";
import type { MediaType } from "@/types/media";

export async function GET(request: NextRequest) {
  const type = (request.nextUrl.searchParams.get("type") ?? "movie") as MediaType;
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!id || !["movie", "tv"].includes(type)) {
    return NextResponse.json({ error: "Valid type and id are required" }, { status: 400 });
  }
  const details = await getDetails(type, id);
  if (!details) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ details });
}
