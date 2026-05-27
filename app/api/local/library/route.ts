import { NextRequest, NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/local-db";
import type { FavoriteItem } from "@/types/media";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ favorites: db.favorites, customMedia: db.customMedia });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as FavoriteItem & { action?: "add" | "remove"; custom?: boolean };
  const db = await updateDb((current) => {
    const key = body.custom ? "customMedia" : "favorites";
    const filtered = current[key].filter((item) => !(item.tmdbId === body.tmdbId && item.mediaType === body.mediaType));
    return {
      ...current,
      [key]: body.action === "remove" ? filtered : [{ ...body, addedAt: body.addedAt ?? new Date().toISOString() }, ...filtered]
    };
  });
  return NextResponse.json({ favorites: db.favorites, customMedia: db.customMedia });
}
