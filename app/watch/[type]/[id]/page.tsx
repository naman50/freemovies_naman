import { notFound, redirect } from "next/navigation";
import { getDetails, resolveTmdbId } from "@/lib/tmdb";
import { getProvider } from "@/providers";
import { PlayerShell } from "@/components/player/player-shell";
import type { MediaType } from "@/types/media";
import { readDb } from "@/lib/local-db";
import { buildVidKingUrl } from "@/providers/vidking";

export default async function WatchPage({
  params,
  searchParams
}: {
  params: Promise<{ type: MediaType; id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}) {
  const [{ type, id }, query] = await Promise.all([params, searchParams]);
  const resolvedId = await resolveTmdbId(type, id);
  if (resolvedId !== id) {
    const suffix = new URLSearchParams(query).toString();
    redirect(`/watch/${type}/${resolvedId}${suffix ? `?${suffix}` : ""}`);
  }
  const [details, db] = await Promise.all([getDetails(type, id), readDb()]);
  if (!details) notFound();

  const season = Number(query.season ?? 1);
  const episode = Number(query.episode ?? 1);
  const provider = getProvider();
  const configuredProvider = db.settings.providers.find((item) => item.id === provider.id && item.enabled);
  const providerBaseUrl = configuredProvider?.baseUrl ?? "https://www.vidking.net/embed";
  const source = provider.buildSource({
    tmdbId: details.tmdbId,
    imdbId: details.imdbId,
    mediaType: details.mediaType,
    season,
    episode
  });
  const embedUrl = provider.id === "vidking" ? buildVidKingUrl({ tmdbId: details.tmdbId, imdbId: details.imdbId, mediaType: details.mediaType, season, episode }, providerBaseUrl) : source.embedUrl;

  return <PlayerShell details={details} embedUrl={embedUrl} providerBaseUrl={providerBaseUrl} season={season} episode={episode} />;
}
