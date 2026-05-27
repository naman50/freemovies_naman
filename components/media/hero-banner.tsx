import Image from "next/image";
import Link from "next/link";
import { Info, Play } from "lucide-react";
import { tmdbImage } from "@/lib/images";
import type { MediaItem } from "@/types/media";

export function HeroBanner({ item }: { item: MediaItem }) {
  return (
    <section className="relative min-h-[74vh] overflow-hidden">
      <Image src={tmdbImage(item.backdropPath, "original")} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-transparent to-black/20" />
      <div className="relative z-10 flex min-h-[74vh] max-w-4xl flex-col justify-end px-5 pb-20 pt-28 md:px-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-rose-400">Now streaming locally</p>
        <h1 className="max-w-3xl text-5xl font-black text-white md:text-7xl">{item.title}</h1>
        <p className="mt-5 line-clamp-3 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">{item.overview}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/watch/${item.mediaType}/${item.tmdbId}`} className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-bold text-black transition hover:bg-slate-200">
            <Play className="h-5 w-5 fill-black" />
            Play
          </Link>
          <Link href={`/media/${item.mediaType}/${item.tmdbId}`} className="inline-flex items-center gap-2 rounded-md bg-white/15 px-6 py-3 font-bold text-white backdrop-blur transition hover:bg-white/25">
            <Info className="h-5 w-5" />
            Details
          </Link>
        </div>
      </div>
    </section>
  );
}
