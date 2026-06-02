import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { generateOgImageForPost } from "@utils/generateOgImages";
import { getPostsWithSlugs } from "@utils/getPostSlug";

export async function getStaticPaths() {
  const posts = await getCollection("blog").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );
  const postsWithSlugs = await getPostsWithSlugs(posts);

  return postsWithSlugs.map(({ post, slug }) => ({
    params: { slug },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const image = await generateOgImageForPost(props as CollectionEntry<"blog">);

  return new Response(new Uint8Array(image), {
    headers: { "Content-Type": "image/png" },
  });
};
