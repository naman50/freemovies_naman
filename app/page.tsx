import { AppShell } from "@/components/layout/app-shell";
import { ClientLibraryRows } from "@/components/media/client-library-rows";
import { HeroBanner } from "@/components/media/hero-banner";
import { MediaRow } from "@/components/media/media-row";
import { readDb } from "@/lib/local-db";
import { getTrending } from "@/lib/tmdb";
import type { MediaItem } from "@/types/media";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ trending, tv, source }, db] = await Promise.all([getTrending(), readDb()]);
  const hero = trending[0];
  const customItems: MediaItem[] = db.customMedia.map((item) => ({
    id: item.tmdbId,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    title: item.title,
    overview: "Manually added from your local admin panel.",
    posterPath: item.posterPath
  }));

  return (
    <AppShell>
      {hero && <HeroBanner item={hero} />}
      <div className="relative z-10 -mt-10">
        <div className="px-5 md:px-10">
          {source === "mock" && (
            <div className="mb-4 rounded-md border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              TMDB is unavailable or no API key is configured, so HomeFlix is showing sample data.
            </div>
          )}
        </div>
        <ClientLibraryRows showContinue={db.settings.homepageSections.continueWatching} showMyList={db.settings.homepageSections.myList} />
        {customItems.length > 0 && <MediaRow title="Custom Library" items={customItems} />}
        {db.settings.homepageSections.trending && <MediaRow title="Trending Movies & Shows" items={trending} />}
        {db.settings.homepageSections.tv && <MediaRow title="TV Shows" items={tv} />}
      </div>
    </AppShell>
  );
}
