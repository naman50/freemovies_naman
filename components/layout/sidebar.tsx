"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clapperboard, Heart, Home, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/#my-list", label: "My List", icon: Heart },
  { href: "/admin", label: "Admin", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  useKeyboardShortcuts({ onSearch: () => router.push("/search") });

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur md:bottom-auto md:right-auto md:top-0 md:h-screen md:w-24 md:border-r md:border-t-0">
      <div className="hidden h-20 items-center justify-center md:flex">
        <Clapperboard className="h-8 w-8 text-rose-500" />
      </div>
      <nav className="flex justify-around md:mt-8 md:flex-col md:items-center md:gap-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.replace("/#", "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex h-16 min-w-16 items-center justify-center gap-2 text-xs text-slate-400 transition hover:text-white md:w-20 md:flex-col",
                active && "text-white"
              )}
              title={item.label}
            >
              <Icon className={cn("h-5 w-5 transition group-hover:scale-110", active && "text-rose-500")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
