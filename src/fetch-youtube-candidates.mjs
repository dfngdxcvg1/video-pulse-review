import { mkdir, writeFile } from "node:fs/promises";

const key = process.env.YOUTUBE_API_KEY;
if (!key) throw new Error("Set YOUTUBE_API_KEY before running this script.");

const region = process.env.YOUTUBE_REGION || "US";
const maxPerRequest = Math.min(Number(process.env.YOUTUBE_MAX_RESULTS || 25), 50);
const targetCandidates = Number(process.env.YOUTUBE_TARGET_CANDIDATES || maxPerRequest * 8);
const queries = [
  ["restoration", "old machine restoration"],
  ["restoration", "abandoned car restoration"],
  ["restoration", "tool restoration"],
  ["inventions", "homemade inventions"],
  ["inventions", "amazing engineering build"],
  ["inventions", "factory manufacturing process"],
  ["nature", "extreme weather footage"],
  ["animals", "animal rescue story"]
];

const api = "https://www.googleapis.com/youtube/v3";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, params) {
  const search = new URLSearchParams({ ...params, key });
  const res = await fetch(`${api}/${path}?${search}`);
  if (!res.ok) throw new Error(`${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

const searchResults = [];
for (const [category, q] of queries) {
  let pageToken = "";
  while (searchResults.length < targetCandidates) {
    const data = await request("search", {
      part: "snippet",
      q,
      type: "video",
      videoEmbeddable: "true",
      videoSyndicated: "true",
      safeSearch: "strict",
      relevanceLanguage: "en",
      regionCode: region,
      order: "relevance",
      publishedAfter: "2024-01-01T00:00:00Z",
      maxResults: String(maxPerRequest),
      ...(pageToken ? { pageToken } : {})
    });
    for (const item of data.items || []) {
      searchResults.push({ category, query: q, videoId: item.id.videoId, snippet: item.snippet });
    }
    pageToken = data.nextPageToken || "";
    if (!pageToken) break;
    await sleep(180);
  }
  await sleep(180);
}

const ids = [...new Set(searchResults.map((item) => item.videoId))];
const details = [];
for (let i = 0; i < ids.length; i += 50) {
  const data = await request("videos", {
    part: "snippet,statistics,contentDetails,status",
    id: ids.slice(i, i + 50).join(",")
  });
  details.push(...(data.items || []));
}

const detailById = new Map(details.map((item) => [item.id, item]));
const seenCandidateIds = new Set();
const candidates = searchResults
  .map((result) => ({ ...result, detail: detailById.get(result.videoId) }))
  .filter((item) => {
    if (seenCandidateIds.has(item.videoId)) return false;
    seenCandidateIds.add(item.videoId);
    return true;
  })
  .filter((item) => item.detail?.status?.embeddable)
  .map((item) => ({
    reviewStatus: "pending",
    category: item.category,
    query: item.query,
    videoId: item.videoId,
    sourceTitle: item.detail.snippet.title,
    channel: item.detail.snippet.channelTitle,
    publishedAt: item.detail.snippet.publishedAt,
    viewCount: Number(item.detail.statistics?.viewCount || 0),
    likeCount: Number(item.detail.statistics?.likeCount || 0),
    duration: item.detail.contentDetails?.duration || "",
    keyword: item.query,
    proposedTitle: "",
    summary: "",
    takeaways: [],
    timestamps: []
  }))
  .sort((a, b) => b.viewCount - a.viewCount);

await mkdir("work", { recursive: true });
await writeFile("work/youtube-candidates.json", JSON.stringify(candidates, null, 2));
console.log(`Saved ${candidates.length} candidates to work/youtube-candidates.json`);
