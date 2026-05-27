"use client";

import { MediaRow } from "@/components/media/media-row";
import { useLibraryStore } from "@/store/library-store";
import type { MediaItem } from "@/types/media";

function favoriteToMedia(item: ReturnType<typeof useLibraryStore.getState>["favorites"][number]): MediaItem {
  return {
    id: item.tmdbId,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    title: item.title,
    overview: "Saved to your local list.",
    posterPath: item.posterPath
  };
}

function historyToMedia(item: ReturnType<typeof useLibraryStore.getState>["history"][number]): MediaItem {
  return {
    id: item.tmdbId,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    title: item.season ? `${item.title} S${item.season}:E${item.episode}` : item.title,
    overview: "Continue where you left off.",
    posterPath: item.posterPath
  };
}

export function ClientLibraryRows({ showContinue = true, showMyList = true }: { showContinue?: boolean; showMyList?: boolean }) {
  const favorites = useLibraryStore((state) => state.favorites);
  const history = useLibraryStore((state) => state.history);

  return (
    <>
      {showContinue && <MediaRow title="Continue Watching" items={history.map(historyToMedia)} />}
      {showMyList && <MediaRow id="my-list" title="My List" items={favorites.map(favoriteToMedia)} />}
    </>
  );
}
