import https from "node:https";
import type { MediaDetails, MediaItem, MediaType } from "@/types/media";
import { genreMap, mockTrending, mockTv } from "@/data/mock";

type TmdbGenre = { id: number; name: string };
type TmdbSeason = { season_number: number; episode_count: number; name: string };
type TmdbSpokenLanguage = { iso_639_1: string; english_name?: string; name?: string };
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
  spoken_languages?: TmdbSpokenLanguage[];
};

type TmdbCacheEntry = { expiresAt: number; value: unknown };

class TmdbHttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

const CACHE_SIZE_LIMIT = 500;
const REQUEST_TIMEOUT_MS = 12000;
const RETRY_LIMIT = 3;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const DEFAULT_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, TmdbCacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(error: unknown) {
  if (error instanceof TmdbHttpError) {
    return RETRYABLE_STATUS_CODES.has(error.statusCode);
  }
  return error instanceof Error;
}

function cacheTtl(requestUrl: string) {
  if (requestUrl.includes("/trending/")) return 10 * 60 * 1000;
  if (requestUrl.includes("/genre/")) return 60 * 60 * 1000;
  if (requestUrl.includes("/search/")) return 45 * 1000;
  return DEFAULT_TTL_MS;
}

function setCache(cacheKey: string, value: unknown, ttl: number) {
  if (cache.size >= CACHE_SIZE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(cacheKey, { expiresAt: Date.now() + ttl, value });
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
  const cacheKey = requestUrl;
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }
  cache.delete(cacheKey);

  const ongoing = inFlightRequests.get(cacheKey);
  if (ongoing) return ongoing as Promise<T>;

  const requestPromise = getJsonWithRetry<T>(requestUrl)
    .then((value) => {
      setCache(cacheKey, value, cacheTtl(requestUrl));
      return value;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

async function getJsonWithRetry<T>(requestUrl: string): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < RETRY_LIMIT) {
    try {
      return await getJson<T>(requestUrl);
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt >= RETRY_LIMIT || !shouldRetry(error)) break;
      await sleep(350 * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function getJson<T>(requestUrl: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = https.get(requestUrl, { timeout: REQUEST_TIMEOUT_MS }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          reject(new TmdbHttpError(`TMDB request failed with ${response.statusCode ?? "unknown"}`, response.statusCode ?? 500));
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
      })),
      spokenLanguages: data.spoken_languages?.map((language) => ({
        iso6391: language.iso_639_1,
        englishName: language.english_name ?? language.name ?? language.iso_639_1.toUpperCase(),
        name: language.name ?? language.english_name ?? language.iso_639_1.toUpperCase()
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
