import type { MediaItem } from "@/types/media";
import { MediaCard } from "@/components/media/media-card";

export function MediaRow({ title, items, id }: { title: string; items: MediaItem[]; id?: string }) {
  if (!items.length) return null;
  return (
    <section id={id} className="py-6">
      <div className="mb-4 flex items-center justify-between px-5 md:px-10">
        <h2 className="text-xl font-bold text-white md:text-2xl">{title}</h2>
      </div>
      <div className="scrollbar-none flex gap-4 overflow-x-auto px-5 pb-4 md:px-10">
        {items.map((item) => (
          <MediaCard key={`${item.mediaType}-${item.tmdbId}`} item={item} />
        ))}
      </div>
    </section>
  );
}
