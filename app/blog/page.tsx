import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Du Brut au Net",
  description:
    "Guides et articles sur le salaire brut/net, les cotisations sociales et le statut freelance en France.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 w-full">
      <h1 className="text-2xl font-bold mb-8 text-foreground">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">Aucun article pour le moment.</p>
      ) : (
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <article>
                  {post.image && (
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.date}
                    className="block text-xs text-muted-foreground mt-1"
                  >
                    {new Date(`${post.date}T00:00:00`).toLocaleDateString(
                      "fr-FR",
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </time>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {post.description}
                  </p>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
