import { NextRequest, NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/local-db";
import type { WatchProgress } from "@/types/media";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ history: db.history });
}

export async function POST(request: NextRequest) {
  const entry = (await request.json()) as WatchProgress;
  const db = await updateDb((current) => ({
    ...current,
    history: [entry, ...current.history.filter((item) => item.key !== entry.key)].slice(0, 50)
  }));
  return NextResponse.json({ history: db.history });
}

export async function DELETE() {
  const db = await updateDb((current) => ({ ...current, history: [] }));
  return NextResponse.json({ history: db.history });
}
