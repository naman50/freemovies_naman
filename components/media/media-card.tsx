"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { tmdbImage } from "@/lib/images";
import { getYear } from "@/lib/utils";
import type { MediaItem } from "@/types/media";

export function MediaCard({ item }: { item: MediaItem }) {
  return (
    <motion.div whileHover={{ y: -8, scale: 1.03 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} className="w-40 shrink-0 md:w-52">
      <Link href={`/media/${item.mediaType}/${item.tmdbId}`} className="block overflow-hidden rounded-lg bg-zinc-900 shadow-2xl shadow-black/30">
        <div className="relative aspect-[2/3]">
          <Image src={tmdbImage(item.posterPath, "w500")} alt={item.title} fill sizes="208px" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-3">
            <div className="flex items-center gap-1 text-xs text-amber-300">
              <Star className="h-3 w-3 fill-amber-300" />
              {item.voteAverage?.toFixed(1) ?? "New"}
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-white">{item.title}</h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
            {item.mediaType} · {getYear(item.releaseDate ?? item.firstAirDate)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
