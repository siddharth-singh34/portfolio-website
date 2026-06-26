import { youtubeId, type BlogPost } from "@/lib/blog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

// Renders a blog post the way a reader sees it. Shared by the /blog page
// and the editor's reader-mode preview.
export default function BlogReadView({ post }: { post: BlogPost }) {
  return (
    <article>
      {post.featuredImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featuredImage}
          alt={post.title}
          className="mb-8 max-h-96 w-full rounded-2xl border border-line object-cover"
        />
      )}

      {post.category && (
        <Badge variant="secondary" className="mb-3">
          {post.category}
        </Badge>
      )}

      <h1 className="text-4xl font-bold leading-tight">
        {post.title || "Untitled"}
      </h1>

      {post.excerpt && (
        <p className="text-muted mt-3 text-lg leading-relaxed">{post.excerpt}</p>
      )}

      <div className="mt-6 flex items-center gap-3 border-b border-line pb-6">
        <Avatar className="size-10">
          <AvatarImage src={post.authorImage} alt={post.authorName} />
          <AvatarFallback className="bg-orange-500 text-sm text-white">
            {initials(post.authorName || "?")}
          </AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-medium">{post.authorName || "Anonymous"}</p>
          <p className="text-muted">
            {post.date} · {post.readingTime} min read
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        {post.blocks.map((block) => {
          if (block.type === "text") {
            return (
              <p
                key={block.id}
                className="text-fg-soft leading-relaxed whitespace-pre-wrap"
              >
                {block.text}
              </p>
            );
          }
          if (block.type === "image") {
            if (!block.src) return null;
            return (
              <figure key={block.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.src}
                  alt={block.alt}
                  className="w-full rounded-xl border border-line object-contain"
                />
                {block.caption && (
                  <figcaption className="text-muted mt-2 text-center text-sm">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          if (!block.src) return null;
          if (block.kind === "youtube") {
            const yt = youtubeId(block.src);
            if (!yt) return null;
            return (
              <div
                key={block.id}
                className="aspect-video w-full overflow-hidden rounded-xl border border-line"
              >
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${yt}`}
                  title="Video"
                  allowFullScreen
                />
              </div>
            );
          }
          return (
            <video
              key={block.id}
              src={block.src}
              controls
              className="w-full rounded-xl border border-line"
            />
          );
        })}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
          {post.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
