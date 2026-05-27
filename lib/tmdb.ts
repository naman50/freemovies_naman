import https from "node:https";
import type { MediaDetails, MediaItem, MediaType } from "@/types/media";
import { genreMap, mockTrending, mockTv } from "@/data/mock";

type TmdbGenre = { id: number; name: string };
type TmdbSeason = { season_number: number; episode_count: number; name: string };
type TmdbItem = {
  id: number;
  imdb_id?: string | null;
  external_ids?: { imdb_id?: string | null };
  media_type?: MediaType;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  vote_average?: number;
  voteAverage?: number;
  release_date?: string;
  releaseDate?: string;
  first_air_date?: string;
  firstAirDate?: string;
  genre_ids?: number[];
  genreIds?: number[];
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: TmdbGenre[];
  seasons?: TmdbSeason[];
};

function apiKey() {
  return process.env.TMDB_API_KEY;
}

function logTmdbFallback(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message.replace(/api_key=[^&\s]+/g, "api_key=***") : String(error);
  console.warn(`${scope}: ${message}`);
}

function normalize(item: TmdbItem, fallbackType?: MediaType): MediaItem {
  const mediaType = (item.media_type === "tv" || item.media_type === "movie" ? item.media_type : fallbackType) ?? "movie";
  return {
    id: item.id,
    tmdbId: item.id,
    imdbId: item.imdb_id ?? null,
    mediaType,
    title: item.title ?? item.name ?? "Untitled",
    name: item.name,
    overview: item.overview ?? "",
    posterPath: item.poster_path ?? item.posterPath ?? null,
    backdropPath: item.backdrop_path ?? item.backdropPath ?? null,
    voteAverage: item.vote_average ?? item.voteAverage,
    releaseDate: item.release_date ?? item.releaseDate,
    firstAirDate: item.first_air_date ?? item.firstAirDate,
    genreIds: item.genre_ids ?? item.genreIds ?? []
  };
}

async function get<T>(url: string, params: Record<string, string | number | undefined> = {}) {
  const key = apiKey();
  if (!key) throw new Error("TMDB_API_KEY is not configured");
  const baseUrl = (process.env.TMDB_API_BASE_URL ?? "https://api.themoviedb.org/3").replace(/\/$/, "");
  const searchParams = new URLSearchParams({
    api_key: key,
    language: "en-US"
  });

  Object.entries(params).forEach(([paramKey, value]) => {
    if (value !== undefined) searchParams.set(paramKey, String(value));
  });

  const requestUrl = `${baseUrl}${url}?${searchParams.toString()}`;
  return getJson<T>(requestUrl);
}

function getJson<T>(requestUrl: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = https.get(requestUrl, { timeout: 10000 }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`TMDB request failed with ${response.statusCode ?? "unknown"}`));
          return;
        }

        try {
          resolve(JSON.parse(body) as T);
        } catch {
          reject(new Error("TMDB returned invalid JSON"));
        }
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error("TMDB request timed out"));
    });
    request.on("error", reject);
  });
}

export async function getTrending(): Promise<{ trending: MediaItem[]; tv: MediaItem[]; source: "tmdb" | "mock" }> {
  try {
    const [mixed, shows] = await Promise.all([
      get<{ results: TmdbItem[] }>("/trending/all/week"),
      get<{ results: TmdbItem[] }>("/tv/popular")
    ]);
    return {
      trending: mixed.results.filter((item) => item.media_type === "movie" || item.media_type === "tv").map((item) => normalize(item)),
      tv: shows.results.map((item) => normalize(item, "tv")),
      source: "tmdb"
    };
  } catch (error) {
    logTmdbFallback("TMDB trending fallback", error);
    return { trending: mockTrending, tv: mockTv, source: "mock" };
  }
}

export async function searchTmdb(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  try {
    const data = await get<{ results: TmdbItem[] }>("/search/multi", { query, include_adult: 0 });
    return data.results
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .map((item) => normalize(item));
  } catch (error) {
    logTmdbFallback("TMDB search fallback", error);
    return [...mockTrending, ...mockTv].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  }
}

export async function getDetails(type: MediaType, id: string): Promise<MediaDetails | null> {
  const resolvedId = await resolveTmdbId(type, id);
  const numericId = Number(resolvedId);
  if (!Number.isFinite(numericId)) return mockDetails(type, id);

  try {
    const data = await get<TmdbItem>(`/${type}/${numericId}`, { append_to_response: "external_ids" });
    return {
      ...normalize({ ...data, media_type: type, imdb_id: data.external_ids?.imdb_id }, type),
      runtime: data.runtime ?? data.episode_run_time?.[0] ?? null,
      numberOfSeasons: data.number_of_seasons,
      numberOfEpisodes: data.number_of_episodes,
      genres: data.genres ?? [],
      seasons: data.seasons?.map((season) => ({
        seasonNumber: season.season_number,
        episodeCount: season.episode_count,
        name: season.name
      }))
    };
  } catch (error) {
    logTmdbFallback("TMDB details fallback", error);
    return mockDetails(type, id);
  }
}

export async function resolveTmdbId(type: MediaType, id: string) {
  if (/^\d+$/.test(id)) return id;
  if (!/^tt\d+$/i.test(id)) return id;

  try {
    const data = await get<{ movie_results?: TmdbItem[]; tv_results?: TmdbItem[] }>(`/find/${id}`, {
      external_source: "imdb_id"
    });
    const match = type === "movie" ? data.movie_results?.[0] : data.tv_results?.[0];
    return match?.id ? String(match.id) : id;
  } catch (error) {
    logTmdbFallback("TMDB external id fallback", error);
    return id;
  }
}

function mockDetails(type: MediaType, id: string): MediaDetails | null {
  const item = [...mockTrending, ...mockTv].find((entry) => String(entry.tmdbId) === id && entry.mediaType === type);
  return item ? { ...item, runtime: type === "movie" ? 120 : 48, genres: genreMap.filter((genre) => item.genreIds?.includes(genre.id)) } : null;
}

export async function getGenres() {
  try {
    const [movie, tv] = await Promise.all([get<{ genres: TmdbGenre[] }>("/genre/movie/list"), get<{ genres: TmdbGenre[] }>("/genre/tv/list")]);
    const merged = new Map<number, string>();
    [...movie.genres, ...tv.genres].forEach((genre) => merged.set(genre.id, genre.name));
    return [...merged.entries()].map(([id, name]) => ({ id, name }));
  } catch (error) {
    logTmdbFallback("TMDB genres fallback", error);
    return genreMap;
  }
}
