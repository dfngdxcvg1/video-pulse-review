import { mkdir, readFile, writeFile } from "node:fs/promises";

const items = JSON.parse(await readFile("work/priority-review.json", "utf8"));
const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[m]));

const cards = items.map((item, index) => `
  <section class="item">
    <div class="video">
      <iframe src="https://www.youtube.com/embed/${item.videoId}" title="${esc(item.sourceTitle)}" allowfullscreen loading="lazy"></iframe>
    </div>
    <div>
      <h2>${index + 1}. ${esc(item.sourceTitle)}</h2>
      <p class="meta">${esc(item.category)} | ${Number(item.viewCount).toLocaleString("en-US")} views at API fetch | ${esc(item.channel)} | ${esc(item.duration)}</p>
      <p><a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" rel="noopener">Open source on YouTube</a></p>
      <ul class="checks">
        <li class="approve">Approve if the full video is safe, useful, and matches the title.</li>
        <li class="reject">Reject if it is misleading, copied, violent, adult, political, or mostly a short/compilation.</li>
        <li>After approval, write a unique English summary, 3 takeaways, and 3 timestamps.</li>
      </ul>
    </div>
  </section>
`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Video Review Queue</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; color: #172026; background: #f6f8f9; }
    header { padding: 24px 32px; background: #fff; border-bottom: 1px solid #ddd; }
    main { padding: 24px 32px; display: grid; gap: 24px; }
    .item { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 18px; display: grid; grid-template-columns: minmax(320px, 560px) 1fr; gap: 18px; }
    .video { aspect-ratio: 16 / 9; background: #111; }
    .video iframe { width: 100%; height: 100%; border: 0; }
    h2 { margin: 0 0 8px; font-size: 21px; }
    .meta { color: #5f6f78; font-size: 14px; }
    .checks { padding-left: 20px; }
    .reject { color: #9b1c1c; }
    .approve { color: #0f766e; }
    @media (max-width: 900px) { .item { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <h1>Priority Video Review</h1>
    <p>Watch before publishing. Approve only videos that are original-source friendly, embeddable, evergreen, and ad-safe.</p>
  </header>
  <main>${cards}</main>
</body>
</html>`;

await mkdir("outputs/video-pulse/review", { recursive: true });
await writeFile("outputs/video-pulse/review/index.html", html);
console.log("Built outputs/video-pulse/review/index.html");
