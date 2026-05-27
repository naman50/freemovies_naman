import { vidKingProvider } from "@/providers/vidking";
import type { StreamProvider } from "@/providers/types";

const providers: Record<string, StreamProvider> = {
  [vidKingProvider.id]: vidKingProvider
};

export function getProvider(id = process.env.NEXT_PUBLIC_DEFAULT_PROVIDER ?? "vidking") {
  return providers[id] ?? vidKingProvider;
}

export function getProviders() {
  return Object.values(providers);
}
