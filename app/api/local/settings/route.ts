import { NextRequest, NextResponse } from "next/server";
import { readDb, updateDb } from "@/lib/local-db";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ settings: db.settings });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = await updateDb((current) => ({
    ...current,
    settings: {
      providers: body.providers ?? current.settings.providers,
      homepageSections: body.homepageSections ?? current.settings.homepageSections
    }
  }));
  return NextResponse.json({ settings: db.settings });
}
