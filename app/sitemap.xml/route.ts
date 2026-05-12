import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "http://localhost:3000";

function isPageFile(name: string) {
  return /^(page)\.(tsx|ts|jsx|js|mdx)$/.test(name);
}

function collectPages(dir: string) {
  const pages: string[] = [];

  function recurse(currentDir: string, relPath: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err) {
      return;
    }

    const hasPage = entries.some((e) => e.isFile() && isPageFile(e.name));

    if (hasPage) {
      const parts = relPath
        .split(path.sep)
        .filter(Boolean)
        .filter((p) => !p.startsWith("("));

      const hasDynamic = parts.some((p) => p.includes("["));

      if (!hasDynamic) {
        const url = "/" + parts.join("/");
        pages.push(url === "/" ? "/" : url.replace(/\/+$/g, ""));
      }
    }

    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (e.name.startsWith("(")) continue; // Next.js grouping folders
      if (e.name === "api") continue; // skip API routes

      recurse(path.join(currentDir, e.name), path.join(relPath, e.name));
    }
  }

  recurse(dir, "");

  return Array.from(new Set(pages));
}

export async function GET() {
  const appDir = path.join(process.cwd(), "app");

  // Collect page-based routes from the app directory (skips dynamic segments)
  const staticPaths = collectPages(appDir);

  // If you want dynamic routes (eg. /tracking/[id]) you can expand them here
  // by querying the DB and mapping records to concrete URLs. Example (commented):
  // import postgres from 'postgres';
  // const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  // const rows = await sql`SELECT id FROM shipment LIMIT 500`;
  // const dynamicPaths = rows.map(r => `/tracking/${r.id}`);

  const urls = staticPaths.map((p) => `${SITE_URL}${p}`);

  const urlset = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`
    )
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
