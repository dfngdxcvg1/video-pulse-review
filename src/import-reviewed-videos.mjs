import { readFile, writeFile } from "node:fs/promises";

const inputPath = process.env.REVIEWED_VIDEOS || "work/reviewed-videos.json";
const raw = await readFile(inputPath, "utf8");
const reviewed = JSON.parse(raw).filter((item) => item.reviewStatus === "approved");

if (!reviewed.length) {
  throw new Error(`No approved videos found in ${inputPath}`);
}

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 72);

const videos = reviewed.map((item) => ({
  id: item.videoId,
  slug: item.slug || slugify(item.proposedTitle || item.sourceTitle),
  category: item.category,
  title: item.proposedTitle || item.sourceTitle,
  sourceTitle: item.sourceTitle,
  channel: item.channel,
  publishedAt: item.publishedAt,
  viewsLabel: item.viewCount ? `${Number(item.viewCount).toLocaleString("en-US")} views at review` : "Reviewed YouTube video",
  summary: item.summary,
  takeaways: item.takeaways || [],
  timestamps: item.timestamps || [],
  keyword: item.keyword || ""
}));

const moduleText = `// Generated from ${inputPath}. Edit work/reviewed-videos.json, then run npm run import:reviewed.\n` +
`export const importedVideos = ${JSON.stringify(videos, null, 2)};\n`;

await writeFile("src/imported-videos.js", moduleText);
console.log(`Imported ${videos.length} approved videos to src/imported-videos.js`);
