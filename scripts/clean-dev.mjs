import { rmSync } from "node:fs";

for (const target of [".next", ".turbo", "out", "dist"]) {
  rmSync(target, { recursive: true, force: true });
}

console.log("Removed Next.js development/build caches.");
