import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SearchExperience } from "@/components/media/search-experience";

export const metadata: Metadata = {
  title: "Search"
};

export default function SearchPage() {
  return (
    <AppShell>
      <SearchExperience />
    </AppShell>
  );
}
