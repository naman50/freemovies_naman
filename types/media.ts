export type MediaType = "movie" | "tv";
export type MediaId = string | number;

export type MediaItem = {
  id: MediaId;
  tmdbId: MediaId;
  imdbId?: string | null;
  mediaType: MediaType;
  title: string;
  name?: string;
  overview: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  releaseDate?: string;
  firstAirDate?: string;
  genreIds?: MediaId[];
};

export type MediaDetails = MediaItem & {
  runtime?: number | null;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  genres?: { id: MediaId; name: string }[];
  seasons?: { seasonNumber: number; episodeCount: number; name: string }[];
};

export type WatchProgress = {
  key: string;
  tmdbId: MediaId;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  progress: number;
  updatedAt: string;
  season?: number;
  episode?: number;
};

export type FavoriteItem = {
  tmdbId: MediaId;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  addedAt: string;
};

export type ProviderConfig = {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
};
