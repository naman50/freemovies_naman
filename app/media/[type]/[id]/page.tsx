import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Play } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FavoriteButton } from "@/components/media/favorite-button";
import { tmdbImage } from "@/lib/images";
import { formatRuntime, getYear } from "@/lib/utils";
import { getDetails, resolveTmdbId } from "@/lib/tmdb";
import type { MediaType } from "@/types/media";

export async function generateMetadata({ params }: { params: Promise<{ type: MediaType; id: string }> }) {
  const { type, id } = await params;
  const resolvedId = await resolveTmdbId(type, id);
  if (resolvedId !== id) redirect(`/media/${type}/${resolvedId}`);
  const details = await getDetails(type, id);
  return { title: details?.title ?? "Details" };
}

function normalizeSeason(value?: string, fallback = 1) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 0 ? numeric : fallback;
}

function sortSeasonsForDisplay(seasons: { seasonNumber: number; episodeCount: number; name: string }[]) {
  return [...seasons].sort((a, b) => {
    if (a.seasonNumber === 0 && b.seasonNumber !== 0) return 1;
    if (b.seasonNumber === 0 && a.seasonNumber !== 0) return -1;
    return a.seasonNumber - b.seasonNumber;
  });
}

export default async function DetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ type: MediaType; id: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  const [{ type, id }, query] = await Promise.all([params, searchParams]);
  const details = await getDetails(type, id);
  if (!details) notFound();
  const seasons =
    details.mediaType === "tv"
      ? sortSeasonsForDisplay((details.seasons ?? []).filter((season) => season.episodeCount > 0))
      : [];
  const defaultSeason = seasons.find((season) => season.seasonNumber > 0) ?? seasons[0];
  const selectedSeasonNumber = normalizeSeason(query.season, defaultSeason?.seasonNumber ?? 1);
  const selectedSeason = seasons.find((season) => season.seasonNumber === selectedSeasonNumber) ?? seasons[0];

  return (
    <AppShell>
      <section className="relative min-h-screen overflow-hidden">
        <Image src={tmdbImage(details.backdropPath, "original")} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-[#050609]/80 to-black/50" />
        <div className="relative z-10 grid gap-8 px-5 py-14 md:grid-cols-[280px_1fr] md:px-10 md:py-24">
          <div className="relative mx-auto aspect-[2/3] w-44 overflow-hidden rounded-lg bg-zinc-900 shadow-2xl shadow-black/40 md:mx-0 md:w-auto">
            <Image src={tmdbImage(details.posterPath, "w500")} alt={details.title} fill sizes="280px" className="object-cover" />
          </div>
          <div className="max-w-4xl pb-4 md:self-end">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-400">{details.mediaType === "movie" ? "Movie" : "TV Show"}</p>
            <h1 className="mt-3 text-5xl font-black text-white md:text-7xl">{details.title}</h1>
            <p className="mt-4 text-sm text-slate-300">
              {getYear(details.releaseDate ?? details.firstAirDate)} · {details.voteAverage?.toFixed(1) ?? "New"} rating · {formatRuntime(details.runtime)}
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">{details.overview}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/watch/${details.mediaType}/${details.tmdbId}`} className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-bold text-black hover:bg-slate-200">
                <Play className="h-5 w-5 fill-black" />
                Watch
              </Link>
              <FavoriteButton
                item={{
                  tmdbId: details.tmdbId,
                  mediaType: details.mediaType,
                  title: details.title,
                  posterPath: details.posterPath,
                  addedAt: new Date().toISOString()
                }}
              />
            </div>
            {details.mediaType === "tv" && (
              <div className="mt-8">
                <h2 className="text-lg font-bold">Seasons & Episodes</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {seasons.map((season) => {
                    const active = season.seasonNumber === selectedSeason?.seasonNumber;
                    return (
                      <Link
                        key={season.seasonNumber}
                        href={`/media/tv/${details.tmdbId}?season=${season.seasonNumber}`}
                        className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                          active ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {season.name || `Season ${season.seasonNumber}`}
                      </Link>
                    );
                  })}
                </div>
                {selectedSeason && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: selectedSeason.episodeCount }).map((_, index) => (
                      <Link
                        key={index}
                        href={`/watch/tv/${details.tmdbId}?season=${selectedSeason.seasonNumber}&episode=${index + 1}`}
                        className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                      >
                        E{index + 1}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
