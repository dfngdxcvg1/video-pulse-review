import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { importedVideos } from "./imported-videos.js";

const out = "outputs/video-pulse";
const errors = [];

async function filesUnder(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) files.push(...await filesUnder(path));
    else files.push(path);
  }
  return files;
}

const files = await filesUnder(out);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const htmlEntries = await Promise.all(htmlFiles.map(async (file) => [file, await readFile(file, "utf8")]));
const html = htmlEntries.map(([, contents]) => contents).join("\n");
const watchDirectories = await readdir(join(out, "watch"));
const uniqueSlugs = new Set(importedVideos.map((video) => video.slug));
const uniqueIds = new Set(importedVideos.map((video) => video.id));

if (watchDirectories.length !== importedVideos.length) {
  errors.push(`Expected ${importedVideos.length} watch pages, found ${watchDirectories.length}.`);
}
if (uniqueSlugs.size !== importedVideos.length) {
  errors.push("Video slugs are not unique.");
}
if (uniqueIds.size !== importedVideos.length) {
  errors.push("Video IDs are not unique.");
}
if (importedVideos.some((video) => /What Viewers Should Notice/i.test(video.title))) {
  errors.push("Legacy repeated title text remains in generated HTML.");
}
if (/Before final publication|conservative update candidate/i.test(html)) {
  errors.push("Draft-only editorial text remains in generated HTML.");
}
if (/00:00 Opening condition or setup|03:00 Main process begins/i.test(html)) {
  errors.push("Unverified generic timestamps remain in generated HTML.");
}
if (/editor@example\.com|This template reserves space/i.test(html)) {
  errors.push("Placeholder trust-page content remains in generated HTML.");
}
if (!html.includes("Safety and Limits") || !html.includes("Source Details")) {
  errors.push("Required guide sections are missing.");
}
if (!(await readFile(join(out, "index.html"), "utf8")).includes(`${importedVideos.length}</strong> guides`)) {
  errors.push("Homepage guide count does not match imported data.");
}

for (const [file, contents] of htmlEntries) {
  const hrefs = [...contents.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const pathname = href.split(/[?#]/)[0];
    const target = pathname.endsWith("/")
      ? join(out, pathname, "index.html")
      : join(out, pathname);
    if (!existsSync(target)) errors.push(`Broken internal link ${href} in ${file}.`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Verified ${importedVideos.length} guides across ${htmlFiles.length} HTML pages.`);
