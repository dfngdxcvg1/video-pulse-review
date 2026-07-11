# Video Pulse Review

English curated YouTube video portal template with ad slots, video detail pages, structured data, and sitemap output.

## Daily Workflow

1. Get a YouTube Data API key from Google Cloud Console.
2. Fetch candidates:

```powershell
$env:YOUTUBE_API_KEY="YOUR_KEY"
node src/fetch-youtube-candidates.mjs
```

3. Open `work/youtube-candidates.json`, copy good items into `work/reviewed-videos.json`, and set `reviewStatus` to `approved`.
4. Add original English editorial fields: `proposedTitle`, `summary`, `takeaways`, and `timestamps`.
5. Import approved records:

```powershell
node src/import-reviewed-videos.mjs
```

6. Build the site:

```powershell
node src/build.mjs
```

7. Preview locally:

```powershell
node src/serve.mjs
```

Open `http://127.0.0.1:4173/`.

## Semi-Automatic Update

Use this when you want the site to fetch and add a few conservative new draft pages:

```powershell
$env:YOUTUBE_API_KEY="YOUR_KEY"
$env:AUTO_APPROVE_LIMIT="6"
npm run auto:update
```

The script filters out obvious risky titles such as Shorts, music, movies, weapons, celebrity clips, dangerous challenges, and generic compilations. It still creates editorial drafts, so review `work/reviewed-videos.json` before publishing a real production site.

## Cloud Auto Update

For deployed automatic updates, do not run the job on your local computer. Use GitHub Actions to deploy to Cloudflare Worker `123`.

See `docs/github-cloudflare-auto-update.md`.

## Content Rules

Use one permanent page per video. Avoid music videos, movie clips, full sports games, children's content, violent content, dangerous challenges, and political controversy. Keep ads as placeholders until AdSense approves the site.
