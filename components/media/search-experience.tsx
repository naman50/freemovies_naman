"use client";

import axios from "axios";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MediaCard } from "@/components/media/media-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaItem } from "@/types/media";

export function SearchExperience() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [genres, setGenres] = useState<{ id: string | number; name: string }[]>([]);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/tmdb/genres").then((response) => setGenres(response.data.genres));
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get("/api/tmdb/search", { params: { q: query } });
        setResults(response.data.results);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query]);

  const filtered = useMemo(() => {
    if (genre === "all") return results;
    return results.filter((item) => item.genreIds?.map(String).includes(genre));
  }, [genre, results]);

  return (
    <section className="px-5 py-24 md:px-10">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-black text-white md:text-6xl">Search</h1>
        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search movies and shows"
              className="h-14 w-full rounded-md border border-white/10 bg-white/10 pl-12 pr-4 text-white placeholder:text-slate-500"
            />
          </label>
          <select value={genre} onChange={(event) => setGenre(event.target.value)} className="h-14 rounded-md border border-white/10 bg-zinc-900 px-4 text-white">
            <option value="all">All genres</option>
            {genres.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-5">
        {loading &&
          Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-80 w-44 md:w-52" />)}
        {!loading && filtered.map((item) => <MediaCard key={`${item.mediaType}-${item.tmdbId}`} item={item} />)}
        {!loading && query && filtered.length === 0 && <p className="text-slate-400">No results found.</p>}
      </div>
    </section>
  );
}
