import { existsSync } from "node:fs";
import { mkdir, writeFile, rm, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { categories, site, videos as sampleVideos } from "./videos.js";

const out = "outputs/video-pulse";
const byCat = Object.fromEntries(categories.map((category) => [category.slug, category]));
const importedModule = existsSync("src/imported-videos.js") ? await import("./imported-videos.js") : null;
const videos = importedModule?.importedVideos?.length ? importedModule.importedVideos : sampleVideos;
const activeCategories = categories.filter((category) => videos.some((video) => video.category === category.slug));
const recentVideos = [...videos].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
const editorPicks = videos.filter((video) => video.editorialMode === "editor-selected").slice(0, 6);
const featuredVideos = editorPicks.length ? editorPicks : recentVideos.slice(0, 6);

const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[character]));
const url = (path) => `${site.origin}${path}`;
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const snippet = (value, length = 155) => {
  const text = String(value || "").trim();
  return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, "")}...` : text;
};
const formatDate = (value) => new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric"
}).format(new Date(value));

function layout({ title, description, path, body, schema = "", image = "", type = "website" }) {
  const socialImage = image || thumb(featuredVideos[0]?.id || videos[0].id);
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
  <meta property="og:type" content="${esc(type)}">
  <meta property="og:url" content="${esc(url(path))}">
  <meta property="og:image" content="${esc(socialImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://i.ytimg.com">
  <link rel="stylesheet" href="/assets/styles.css">
  <script type="module" src="/assets/app.js"></script>
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"d39547fa6ec34dfd99294422c7ff988d"}'></script>
  ${schema}
</head>
<body>
  <header class="topbar">
    <a class="brand" href="/">Video Pulse Review</a>
    <nav aria-label="Primary navigation">
      ${activeCategories.map((category) => `<a href="/videos/${category.slug}/">${esc(category.name)}</a>`).join("")}
      <a href="/search/">Search</a>
    </nav>
  </header>
  ${body}
  <footer class="footer">
    <div><strong>Video Pulse Review</strong><p>Independent companion guides for public YouTube videos. Creators retain ownership of their work.</p></div>
    <nav aria-label="Footer navigation"><a href="/about/">About</a><a href="/editorial-policy/">Editorial Policy</a><a href="/safety/">Safety</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/dmca/">DMCA</a></nav>
  </footer>
</body>
</html>`;
}

function card(video) {
  const category = byCat[video.category] || activeCategories[0];
  const searchText = `${video.title} ${video.sourceTitle} ${video.channel} ${video.keyword} ${video.topicType}`.toLowerCase();
  return `<article class="video-card" data-search="${esc(searchText)}">
    <a class="thumb" href="/watch/${video.slug}/" aria-label="Open ${esc(video.title)}">
      <img src="${thumb(video.id)}" alt="${esc(video.sourceTitle)} thumbnail" loading="lazy" width="480" height="360">
      <span class="play" title="Open guide" aria-hidden="true"></span>
    </a>
    <div class="card-body">
      <p class="card-meta"><a class="cat" href="/videos/${video.category}/">${esc(video.topicType || category.name)}</a><span>${esc(video.channel)}</span></p>
      <h3><a href="/watch/${video.slug}/">${esc(video.title)}</a></h3>
      <p>${esc(snippet(video.summary, 142))}</p>
    </div>
  </article>`;
}

function videoSchema(video) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.summary,
    thumbnailUrl: [thumb(video.id)],
    uploadDate: video.publishedAt,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
    author: { "@type": "Organization", name: video.channel },
    isFamilyFriendly: true
  })}</script>`;
}

function websiteSchema() {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.origin,
    description: site.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.origin}/search/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
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
await writeFile(join(out, "google4c9c5b5cfa7f7a88.html"), "google-site-verification: google4c9c5b5cfa7f7a88.html");

const heroVideo = featuredVideos[0] || recentVideos[0];
await write("index.html", layout({
  title: `${site.name} | Restoration and Engineering Video Guides`,
  description: site.description,
  path: "/",
  schema: websiteSchema(),
  image: thumb(heroVideo.id),
  body: `<main>
    <section class="hero" style="--hero-image: url('${thumb(heroVideo.id)}')">
      <div>
        <p class="eyebrow">Independent workshop video guides</p>
        <h1>Restoration and engineering videos, understood.</h1>
        <p>Follow the process, spot the important choices, check the final result, and understand the safety limits behind remarkable workshop videos.</p>
        <form class="hero-search" action="/search/" method="get">
          <label class="sr-only" for="home-search">Search video guides</label>
          <input id="home-search" name="q" type="search" placeholder="Search tools, machines, factories..." autocomplete="off">
          <button type="submit">Search</button>
        </form>
        <div class="hero-stats"><span><strong>${videos.length}</strong> guides</span><span><strong>${activeCategories.length}</strong> focused topics</span><span><strong>100%</strong> source linked</span></div>
      </div>
    </section>
    <section class="section">
      <div class="section-head"><div><p class="eyebrow">Selected for depth</p><h2>Editor Picks</h2></div><a class="text-link" href="/editorial-policy/">How we select videos</a></div>
      <div class="grid">${featuredVideos.map(card).join("")}</div>
    </section>
    <section class="section section-soft">
      <div class="section-head"><div><p class="eyebrow">Fresh source material</p><h2>Recently Published Videos</h2></div><a class="text-link" href="/search/">Browse all ${videos.length}</a></div>
      <div class="grid">${recentVideos.slice(0, 12).map(card).join("")}</div>
    </section>
    <section class="section topic-band">
      <div><p class="eyebrow">Browse by intent</p><h2>Choose a workshop topic</h2><p>Each section keeps related videos, viewing questions, safety context, and source details together.</p></div>
      <div class="category-list">${activeCategories.map((category) => {
        const count = videos.filter((video) => video.category === category.slug).length;
        return `<a href="/videos/${category.slug}/"><strong>${esc(category.name)}</strong><span>${esc(category.intro)}</span><small>${count} guides</small></a>`;
      }).join("")}</div>
    </section>
  </main>`
}));

for (const category of activeCategories) {
  const items = recentVideos.filter((video) => video.category === category.slug);
  await write(`videos/${category.slug}/index.html`, layout({
    title: `${category.name} Video Guides | ${site.name}`,
    description: category.intro,
    path: `/videos/${category.slug}/`,
    image: thumb(items[0].id),
    body: `<main>
      <section class="page-hero"><p class="eyebrow">Focused video library</p><h1>${esc(category.name)}</h1><p>${esc(category.intro)}</p><div class="page-stat">${items.length} independent guides</div></section>
      <section class="section"><div class="grid">${items.map(card).join("")}</div></section>
    </main>`
  }));
}

for (const video of videos) {
  const category = byCat[video.category] || activeCategories[0];
  const related = recentVideos
    .filter((candidate) => candidate.category === video.category && candidate.slug !== video.slug)
    .sort((a, b) => Number(b.topicType === video.topicType) - Number(a.topicType === video.topicType))
    .slice(0, 4);
  const moments = video.timestampsVerified && video.timestamps?.length
    ? `<h2>Verified Key Moments</h2><ul class="check-list">${video.timestamps.map((moment) => `<li>${esc(moment)}</li>`).join("")}</ul>`
    : "";

  await write(`watch/${video.slug}/index.html`, layout({
    title: `${video.title} | ${site.name}`,
    description: snippet(video.summary, 155),
    path: `/watch/${video.slug}/`,
    schema: videoSchema(video),
    image: thumb(video.id),
    type: "article",
    body: `<main class="article-shell">
      <article class="article">
        <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/videos/${video.category}/">${esc(category.name)}</a></nav>
        <p class="eyebrow">${esc(video.topicType || category.name)} viewing guide</p>
        <h1>${esc(video.title)}</h1>
        <p class="dek">${esc(video.summary)}</p>
        <div class="fact-strip"><span><small>Creator</small>${esc(video.channel)}</span><span><small>Published</small>${esc(formatDate(video.publishedAt))}</span><span><small>Guide level</small>${esc(video.difficulty || "Intermediate")}</span></div>
        <div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${video.id}" title="${esc(video.sourceTitle)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
        <p class="source-note">The video remains hosted by YouTube and its creator. This page is an independent companion guide.</p>
        <section class="article-section"><h2>Viewing Guide</h2><ul class="check-list">${video.takeaways.map((takeaway) => `<li>${esc(takeaway)}</li>`).join("")}</ul></section>
        ${moments}<section class="article-section safety-panel"><h2>Safety and Limits</h2><ul>${(video.safetyNotes || []).map((note) => `<li>${esc(note)}</li>`).join("")}</ul></section>
        <section class="article-section"><h2>Source Details</h2><dl class="source-facts"><div><dt>Original title</dt><dd>${esc(video.sourceTitle)}</dd></div><div><dt>Creator</dt><dd>${esc(video.channel)}</dd></div><div><dt>Source</dt><dd><a href="https://www.youtube.com/watch?v=${video.id}" rel="nofollow noopener" target="_blank">Watch the original video on YouTube</a></dd></div><div><dt>Views at review</dt><dd>${esc(video.viewsLabel)}</dd></div></dl></section>
      </article>
      <aside class="sidebar"><p class="eyebrow">Continue exploring</p><h2>Related Guides</h2>${related.map(card).join("")}</aside>
    </main>`
  }));
}

await write("search/index.html", layout({
  title: `Search Video Guides | ${site.name}`,
  description: `Search ${videos.length} restoration, manufacturing, and engineering video guides.`,
  path: "/search/",
  body: `<main>
    <section class="page-hero compact"><p class="eyebrow">Find a guide</p><h1>Search the workshop library</h1><p>Search by object, machine, creator, process, or engineering topic.</p>
      <label class="search-box"><span class="sr-only">Search all guides</span><input id="guide-search" type="search" placeholder="Try: typewriter, factory, tractor..." autocomplete="off"></label>
      <p id="search-status" class="search-status" aria-live="polite">${videos.length} guides</p>
    </section>
    <section class="section"><div id="search-results" class="grid">${recentVideos.map(card).join("")}</div><p id="search-empty" class="empty-state" hidden>No matching guides. Try a broader machine or process name.</p></section>
  </main>`
}));

const pages = {
  "about": {
    title: "About Video Pulse Review",
    description: "Why Video Pulse Review publishes independent companion guides for restoration, factory process, and engineering videos.",
    content: `<h2>What we add</h2><p>YouTube is excellent for demonstrations, but a title and player do not always explain what matters. We organize selected videos around the starting problem, process choices, final test, and safety limits.</p><h2>Our focus</h2><p>We cover restoration, workshop machinery, factory production, and practical engineering. We do not download or re-host creator videos.</p>`
  },
  "editorial-policy": {
    title: "Editorial Policy",
    description: "How Video Pulse Review selects, labels, updates, and attributes videos.",
    content: `<h2>Selection standards</h2><p>Videos must be publicly embeddable, clearly attributable, relevant to our focused topics, and useful beyond a short-lived trend. Automated discovery helps find candidates; duplicate, unsafe, misleading, or off-topic results are filtered before publication.</p><h2>What our guides mean</h2><p>Viewing checklists identify questions a careful viewer can use while watching. They are not transcripts and do not claim that every possible step appears in the video. Exact timestamps are published only when verified.</p><h2>Corrections</h2><p>Titles, attribution, embed status, and factual descriptions can be corrected when reliable information changes.</p>`
  },
  "safety": {
    title: "Workshop Safety",
    description: "Important safety limits for restoration, manufacturing, and engineering video guides.",
    content: `<h2>Videos are not complete instructions</h2><p>Short demonstrations often omit training, protective equipment, ventilation, machine guarding, load calculations, and local regulations. Do not treat an embedded video or our commentary as a complete procedure.</p><h2>Before attempting a project</h2><p>Use manufacturer documentation, qualified supervision, appropriate personal protective equipment, and verified electrical, chemical, fire, lifting, and machine-safety practices.</p>`
  },
  "contact": {
    title: "Contact",
    description: "Contact Video Pulse Review about corrections, creator attribution, removal requests, or partnerships.",
    content: `<p>For corrections, creator attribution, embed removal, or partnership questions, email <a href="mailto:editor@pingdou123.uk">editor@pingdou123.uk</a>. Include the page URL and original YouTube URL so the request can be reviewed accurately.</p>`
  },
  "privacy": {
    title: "Privacy Policy",
    description: "Privacy information for Video Pulse Review visitors.",
    content: `<h2>Analytics and server logs</h2><p>We may process basic request, device, and referral information through our hosting and privacy-focused analytics providers to operate and improve the site.</p><h2>Embedded content</h2><p>YouTube embeds can connect to Google services when loaded or played. Their handling of data is governed by Google's policies.</p><h2>Advertising</h2><p>If advertising is enabled, advertising partners may use cookies or similar technologies where permitted. Consent controls will be shown when legally required.</p>`
  },
  "terms": {
    title: "Terms of Use",
    description: "Terms governing use of Video Pulse Review.",
    content: `<p>Our commentary is provided for general information. Embedded videos, names, thumbnails, and trademarks belong to their respective creators and owners. Do not rely on the site as professional engineering, repair, electrical, chemical, or workplace-safety advice.</p>`
  },
  "dmca": {
    title: "DMCA and Creator Requests",
    description: "How creators and rights holders can request review, correction, or removal.",
    content: `<p>Creators and rights holders may request correction or removal of an embed or reference. Email <a href="mailto:editor@pingdou123.uk">editor@pingdou123.uk</a> with the page URL, source video URL, contact information, and a description of your relationship to the work.</p><p>We do not host the underlying video files. Requests concerning the original upload should also be directed to the hosting platform.</p>`
  }
};

for (const [slug, page] of Object.entries(pages)) {
  await write(`${slug}/index.html`, layout({
    title: `${page.title} | ${site.name}`,
    description: page.description,
    path: `/${slug}/`,
    body: `<main><section class="page-hero compact"><h1>${esc(page.title)}</h1><p>${esc(page.description)}</p></section><article class="policy-page">${page.content}</article></main>`
  }));
}

const modified = new Date().toISOString().slice(0, 10);
const allPaths = [
  "/",
  "/search/",
  ...activeCategories.map((category) => `/videos/${category.slug}/`),
  ...videos.map((video) => `/watch/${video.slug}/`),
  ...Object.keys(pages).map((page) => `/${page}/`)
];
await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allPaths.map((path) => `<url><loc>${url(path)}</loc><lastmod>${modified}</lastmod></url>`).join("")}</urlset>`);
await write("video-sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${videos.map((video) => `<url><loc>${url(`/watch/${video.slug}/`)}</loc><video:video><video:thumbnail_loc>${thumb(video.id)}</video:thumbnail_loc><video:title>${esc(video.title)}</video:title><video:description>${esc(video.summary)}</video:description><video:player_loc>${`https://www.youtube.com/embed/${video.id}`}</video:player_loc><video:publication_date>${esc(video.publishedAt)}</video:publication_date><video:uploader>${esc(video.channel)}</video:uploader></video:video></url>`).join("")}</urlset>`);
await write("feed.xml", `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)}</title><link>${site.origin}</link><description>${esc(site.description)}</description>${recentVideos.slice(0, 20).map((video) => `<item><title>${esc(video.title)}</title><link>${url(`/watch/${video.slug}/`)}</link><guid>${url(`/watch/${video.slug}/`)}</guid><pubDate>${new Date(video.publishedAt).toUTCString()}</pubDate><description>${esc(video.summary)}</description></item>`).join("")}</channel></rss>`);
await write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${url("/sitemap.xml")}\nSitemap: ${url("/video-sitemap.xml")}\n`);
