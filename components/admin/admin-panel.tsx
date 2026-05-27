"use client";

import axios from "axios";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FavoriteItem, ProviderConfig } from "@/types/media";

type Settings = {
  providers: ProviderConfig[];
  homepageSections: {
    trending: boolean;
    tv: boolean;
    continueWatching: boolean;
    myList: boolean;
  };
};

const emptyCustom: FavoriteItem = {
  tmdbId: 999001,
  mediaType: "movie",
  title: "",
  posterPath: null,
  addedAt: new Date().toISOString()
};

export function AdminPanel() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [customMedia, setCustomMedia] = useState<FavoriteItem[]>([]);
  const [draft, setDraft] = useState(emptyCustom);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([axios.get("/api/local/settings"), axios.get("/api/local/library")]).then(([settingsResponse, libraryResponse]) => {
      setSettings(settingsResponse.data.settings);
      setCustomMedia(libraryResponse.data.customMedia);
    });
  }, []);

  async function saveSettings(next = settings) {
    if (!next) return;
    const response = await axios.post("/api/local/settings", next);
    setSettings(response.data.settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  async function addCustom() {
    if (!draft.title.trim()) return;
    const item = { ...draft, tmdbId: String(draft.tmdbId), addedAt: new Date().toISOString() };
    const response = await axios.post("/api/local/library", { ...item, custom: true });
    setCustomMedia(response.data.customMedia);
    setDraft({ ...emptyCustom, tmdbId: Date.now() });
  }

  async function removeCustom(item: FavoriteItem) {
    const response = await axios.post("/api/local/library", { ...item, custom: true, action: "remove" });
    setCustomMedia(response.data.customMedia);
  }

  if (!settings) return <div className="px-5 py-24 text-slate-400 md:px-10">Loading admin settings...</div>;

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 md:px-10">
      <h1 className="text-4xl font-black text-white md:text-6xl">Admin</h1>
      <p className="mt-3 max-w-2xl text-slate-400">Configure local providers, homepage sections, and custom library entries for this PC.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-bold text-white">Provider URLs</h2>
          <div className="mt-4 space-y-4">
            {settings.providers.map((provider, index) => (
              <div key={provider.id} className="grid gap-3">
                <input
                  value={provider.name}
                  onChange={(event) => {
                    const providers = [...settings.providers];
                    providers[index] = { ...provider, name: event.target.value };
                    setSettings({ ...settings, providers });
                  }}
                  className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
                />
                <input
                  value={provider.baseUrl}
                  onChange={(event) => {
                    const providers = [...settings.providers];
                    providers[index] = { ...provider, baseUrl: event.target.value };
                    setSettings({ ...settings, providers });
                  }}
                  className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white"
                />
              </div>
            ))}
          </div>
          <button onClick={() => saveSettings()} className="mt-5 inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 font-semibold text-white">
            <Save className="h-4 w-4" />
            Save providers
          </button>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-bold text-white">Homepage Sections</h2>
          <div className="mt-4 grid gap-3">
            {Object.entries(settings.homepageSections).map(([key, enabled]) => (
              <label key={key} className="flex items-center justify-between rounded-md bg-black/30 px-4 py-3 text-white">
                <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => {
                    const next = { ...settings, homepageSections: { ...settings.homepageSections, [key]: event.target.checked } };
                    setSettings(next);
                    saveSettings(next);
                  }}
                  className="h-5 w-5 accent-rose-600"
                />
              </label>
            ))}
          </div>
          {saved && <p className="mt-4 text-sm text-emerald-300">Saved locally.</p>}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-xl font-bold text-white">Custom Movies</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[120px_1fr_1fr_auto]">
          <input value={draft.tmdbId} onChange={(event) => setDraft({ ...draft, tmdbId: event.target.value })} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white" />
          <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Title" className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white" />
          <input value={draft.posterPath ?? ""} onChange={(event) => setDraft({ ...draft, posterPath: event.target.value })} placeholder="TMDB poster path" className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white" />
          <button onClick={addCustom} className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 font-bold text-black">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {customMedia.map((item) => (
            <div key={`${item.mediaType}-${item.tmdbId}`} className="flex items-center justify-between rounded-md bg-black/30 px-4 py-3 text-white">
              <span>{item.title}</span>
              <button onClick={() => removeCustom(item)} className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white" title="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
