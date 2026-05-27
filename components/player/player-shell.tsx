"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Captions, Maximize, Play, RotateCw, Settings } from "lucide-react";
import { useLibraryStore } from "@/store/library-store";
import type { MediaDetails } from "@/types/media";

type PlayerShellProps = {
  details: MediaDetails;
  embedUrl: string;
  providerBaseUrl?: string;
  season?: number;
  episode?: number;
};

function buildOverrideUrl(baseUrl: string, mediaType: MediaDetails["mediaType"], id: string, season: number, episode: number) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  if (mediaType === "tv") return `${cleanBaseUrl}/tv/${id}/${season}/${episode}`;
  return `${cleanBaseUrl}/movie/${id}`;
}

export function PlayerShell({ details, embedUrl, providerBaseUrl = "https://www.vidking.net/embed", season = 1, episode = 1 }: PlayerShellProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [providerId, setProviderId] = useState(String(details.tmdbId));
  const [activeEmbedUrl, setActiveEmbedUrl] = useState(embedUrl);
  const autoplay = useLibraryStore((state) => state.autoplay);
  const toggleAutoplay = useLibraryStore((state) => state.toggleAutoplay);
  const addHistory = useLibraryStore((state) => state.addHistory);

  const historyKey = useMemo(() => `${details.mediaType}-${details.tmdbId}-${season}-${episode}`, [details.mediaType, details.tmdbId, season, episode]);

  useEffect(() => {
    addHistory({
      key: historyKey,
      tmdbId: details.tmdbId,
      mediaType: details.mediaType,
      title: details.title,
      posterPath: details.posterPath,
      progress: 0,
      season: details.mediaType === "tv" ? season : undefined,
      episode: details.mediaType === "tv" ? episode : undefined,
      updatedAt: new Date().toISOString()
    });
  }, [addHistory, details, episode, historyKey, season]);

  function requestFullscreen() {
    document.documentElement.requestFullscreen?.();
  }

  function reloadWithProviderId() {
    if (!providerId.trim()) return;
    setLoading(true);
    setFailed(false);
    setActiveEmbedUrl(buildOverrideUrl(providerBaseUrl, details.mediaType, providerId.trim(), season, episode));
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link href={`/media/${details.mediaType}/${details.tmdbId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
          {details.title}
        </Link>
        <button onClick={requestFullscreen} className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white" title="Fullscreen">
          <Maximize className="h-5 w-5" />
        </button>
      </div>

      <section className="relative mx-auto aspect-video w-full max-w-7xl overflow-hidden bg-zinc-950">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-black">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-rose-500" />
          </div>
        )}
        {failed ? (
          <div className="grid h-full place-items-center px-6 text-center">
            <div>
              <h1 className="text-2xl font-bold">Player could not be loaded</h1>
              <p className="mt-2 max-w-xl text-slate-400">Check the provider URL in Admin settings, then reload this page.</p>
            </div>
          </div>
        ) : (
          <iframe
            key={activeEmbedUrl}
            src={activeEmbedUrl}
            title={`${details.title} player`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="origin"
            className="h-full w-full border-0"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setFailed(true);
            }}
          />
        )}
      </section>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 md:grid-cols-[1fr_auto] md:px-8">
        <div>
          <h1 className="text-2xl font-bold">{details.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {details.mediaType === "tv" ? `Season ${season}, Episode ${episode}` : "Movie"} · Provider iframe stream
          </p>
          <div className="mt-4 flex max-w-xl flex-col gap-2 sm:flex-row">
            <input
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
              className="h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-slate-500"
              placeholder="VidKing ID, IMDb ID, or TMDB ID"
            />
            <button onClick={reloadWithProviderId} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-black hover:bg-slate-200">
              <RotateCw className="h-4 w-4" />
              Reload ID
            </button>
          </div>
          <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
            If the iframe says invalid ID, paste the VidKing/TMDB numeric ID for this title and reload.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white" title="Quality selector">
            <Settings className="h-4 w-4" />
            Auto
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white" title="Subtitle selector">
            <Captions className="h-4 w-4" />
            Subtitles
          </button>
          <button onClick={toggleAutoplay} className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
            <Play className="h-4 w-4 fill-white" />
            Autoplay {autoplay ? "On" : "Off"}
          </button>
        </div>
      </div>
    </main>
  );
}
