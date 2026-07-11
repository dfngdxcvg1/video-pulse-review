import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "123";
const siteDir = process.env.SITE_DIR || "outputs/video-pulse";

if (!supabaseUrl) throw new Error("Set SUPABASE_URL.");
if (!serviceRoleKey) throw new Error("Set SUPABASE_SERVICE_ROLE_KEY. Do not use the anon public key for deployment.");

const apiBase = `${supabaseUrl.replace(/\/$/, "")}/storage/v1`;
const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`
};

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

async function request(path, options = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    if (entry.isFile()) files.push(full);
  }
  return files;
}

async function listExisting(prefix = "") {
  const res = await request(`/object/list/${bucket}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } })
  });
  const items = await res.json();
  return items.filter((item) => item.name && item.name !== ".emptyFolderPlaceholder").map((item) => prefix ? `${prefix}/${item.name}` : item.name);
}

const files = await walk(siteDir);
const existing = await listExisting("");
if (existing.length) {
  await request(`/object/${bucket}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: existing })
  });
}

for (const file of files) {
  const key = relative(siteDir, file).replace(/\\/g, "/");
  const body = await readFile(file);
  const size = (await stat(file)).size;
  await request(`/object/${bucket}/${encodeURIComponent(key).replace(/%2F/g, "/")}`, {
    method: "POST",
    headers: {
      "Content-Type": contentTypes[extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": key.endsWith(".html") ? "no-cache" : "public, max-age=31536000, immutable",
      "x-upsert": "true"
    },
    body
  });
  console.log(`Uploaded ${key} (${size} bytes)`);
}

console.log(`Deployed ${files.length} files to Supabase Storage bucket ${bucket}.`);
