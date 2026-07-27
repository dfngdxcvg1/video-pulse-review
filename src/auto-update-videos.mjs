import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { buildEditorial } from "./editorial.mjs";

const candidatesPath = "work/youtube-candidates.json";
const reviewedPath = "work/reviewed-videos.json";
const limit = Number(process.env.AUTO_APPROVE_LIMIT || 6);

if (!existsSync(candidatesPath)) {
  throw new Error("Missing work/youtube-candidates.json. Run node src/fetch-youtube-candidates.mjs first.");
}

const candidates = JSON.parse(await readFile(candidatesPath, "utf8"));
const reviewed = existsSync(reviewedPath) ? JSON.parse(await readFile(reviewedPath, "utf8")) : [];
const existingIds = new Set(reviewed.map((item) => item.videoId));
const selectedIds = new Set();

const titleRisk = /shorts|#shorts|free energy|tiktok|compilation|crazy|craziest|impossible|secret|top\s*\d+|level\s*\d+|incredible|another level|abandoned car|dollar|worth it|surprise|shark|music|song|movie|film|full episode|challenge|prank|dangerous|gun|weapon|blood|accident|politic|celebrity|ronaldo|mr\. bean/i;
const preferred = /restoration|restore|factory|manufacturing|process|engineering|machine|mechanical|invention|build|construction|tool|typewriter|vise|sander|grindstone|crayon/i;

function durationSeconds(value = "") {
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (Number(match[1]) || 0) * 3600 + (Number(match[2]) || 0) * 60 + (Number(match[3]) || 0);
}

const eligible = candidates
  .filter((item) => !existingIds.has(item.videoId))
  .filter((item) => {
    if (selectedIds.has(item.videoId)) return false;
    selectedIds.add(item.videoId);
    return true;
  })
  .map((item) => ({ ...item, durationSeconds: durationSeconds(item.duration) }))
  .filter((item) => item.durationSeconds >= 120 && item.durationSeconds <= 1800)
  .filter((item) => item.viewCount >= 50000)
  .filter((item) => preferred.test(`${item.sourceTitle} ${item.query}`))
  .filter((item) => !titleRisk.test(item.sourceTitle))
  .sort((a, b) => b.viewCount - a.viewCount);

const balanced = [];
for (const category of ["restoration", "inventions"]) {
  const match = eligible.find((item) => item.category === category && !balanced.includes(item));
  if (match && balanced.length < limit) balanced.push(match);
}
for (const item of eligible) {
  if (balanced.length >= limit) break;
  if (!balanced.includes(item)) balanced.push(item);
}

const selected = balanced
  .map((item) => ({
    ...item,
    ...buildEditorial(item),
    reviewStatus: "approved"
  }));

const merged = [...reviewed, ...selected];
await writeFile(reviewedPath, JSON.stringify(merged, null, 2));
await writeFile("work/auto-update-report.json", JSON.stringify({
  added: selected.length,
  totalReviewed: merged.length,
  addedVideos: selected.map((item) => ({
    videoId: item.videoId,
    title: item.sourceTitle,
    category: item.category,
    viewCount: item.viewCount
  }))
}, null, 2));

console.log(`Added ${selected.length} videos. Total reviewed videos: ${merged.length}`);
