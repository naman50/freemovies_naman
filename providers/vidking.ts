import type { StreamProvider, StreamRequest } from "@/providers/types";

function cleanBaseUrl(baseUrl?: string) {
  return (baseUrl ?? process.env.VIDKING_BASE_URL ?? "https://www.vidking.net/embed").replace(/\/$/, "");
}

function applyLanguageParam(url: string, language?: string | null) {
  const normalized = language?.trim().toLowerCase();
  if (!normalized || normalized === "auto") return url;
  const parsed = new URL(url);
  parsed.searchParams.set("lang", normalized);
  parsed.searchParams.set("ds_lang", normalized);
  return parsed.toString();
}

export function buildVidKingUrl(request: StreamRequest, configuredBaseUrl?: string) {
  const baseUrl = cleanBaseUrl(configuredBaseUrl);
  const language = request.language;
  if (request.mediaType === "tv") {
    return applyLanguageParam(`${baseUrl}/tv/${request.tmdbId}/${request.season ?? 1}/${request.episode ?? 1}`, language);
  }
  return applyLanguageParam(`${baseUrl}/movie/${request.tmdbId}`, language);
}

export const vidKingProvider: StreamProvider = {
  id: "vidking",
  name: "VidKing",
  buildSource: (request) => ({
    providerId: "vidking",
    providerName: "VidKing",
    embedUrl: buildVidKingUrl(request),
    allowFullscreen: true,
    supportsSubtitles: true,
    type: "iframe"
  })
};
