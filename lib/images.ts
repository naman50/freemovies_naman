export function tmdbImage(path?: string | null, size = "w780") {
  if (!path) return "/placeholder-poster.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
