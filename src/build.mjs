import { existsSync } from "node:fs";
import { mkdir, writeFile, rm, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { categories, site, videos as sampleVideos } from "./videos.js";

const out = "outputs/video-pulse";
const byCat = Object.fromEntries(categories.map((c) => [c.slug, c]));
const importedModule = existsSync("src/imported-videos.js") ? await import("./imported-videos.js") : null;
const videos = importedModule?.importedVideos?.length ? importedModule.importedVideos : sampleVideos;

const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const url = (path) => `${site.origin}${path}`;
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

function layout({ title, description, path, body, schema = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url(path))}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${esc(url(path))}">
  <link rel="stylesheet" href="/assets/styles.css">
  <script type="module" src="/assets/app.js"></script>
  ${schema}
</head>
<body>
  <header class="topbar">
    <a class="brand" href="/">Video Pulse Review</a>
    <nav>${categories.map((c) => `<a href="/videos/${c.slug}/">${esc(c.name)}</a>`).join("")}</nav>
  </header>
  ${body}
  <footer class="footer">
    <p>Curated commentary on public YouTube videos. Videos remain hosted by YouTube and their creators.</p>
    <nav><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/dmca/">DMCA</a></nav>
  </footer>
</body>
</html>`;
}

function adSlot(size = "leaderboard") {
  return `<aside class="ad-slot ${size}" aria-label="Advertisement"><span>Advertisement</span></aside>`;
}

function card(v) {
  return `<article class="video-card">
    <a class="thumb" href="/watch/${v.slug}/"><img src="${thumb(v.id)}" alt="${esc(v.title)} thumbnail" loading="lazy"><span class="play">Play</span></a>
    <div><a class="cat" href="/videos/${v.category}/">${esc(byCat[v.category].name)}</a><h3><a href="/watch/${v.slug}/">${esc(v.title)}</a></h3><p>${esc(v.summary.slice(0, 150))}...</p></div>
  </article>`;
}

function videoSchema(v) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: v.summary,
    thumbnailUrl: [thumb(v.id)],
    uploadDate: v.publishedAt,
    embedUrl: `https://www.youtube.com/embed/${v.id}`,
    publisher: { "@type": "Organization", name: v.channel }
  })}</script>`;
}

async function write(path, html) {
  const file = join(out, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

await rm(out, { recursive: true, force: true });
await mkdir(join(out, "assets"), { recursive: true });
await copyFile("src/styles.css", join(out, "assets/styles.css"));
await copyFile("src/app.js", join(out, "assets/app.js"));

await write("index.html", layout({
  title: `${site.name} - Curated YouTube Video Guides`,
  description: site.description,
  path: "/",
  body: `<main>
    <section class="hero">
      <div>
        <p class="eyebrow">English curated video portal</p>
        <h1>Remarkable YouTube videos, explained with context.</h1>
        <p>Browse editorial notes, timestamps, creator attribution, and related picks without loading a wall of heavy players.</p>
      </div>
    </section>
    ${adSlot()}
    <section class="section"><h2>Editor Picks</h2><div class="grid">${videos.map(card).join("")}</div></section>
    <section class="section split"><div><h2>Categories</h2><p>Start narrow, publish strong pages, then expand based on Search Console data.</p></div><div class="category-list">${categories.map((c) => `<a href="/videos/${c.slug}/"><strong>${esc(c.name)}</strong><span>${esc(c.intro)}</span></a>`).join("")}</div></section>
  </main>`
}));

for (const cat of categories) {
  const items = videos.filter((v) => v.category === cat.slug);
  await write(`videos/${cat.slug}/index.html`, layout({
    title: `${cat.name} Videos With Editorial Notes`,
    description: cat.intro,
    path: `/videos/${cat.slug}/`,
    body: `<main><section class="section page-head"><h1>${esc(cat.name)} Videos</h1><p>${esc(cat.intro)}</p></section>${adSlot()}<section class="section"><div class="grid">${items.map(card).join("") || "<p>More videos will be added after API review.</p>"}</div></section></main>`
  }));
}

for (const v of videos) {
  const related = videos.filter((x) => x.category === v.category && x.slug !== v.slug).slice(0, 3);
  await write(`watch/${v.slug}/index.html`, layout({
    title: v.title,
    description: v.summary.slice(0, 155),
    path: `/watch/${v.slug}/`,
    schema: videoSchema(v),
    body: `<main class="article-shell">
      <article class="article">
        <a class="cat" href="/videos/${v.category}/">${esc(byCat[v.category].name)}</a>
        <h1>${esc(v.title)}</h1>
        <p class="dek">${esc(v.summary)}</p>
        ${adSlot()}
        <div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${v.id}" title="${esc(v.sourceTitle)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
        ${adSlot("in-article")}
        <h2>What to Notice</h2><ul>${v.takeaways.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <h2>Key Moments</h2><ul>${v.timestamps.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <h2>Source</h2><p>Original video: <a href="https://www.youtube.com/watch?v=${v.id}" rel="nofollow noopener" target="_blank">${esc(v.sourceTitle)}</a> by ${esc(v.channel)}. View data should be refreshed from the YouTube Data API before publication.</p>
      </article>
      <aside class="sidebar">${adSlot("sidebar")}<h2>Related</h2>${related.map(card).join("")}</aside>
    </main>`
  }));
}

const pages = {
  "about": ["About Video Pulse Review", "We publish original English notes around public YouTube videos, focusing on context, safety, attribution, and search usefulness."],
  "contact": ["Contact", "For corrections, creator requests, advertising, or partnerships, contact the site owner at editor@example.com."],
  "privacy": ["Privacy Policy", "This template reserves space for Google AdSense and analytics. Add your final cookie, analytics, and advertising disclosures before launch."],
  "terms": ["Terms", "Embedded videos belong to their respective creators and platforms. Commentary, curation, and page text are provided for informational use."],
  "dmca": ["DMCA", "Creators or rights holders can request review or removal by sending the video URL, page URL, ownership details, and contact information."]
};
for (const [slug, [title, text]] of Object.entries(pages)) {
  await write(`${slug}/index.html`, layout({ title, description: text, path: `/${slug}/`, body: `<main><section class="section page-head"><h1>${esc(title)}</h1><p>${esc(text)}</p></section>${adSlot()}</main>` }));
}

const allPaths = ["/", ...categories.map((c) => `/videos/${c.slug}/`), ...videos.map((v) => `/watch/${v.slug}/`), ...Object.keys(pages).map((p) => `/${p}/`)];
await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allPaths.map((p) => `<url><loc>${url(p)}</loc></url>`).join("")}</urlset>`);
await write("video-sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${videos.map((v) => `<url><loc>${url(`/watch/${v.slug}/`)}</loc><video:video><video:thumbnail_loc>${thumb(v.id)}</video:thumbnail_loc><video:title>${esc(v.title)}</video:title><video:description>${esc(v.summary)}</video:description><video:player_loc>${`https://www.youtube.com/embed/${v.id}`}</video:player_loc></video:video></url>`).join("")}</urlset>`);
await write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${url("/sitemap.xml")}\nSitemap: ${url("/video-sitemap.xml")}\n`);
