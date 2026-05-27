"use client";

import { Heart } from "lucide-react";
import { useLibraryStore } from "@/store/library-store";
import type { FavoriteItem } from "@/types/media";
import { cn } from "@/lib/utils";

export function FavoriteButton({ item }: { item: FavoriteItem }) {
  const favorites = useLibraryStore((state) => state.favorites);
  const addFavorite = useLibraryStore((state) => state.addFavorite);
  const removeFavorite = useLibraryStore((state) => state.removeFavorite);
  const active = favorites.some((entry) => entry.tmdbId === item.tmdbId && entry.mediaType === item.mediaType);

  return (
    <button
      onClick={() => (active ? removeFavorite(item.tmdbId, item.mediaType) : addFavorite({ ...item, addedAt: new Date().toISOString() }))}
      className={cn("inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10", active && "border-rose-500 bg-rose-500/15 text-rose-100")}
    >
      <Heart className={cn("h-5 w-5", active && "fill-rose-500 text-rose-500")} />
      {active ? "In My List" : "Add to My List"}
    </button>
  );
}
