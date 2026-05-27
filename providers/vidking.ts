import type { StreamProvider, StreamRequest } from "@/providers/types";

function cleanBaseUrl(baseUrl?: string) {
  return (baseUrl ?? process.env.VIDKING_BASE_URL ?? "https://www.vidking.net/embed").replace(/\/$/, "");
}

export function buildVidKingUrl(request: StreamRequest, configuredBaseUrl?: string) {
  const baseUrl = cleanBaseUrl(configuredBaseUrl);
  if (request.mediaType === "tv") {
    return `${baseUrl}/tv/${request.tmdbId}/${request.season ?? 1}/${request.episode ?? 1}`;
  }
  return `${baseUrl}/movie/${request.tmdbId}`;
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
