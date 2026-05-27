import { promises as fs } from "fs";
import path from "path";
import type { FavoriteItem, ProviderConfig, WatchProgress } from "@/types/media";

type LocalDb = {
  favorites: FavoriteItem[];
  history: WatchProgress[];
  customMedia: FavoriteItem[];
  settings: {
    providers: ProviderConfig[];
    homepageSections: {
      trending: boolean;
      tv: boolean;
      continueWatching: boolean;
      myList: boolean;
    };
  };
};

const dbPath = path.join(process.cwd(), "data", "local-db.json");

const defaultDb: LocalDb = {
  favorites: [],
  history: [],
  customMedia: [],
  settings: {
    providers: [
      {
        id: "vidking",
        name: "VidKing",
        baseUrl: process.env.VIDKING_BASE_URL ?? "https://vidking.example/embed",
        enabled: true
      }
    ],
    homepageSections: {
      trending: true,
      tv: true,
      continueWatching: true,
      myList: true
    }
  }
};

export async function readDb(): Promise<LocalDb> {
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    return { ...defaultDb, ...JSON.parse(raw) };
  } catch {
    await writeDb(defaultDb);
    return defaultDb;
  }
}

export async function writeDb(db: LocalDb) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

export async function updateDb(mutator: (db: LocalDb) => LocalDb) {
  const db = await readDb();
  const next = mutator(db);
  await writeDb(next);
  return next;
}
