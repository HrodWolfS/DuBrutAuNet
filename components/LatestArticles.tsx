import type { PostMeta } from "@/lib/blog";
import Link from "next/link";

interface Props {
  posts: PostMeta[];
}

export function LatestArticles({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="w-full max-w-5xl mx-auto mt-20 mb-12 px-4">
      <h2 className="text-lg font-semibold text-foreground">
        Guides et analyses
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <article className="bg-card border border-border rounded-2xl hover:border-primary hover:shadow-sm transition-all h-full overflow-hidden flex flex-col">
              {post.image ? (
                <div className="w-full h-40 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-muted/30" />
              )}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-foreground leading-snug">
                  {post.title}
                </h3>
                <time
                  dateTime={post.date}
                  className="block text-sm text-muted-foreground mt-1"
                >
                  {new Date(`${post.date}T00:00:00`).toLocaleDateString(
                    "fr-FR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </time>
                <p className="text-muted-foreground text-sm mt-3 line-clamp-2">
                  {post.description}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
