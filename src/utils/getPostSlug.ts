import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";

const slugCache = new Map<string, string>();

const getFallbackSlug = (id: string) =>
  id
    .replace(/\.[^.]+$/, "")
    .split("/")
    .map(segment => slugifyStr(segment))
    .join("/")
    .replace(/\/index$/, "");

const getFrontmatterSlug = (source: string) => {
  const frontmatterMatch = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return undefined;

  const slugMatch = frontmatterMatch[1].match(
    /^\s*slug:\s*(?:"([^"]+)"|'([^']+)'|([^\n#]+))\s*$/m
  );

  return (slugMatch?.[1] ?? slugMatch?.[2] ?? slugMatch?.[3])?.trim();
};

export async function getPostSlug(post: CollectionEntry<"blog">) {
  const cacheKey = post.filePath ?? post.id;
  const cachedSlug = slugCache.get(cacheKey);

  if (cachedSlug) {
    return cachedSlug;
  }

  let slug: string | undefined;

  if (post.filePath) {
    const source = await readFile(resolve(post.filePath), "utf-8");
    slug = getFrontmatterSlug(source);
  }

  const resolvedSlug = slug ?? getFallbackSlug(post.id);
  slugCache.set(cacheKey, resolvedSlug);

  return resolvedSlug;
}

export async function getPostsWithSlugs(posts: CollectionEntry<"blog">[]) {
  return Promise.all(
    posts.map(async post => ({
      post,
      slug: await getPostSlug(post),
    }))
  );
}