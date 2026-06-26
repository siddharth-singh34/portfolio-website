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

// ---- Backend storage --------------------------------------------------------
// Blogs live on the FastAPI backend so every visitor sees the same posts.
// Reading is public; creating/editing/deleting requires the owner's token
// (saved in localStorage on login).

const API =
  process.env.NEXT_PUBLIC_API_URL ?? "https://portfolio-backend-o2f1.onrender.com";

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Public: every published, visible, non-future post (for the Blogs page).
export async function loadPublicBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API}/blogs`);
    if (!res.ok) return [];
    return (await res.json()) as BlogPost[];
  } catch {
    return [];
  }
}

// Owner: every post including drafts/hidden (for the profile page).
export async function loadAllBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API}/admin/blogs`, { headers: authHeader() });
    if (!res.ok) return [];
    return (await res.json()) as BlogPost[];
  } catch {
    return [];
  }
}

// A single post by id (owner can also fetch their own drafts).
export async function getBlog(id: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API}/blog?id=${encodeURIComponent(id)}`, {
      headers: authHeader(),
    });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}

// Create or update a post (owner only). Returns true on success.
export async function upsertBlog(post: BlogPost): Promise<boolean> {
  try {
    const res = await fetch(`${API}/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(post),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Delete a post by id (owner only). Returns true on success.
export async function removeBlog(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/blogs?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Ensure the slug is unique among the given taken slugs.
export function uniqueSlug(base: string, taken: string[]): string {
  const set = new Set(taken.filter(Boolean));
  if (!base || !set.has(base)) return base;
  let n = 2;
  while (set.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
