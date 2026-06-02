import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import { getPostsWithSlugs } from "@utils/getPostSlug";
import { SITE } from "@config";

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);
  const postsWithSlugs = await getPostsWithSlugs(sortedPosts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: postsWithSlugs.map(({ post, slug }) => ({
      link: `posts/${slug}/`,
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.modDatetime ?? post.data.pubDatetime),
    })),
  });
}
