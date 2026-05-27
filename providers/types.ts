import type { MediaType } from "@/types/media";
import type { MediaId } from "@/types/media";

export type StreamRequest = {
  tmdbId: MediaId;
  imdbId?: string | null;
  mediaType: MediaType;
  season?: number;
  episode?: number;
};

export type StreamSource = {
  providerId: string;
  providerName: string;
  embedUrl: string;
  allowFullscreen: boolean;
  supportsSubtitles: boolean;
  type: "iframe" | "hls";
};

export type StreamProvider = {
  id: string;
  name: string;
  buildSource: (request: StreamRequest) => StreamSource;
};
