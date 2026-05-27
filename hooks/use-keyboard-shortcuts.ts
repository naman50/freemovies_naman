"use client";

import { useEffect } from "react";

type ShortcutHandlers = {
  onSearch?: () => void;
  onFullscreen?: () => void;
  onBack?: () => void;
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "/") {
        event.preventDefault();
        handlers.onSearch?.();
      }
      if (event.key.toLowerCase() === "f") handlers.onFullscreen?.();
      if (event.key === "Escape") handlers.onBack?.();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
