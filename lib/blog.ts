export type TextBlock = { id: string; type: "text"; text: string };
export type ImageBlock = {
  id: string;
  type: "image";
  src: string;
  alt: string;
  caption?: string;
};
export type VideoBlock = {
  id: string;
  type: "video";
  kind: "file" | "youtube";
  src: string;
};
export type ContentBlock = TextBlock | ImageBlock | VideoBlock;

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  excerpt: string;
  blocks: ContentBlock[];
  category: string;
  tags: string[];
  authorName: string;
  authorImage: string;
  date: string;
  status: "draft" | "published";
  hidden?: boolean;
  metaTitle: string;
  metaDescription: string;
  readingTime: number;
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function readingTimeFromBlocks(blocks: ContentBlock[]) {
  const words = blocks
    .filter((b): b is TextBlock => b.type === "text")
    .reduce(
      (sum, b) => sum + (b.text.trim() ? b.text.trim().split(/\s+/).length : 0),
      0
    );
  return Math.max(1, Math.round(words / 200));
}

export function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(performance.now())}`;
}

export function makeBlock(type: ContentBlock["type"]): ContentBlock {
  const id = newId();
  if (type === "text") return { id, type: "text", text: "" };
  if (type === "image") return { id, type: "image", src: "", alt: "", caption: "" };
  return { id, type: "video", kind: "youtube", src: "" };
}

export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

export function loadBlogs(): BlogPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("blogs");
    return raw ? (JSON.parse(raw) as BlogPost[]) : [];
  } catch {
    return [];
  }
}

export function saveBlogs(blogs: BlogPost[]): boolean {
  try {
    localStorage.setItem("blogs", JSON.stringify(blogs));
    return true;
  } catch {
    return false;
  }
}

export function upsertBlog(post: BlogPost): BlogPost[] {
  const all = loadBlogs();
  const exists = all.some((b) => b.id === post.id);
  const next = exists
    ? all.map((b) => (b.id === post.id ? post : b))
    : [post, ...all];
  saveBlogs(next);
  return next;
}

export function removeBlog(id: string): BlogPost[] {
  const next = loadBlogs().filter((b) => b.id !== id);
  saveBlogs(next);
  return next;
}

// Ensure the slug is unique among existing posts (excluding the one being saved).
export function uniqueSlug(base: string, excludeId?: string): string {
  const taken = new Set(
    loadBlogs()
      .filter((b) => b.id !== excludeId)
      .map((b) => b.slug)
      .filter(Boolean)
  );
  if (!base || !taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
