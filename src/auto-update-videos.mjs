import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

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

function titleCaseWords(text) {
  return text
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 9)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function buildEditorial(item) {
  const subject = titleCaseWords(item.keyword || item.query || item.sourceTitle);
  const source = item.sourceTitle.replace(/\s+/g, " ").trim();
  const isFactory = /factory|manufacturing|process|crayon/i.test(source + " " + item.query);
  const isEngineering = /engineer|engineering|invention|build/i.test(source + " " + item.query);
  const categoryLabel = isFactory ? "factory process" : isEngineering ? "engineering" : "restoration";
  return {
    ...item,
    reviewStatus: "approved",
    proposedTitle: `${titleCaseWords(source)}: What Viewers Should Notice in This ${categoryLabel} Video`,
    summary: `This ${categoryLabel} video was selected as a conservative update candidate because it is visual, specific, and easier to explain with original editorial context. The page should help readers understand what happens in the clip, why the process is interesting, and what details are worth watching closely. Before final publication, watch the full video and tighten this draft with exact object names, process steps, and timestamps.`,
    takeaways: [
      `The topic fits a focused ${subject || categoryLabel} search intent.`,
      "The page adds original context instead of only embedding the YouTube player.",
      "The source remains clearly attributed and the video stays hosted by YouTube."
    ],
    timestamps: [
      "00:00 Opening condition or setup",
      "03:00 Main process begins",
      "08:00 Final result or key comparison"
    ]
  };
}

const selected = candidates
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
  .sort((a, b) => b.viewCount - a.viewCount)
  .slice(0, limit)
  .map(buildEditorial);

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
