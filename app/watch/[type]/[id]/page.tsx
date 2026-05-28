import { notFound, redirect } from "next/navigation";
import { getDetails, resolveTmdbId } from "@/lib/tmdb";
import { getProvider } from "@/providers";
import { PlayerShell } from "@/components/player/player-shell";
import type { MediaType } from "@/types/media";
import { readDb } from "@/lib/local-db";
import { buildVidKingUrl } from "@/providers/vidking";

function normalizeSeasonParam(value?: string, fallback = 1) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 0 ? numeric : fallback;
}

function normalizeEpisodeParam(value?: string, fallback = 1) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : fallback;
}

function normalizeLanguageParam(value?: string) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || normalized === "auto") return "auto";
  if (/^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/.test(normalized)) return normalized;
  return "auto";
}

export default async function WatchPage({
  params,
  searchParams
}: {
  params: Promise<{ type: MediaType; id: string }>;
  searchParams: Promise<{ season?: string; episode?: string; lang?: string }>;
}) {
  const [{ type, id }, query] = await Promise.all([params, searchParams]);
  const resolvedId = await resolveTmdbId(type, id);
  if (resolvedId !== id) {
    const suffix = new URLSearchParams(query).toString();
    redirect(`/watch/${type}/${resolvedId}${suffix ? `?${suffix}` : ""}`);
  }
  const [details, db] = await Promise.all([getDetails(type, id), readDb()]);
  if (!details) notFound();

  const season = details.mediaType === "tv" ? normalizeSeasonParam(query.season, 1) : 1;
  const episode = details.mediaType === "tv" ? normalizeEpisodeParam(query.episode, 1) : 1;
  const language = normalizeLanguageParam(query.lang);
  const provider = getProvider();
  const configuredProvider = db.settings.providers.find((item) => item.id === provider.id && item.enabled);
  const providerBaseUrl = configuredProvider?.baseUrl ?? "https://www.vidking.net/embed";
  const source = provider.buildSource({
    tmdbId: details.tmdbId,
    imdbId: details.imdbId,
    mediaType: details.mediaType,
    season,
    episode,
    language
  });
  const embedUrl =
    provider.id === "vidking"
      ? buildVidKingUrl({ tmdbId: details.tmdbId, imdbId: details.imdbId, mediaType: details.mediaType, season, episode, language }, providerBaseUrl)
      : source.embedUrl;

  return <PlayerShell details={details} embedUrl={embedUrl} providerBaseUrl={providerBaseUrl} season={season} episode={episode} initialLanguage={language} />;
}
