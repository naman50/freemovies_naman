import axios from "axios";
import type { MediaDetails, MediaItem, MediaType } from "@/types/media";
import { genreMap, mockTrending, mockTv } from "@/data/mock";

const imdb = axios.create({
  baseURL: process.env.IMDB_API_BASE_URL ?? "https://api.imdbapi.dev",
  timeout: 10000
});

type ImdbImage = {
  url?: string;
  width?: number;
  height?: number;
};

type ImdbRating = {
  aggregateRating?: number;
  voteCount?: number;
};

type ImdbTitle = {
  id: string;
  type?: string;
  primaryTitle?: string;
  originalTitle?: string;
  primaryImage?: ImdbImage;
  startYear?: number;
  endYear?: number;
  runtimeSeconds?: number;
  genres?: string[];
  rating?: ImdbRating;
  plot?: string;
};

type ImdbSeason = {
  season: string;
  episodeCount: number;
};

function toMediaType(type?: string): MediaType {
  return type?.toLowerCase().includes("tv") ? "tv" : "movie";
}

function normalizeTitle(title: ImdbTitle): MediaItem {
  const mediaType = toMediaType(title.type);
  const date = title.startYear ? `${title.startYear}-01-01` : undefined;

  return {
    id: title.id,
    tmdbId: title.id,
    imdbId: title.id,
    mediaType,
    title: title.primaryTitle ?? title.originalTitle ?? "Untitled",
    overview: title.plot ?? "",
    posterPath: title.primaryImage?.url ?? null,
    backdropPath: title.primaryImage?.url ?? null,
    voteAverage: title.rating?.aggregateRating,
    releaseDate: mediaType === "movie" ? date : undefined,
    firstAirDate: mediaType === "tv" ? date : undefined,
    genreIds: title.genres ?? []
  };
}

function mockDetails(type: MediaType, id: string): MediaDetails | null {
  const item = [...mockTrending, ...mockTv].find((entry) => String(entry.tmdbId) === id && entry.mediaType === type);
  return item
    ? {
        ...item,
        runtime: type === "movie" ? 120 : 48,
        genres: genreMap.filter((genre) => item.genreIds?.includes(genre.id))
      }
    : null;
}

export async function getImdbTrending(): Promise<{ trending: MediaItem[]; tv: MediaItem[]; source: "imdbapi" | "mock" }> {
  try {
    const { data } = await imdb.get<{ titles: ImdbTitle[] }>("/titles", {
      params: { limit: 24 }
    });
    const items = data.titles.map(normalizeTitle).filter((item) => item.title && item.posterPath);
    return {
      trending: items,
      tv: items.filter((item) => item.mediaType === "tv"),
      source: "imdbapi"
    };
  } catch {
    return { trending: mockTrending, tv: mockTv, source: "mock" };
  }
}

export async function searchImdb(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  try {
    const { data } = await imdb.get<{ titles: ImdbTitle[] }>("/search/titles", {
      params: { query }
    });
    return data.titles.map(normalizeTitle);
  } catch {
    return [...mockTrending, ...mockTv].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  }
}

export async function getImdbDetails(type: MediaType, id: string): Promise<MediaDetails | null> {
  try {
    const [{ data }, seasonsResponse] = await Promise.all([
      imdb.get<ImdbTitle>(`/titles/${id}`),
      type === "tv" ? imdb.get<{ seasons: ImdbSeason[] }>(`/titles/${id}/seasons`).catch(() => null) : Promise.resolve(null)
    ]);
    const item = normalizeTitle(data);
    return {
      ...item,
      mediaType: type,
      runtime: data.runtimeSeconds ? Math.round(data.runtimeSeconds / 60) : null,
      genres: data.genres?.map((genre) => ({ id: genre, name: genre })) ?? [],
      seasons:
        seasonsResponse?.data.seasons.map((season) => ({
          seasonNumber: Number(season.season),
          episodeCount: season.episodeCount,
          name: `Season ${season.season}`
        })) ?? []
    };
  } catch {
    return mockDetails(type, id);
  }
}

export async function getImdbGenres() {
  try {
    const { data } = await imdb.get<{ titles: ImdbTitle[] }>("/titles", {
      params: { limit: 50 }
    });
    const genres = new Set<string>();
    data.titles.forEach((title) => title.genres?.forEach((genre) => genres.add(genre)));
    return [...genres].sort().map((genre) => ({ id: genre, name: genre }));
  } catch {
    return genreMap;
  }
}
