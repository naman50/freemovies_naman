# Naman's Web Server Local

A self-hosted Netflix-style media streaming interface for a Windows PC and devices on the same home Wi-Fi network. It uses TMDB for metadata and posters, a local JSON database for personal state, and modular iframe provider builders for VidKing-style player URLs.

This app is designed for private local network use only. It does not include downloading, scraping, torrenting, or content acquisition features.

Later on added tunneling via cloufare to acess across diffent networks

```powershell
cloudflared tunnel --url http://localhost:3000 
```

## Features

- Next.js 15 App Router, TypeScript, TailwindCSS, Framer Motion
- Netflix-style dark responsive UI with hero banner, rows, sidebar navigation, skeletons, and animations
- TMDB trending, popular TV, search, genres, details, posters, ratings, descriptions, seasons, and episodes
- Modular provider layer in `providers/vidking.ts`
- Iframe player page with spinner, fallback UI, fullscreen, autoplay toggle, quality/subtitle placeholders
- HLS.js-ready component for future direct HLS providers
- Continue watching, watch history, and favorites stored locally with Zustand
- Local JSON API database for admin settings, custom movies, provider URLs, and homepage toggles
- Simple admin page at `/admin`
- Runs on `0.0.0.0:3000` for local Wi-Fi access

## Setup on Windows

1. Install Node.js LTS from [nodejs.org](https://nodejs.org/). Use Node 22.13.0 or newer, or the current LTS.
2. Open PowerShell in the project folder.
3. Install dependencies:

```powershell
npm install
```

4. Create your local environment file:

```powershell
copy .env.example .env.local
```

5. Edit `.env.local`:

```env
TMDB_API_BASE_URL=https://api.themoviedb.org/3
TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_APP_NAME=HomeFlix
NEXT_PUBLIC_DEFAULT_PROVIDER=vidking
VIDKING_BASE_URL=https://your-vidking-style-provider.example/embed
```

The app works with mock sample data if `TMDB_API_KEY` is missing, but live posters/search require a TMDB key.

## Run Locally

Development server:

```powershell
npm run dev
```

If you see a Webpack runtime error such as `Cannot read properties of undefined (reading 'call')`, stop the server with `Ctrl+C` and run a clean dev restart:

```powershell
npm run dev:clean
```

If a hidden process is still using port `3000`, run:

```powershell
npm run stop
npm run dev:clean
```

Production build:

```powershell
npm run build
npm run start
```

Both `dev` and `start` bind to:

```text
0.0.0.0:3000
```

Open on the Windows PC:

```text
http://localhost:3000
```

## Access From Phone on Same Wi-Fi

1. Find your Windows PC IPv4 address:

```powershell
ipconfig
```

2. Look for the Wi-Fi adapter `IPv4 Address`, usually like:

```text
192.168.1.24
```

3. On your phone, connected to the same Wi-Fi, open:

```text
http://192.168.1.24:3000
```

Replace `192.168.1.24` with your actual PC address.

## Windows Firewall

If your phone cannot connect:

1. Open Windows Security.
2. Go to `Firewall & network protection`.
3. Click `Allow an app through firewall`.
4. Allow Node.js on Private networks.

Alternative PowerShell rule:

```powershell
New-NetFirewallRule -DisplayName "HomeFlix Local 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Private
```

Only use this on trusted private networks.

## Provider System

The default provider lives in:

```text
providers/vidking.ts
```

It accepts:

- `tmdbId`
- `imdbId`
- `mediaType`
- `season`
- `episode`

It returns an iframe-compatible embed URL. Update `VIDKING_BASE_URL` or use `/admin` to change the provider base URL locally.

Example generated URL shape:

```text
https://www.vidking.net/embed/movie/157336
https://www.vidking.net/embed/tv/1399/1/1
```

## Important Files

- `app/page.tsx` - homepage
- `app/search/page.tsx` - search and genre filtering
- `app/media/[type]/[id]/page.tsx` - details page
- `app/watch/[type]/[id]/page.tsx` - streaming page
- `app/admin/page.tsx` - admin
- `providers/vidking.ts` - VidKing-style iframe URL builder
- `lib/tmdb.ts` - TMDB API integration with mock fallback
- `lib/local-db.ts` - local JSON database helper
- `store/library-store.ts` - Zustand favorites/history/autoplay state

## Checks

```powershell
npm run lint
npm run build
```

## Notes

- No illegal downloading features are included.
- Iframe playback depends on your configured provider URL and that provider allowing iframe embedding on your local site.
- If the iframe opens but says the ID is invalid, paste the provider-compatible numeric ID into the player page's ID field, then click `Reload ID`.
- Local network access is allowed for private IP ranges in `next.config.ts` using `allowedDevOrigins`.
- Local database data is written to `data/local-db.json`, which is ignored by git.
