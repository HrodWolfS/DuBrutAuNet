import fs from "fs";
import matter from "gray-matter";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  image?: string;
}

export interface Post extends PostMeta {
  content: string;
}

function readPost(filename: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
  const { data, content } = matter(raw);
  return {
    slug: (data.slug as string) || filename.replace(/\.mdx?$/, ""),
    title: data.title as string,
    date: data.date as string,
    description: data.description as string,
    image: data.image as string | undefined,
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const post = readPost(f);
      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        description: post.description,
        image: post.image,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): Post | null {
  if (!fs.existsSync(BLOG_DIR)) return null;
  const filename = fs
    .readdirSync(BLOG_DIR)
    .find((f) => f.replace(/\.mdx?$/, "") === slug || f === `${slug}.mdx`);
  if (!filename) return null;
  return readPost(filename);
}
