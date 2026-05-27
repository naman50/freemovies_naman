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

export default async function DetailsPage({ params }: { params: Promise<{ type: MediaType; id: string }> }) {
  const { type, id } = await params;
  const details = await getDetails(type, id);
  if (!details) notFound();

  return (
    <AppShell>
      <section className="relative min-h-screen overflow-hidden">
        <Image src={tmdbImage(details.backdropPath, "original")} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-[#050609]/80 to-black/50" />
        <div className="relative z-10 grid gap-8 px-5 py-24 md:grid-cols-[280px_1fr] md:px-10">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-2xl shadow-black/40">
            <Image src={tmdbImage(details.posterPath, "w500")} alt={details.title} fill sizes="280px" className="object-cover" />
          </div>
          <div className="max-w-4xl self-end pb-4">
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
                <h2 className="text-lg font-bold">Episodes</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from({ length: Math.min(details.seasons?.find((season) => season.seasonNumber === 1)?.episodeCount ?? 8, 12) }).map((_, index) => (
                    <Link key={index} href={`/watch/tv/${details.tmdbId}?season=1&episode=${index + 1}`} className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
                      E{index + 1}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
