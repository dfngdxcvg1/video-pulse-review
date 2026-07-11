import { writeFile } from "node:fs/promises";

const key = process.env.YOUTUBE_API_KEY;
if (!key) throw new Error("Set YOUTUBE_API_KEY before running this script.");

const params = new URLSearchParams({
  part: "snippet,statistics,contentDetails,status",
  chart: "mostPopular",
  regionCode: process.env.YOUTUBE_REGION || "US",
  maxResults: "50",
  key
});

const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
if (!res.ok) throw new Error(`YouTube API failed: ${res.status} ${await res.text()}`);
const data = await res.json();

const embeddable = data.items.filter((item) => item.status?.embeddable);
await writeFile("work/youtube-most-popular.json", JSON.stringify(embeddable, null, 2));
console.log(`Saved ${embeddable.length} embeddable videos to work/youtube-most-popular.json`);
