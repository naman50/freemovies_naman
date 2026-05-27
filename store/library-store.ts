"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FavoriteItem, WatchProgress } from "@/types/media";
import type { MediaId } from "@/types/media";

type LibraryState = {
  favorites: FavoriteItem[];
  history: WatchProgress[];
  autoplay: boolean;
  toggleAutoplay: () => void;
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (tmdbId: MediaId, mediaType: FavoriteItem["mediaType"]) => void;
  addHistory: (item: WatchProgress) => void;
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      favorites: [],
      history: [],
      autoplay: true,
      toggleAutoplay: () => set((state) => ({ autoplay: !state.autoplay })),
      addFavorite: (item) =>
        set((state) => ({
          favorites: [item, ...state.favorites.filter((entry) => !(entry.tmdbId === item.tmdbId && entry.mediaType === item.mediaType))]
        })),
      removeFavorite: (tmdbId, mediaType) =>
        set((state) => ({ favorites: state.favorites.filter((item) => !(item.tmdbId === tmdbId && item.mediaType === mediaType)) })),
      addHistory: (item) => set((state) => ({ history: [item, ...state.history.filter((entry) => entry.key !== item.key)].slice(0, 50) }))
    }),
    { name: "homeflix-library" }
  )
);
