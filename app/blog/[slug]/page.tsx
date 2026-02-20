import { Callout } from "@/components/Callout";
import { FreelanceComparator } from "@/components/FreelanceComparator";
import { MdxImage } from "@/components/MdxImage";
import { SocialPyramid } from "@/components/SocialPyramid";
import { getAllPosts, getPost } from "@/lib/blog";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

/** Composants disponibles dans les fichiers .mdx */
const mdxComponents = {
  FreelanceComparator,
  SocialPyramid,
  Callout,
  img: MdxImage,
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Du Brut au Net`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-primary mb-3">{post.title}</h1>
        <time dateTime={post.date} className="text-sm text-muted-foreground">
          {new Date(`${post.date}T00:00:00`).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </header>

      <article className="prose max-w-none">
        <MDXRemote source={post.content} components={mdxComponents} />
      </article>
    </div>
  );
}
