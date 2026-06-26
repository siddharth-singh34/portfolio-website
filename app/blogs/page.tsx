"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { loadBlogs, type BlogPost } from "@/lib/blog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setPosts(
      loadBlogs().filter(
        // Published, not hidden, and not scheduled for a future date.
        (b) =>
          b.status === "published" &&
          !b.hidden &&
          (!b.date || b.date <= today)
      )
    );
    setReady(true);
  }, []);

  return (
    <main className="bg-transparent text-fg">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-2 text-4xl font-bold">Blogs</h1>
        <p className="text-muted mb-8 max-w-xl">
          Published posts from the community.
        </p>

        {!ready ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl border border-line bg-surface/40"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-20 text-center">
              No published blogs yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((b) => (
              <Card
                key={b.id}
                asChild
                className="cursor-pointer gap-0 overflow-hidden py-0 transition hover:border-line-strong hover:shadow-lg"
              >
                <Link href={`/blog?id=${b.id}`}>
                  {b.featuredImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.featuredImage}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <CardContent className="py-5">
                    {b.category && (
                      <Badge variant="secondary" className="mb-2">
                        {b.category}
                      </Badge>
                    )}
                    <h3 className="text-lg font-semibold">
                      {b.title || "Untitled"}
                    </h3>
                    {b.excerpt && (
                      <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">
                        {b.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarImage src={b.authorImage} alt={b.authorName} />
                        <AvatarFallback className="bg-orange-500 text-[10px] text-white">
                          {initials(b.authorName || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground text-xs">
                        {b.authorName || "Anonymous"} · {b.date} · {b.readingTime}{" "}
                        min read
                      </span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
