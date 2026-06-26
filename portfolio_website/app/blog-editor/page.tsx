"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import BlockEditor from "../components/BlockEditor";
import BlogReadView from "../components/BlogReadView";
import {
  getBlog,
  loadAllBlogs,
  makeBlock,
  newId,
  readingTimeFromBlocks,
  slugify,
  uniqueSlug,
  upsertBlog,
  type BlogPost,
  type ContentBlock,
} from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type FormSnapshot = {
  title: string;
  slug: string;
  featuredImage: string;
  excerpt: string;
  blocks: ContentBlock[];
  category: string;
  tags: string;
  authName: string;
  authImg: string;
  date: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
};

function serialize(v: FormSnapshot) {
  return JSON.stringify(v);
}

export default function BlogEditorPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [initialSnap, setInitialSnap] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const featuredRef = useRef<HTMLInputElement>(null);
  const [featuredError, setFeaturedError] = useState("");
  const authorRef = useRef<HTMLInputElement>(null);
  const [authorError, setAuthorError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [featuredImage, setFeaturedImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [authName, setAuthName] = useState("");
  const [authImg, setAuthImg] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [saveError, setSaveError] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);

  useEffect(() => {
    const pid = new URLSearchParams(window.location.search).get("id");
    let author = "";
    let authorImg = "";
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        author = u.name ?? "";
        authorImg = u.avatar ?? "";
      }
    } catch {
      // ignore
    }

    async function init() {
      if (pid) {
        const post = await getBlog(pid);
        if (post) {
          setId(post.id);
          setTitle(post.title);
          setSlug(post.slug);
          setFeaturedImage(post.featuredImage);
          setExcerpt(post.excerpt);
          setBlocks(post.blocks?.length ? post.blocks : [makeBlock("text")]);
          setCategory(post.category);
          setTags(post.tags.join(", "));
          setAuthName(post.authorName);
          setAuthImg(post.authorImage);
          setDate(post.date);
          setStatus(post.status);
          setMetaTitle(post.metaTitle);
          setMetaDescription(post.metaDescription);
          setReadingTime(String(post.readingTime));
          setLoaded(true);
          return;
        }
      }

      setBlocks([makeBlock("text")]);
      setDate(new Date().toISOString().slice(0, 10));
      setAuthName(author);
      setAuthImg(authorImg);
      setLoaded(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(title));
  }, [title, slugEdited]);

  function currentSnapshot() {
    return serialize({
      title,
      slug,
      featuredImage,
      excerpt,
      blocks,
      category,
      tags,
      authName,
      authImg,
      date,
      status,
      metaTitle,
      metaDescription,
      readingTime,
    });
  }

  // Capture the form state once loaded, to detect unsaved changes later.
  useEffect(() => {
    if (loaded && initialSnap === null) setInitialSnap(currentSnapshot());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const dirty = initialSnap !== null && currentSnapshot() !== initialSnap;

  function handleBack() {
    if (dirty) setConfirmOpen(true);
    else router.push("/profile");
  }

  function onPickFeatured(e: ChangeEvent<HTMLInputElement>) {
    setFeaturedError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFeaturedError("Choose an image file.");
      return;
    }
    if (file.size > 3_000_000) {
      setFeaturedError("Image too large (max 3 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFeaturedImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function onPickAuthor(e: ChangeEvent<HTMLInputElement>) {
    setAuthorError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAuthorError("Choose an image file.");
      return;
    }
    if (file.size > 2_000_000) {
      setAuthorError("Image too large (max 2 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAuthImg(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function buildPost(nextStatus: "draft" | "published"): BlogPost {
    const rt = readingTime ? parseInt(readingTime, 10) : readingTimeFromBlocks(blocks);
    return {
      id: id ?? newId(),
      title: title.trim(),
      slug: slug || slugify(title),
      featuredImage: featuredImage.trim(),
      excerpt: excerpt.trim(),
      blocks,
      category: category.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      authorName: authName.trim(),
      authorImage: authImg.trim(),
      date,
      status: nextStatus,
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim(),
      readingTime: Number.isFinite(rt) && rt > 0 ? rt : 1,
    };
  }

  async function save(nextStatus: "draft" | "published") {
    setSaveError("");
    if (nextStatus === "published" && !title.trim()) {
      setSaveError("Please add a title before publishing.");
      setErrorOpen(true);
      return;
    }
    const post = buildPost(nextStatus);
    // Make the slug unique against existing posts (excluding this one).
    const existing = await loadAllBlogs();
    const taken = existing.filter((b) => b.id !== post.id).map((b) => b.slug);
    post.slug = uniqueSlug(post.slug, taken);
    setStatus(nextStatus);

    const ok = await upsertBlog(post);
    if (!ok) {
      setSaveError(
        "Couldn't save — make sure you're logged in and the backend is reachable, then try again."
      );
      setErrorOpen(true);
      return;
    }
    router.push("/profile");
  }

  // Warn on browser refresh/close when there are unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  });

  if (!loaded) return null;

  // Reader-mode preview of the current (unsaved) content.
  if (preview) {
    return (
      <main className="min-h-screen bg-transparent text-fg">
        <div className="sticky top-0 z-20 border-b border-line bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
            <Button
              variant="ghost"
              onClick={() => setPreview(false)}
              className="-ml-2"
            >
              <ArrowLeft className="size-4" /> Exit reader mode
            </Button>
            <span className="text-muted-foreground text-xs">Reader preview</span>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <BlogReadView post={buildPost(status)} />
        </div>
      </main>
    );
  }

  const computedReading = readingTime || readingTimeFromBlocks(blocks);
  const today = new Date().toISOString().slice(0, 10);
  const scheduled = status === "published" && !!date && date > today;

  return (
    <main className="min-h-screen bg-transparent text-fg">
      {/* Top action bar */}
      <div className="sticky top-0 z-20 border-b border-line bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label="Back to profile"
            >
              <ArrowLeft />
            </Button>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">
                {id ? "Editing post" : "New post"}
              </p>
              <p className="truncate font-semibold">{title || "Untitled"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setPreview(true)}>
              Reader mode
            </Button>
            <Button variant="outline" onClick={() => save("draft")}>
              Save draft
            </Button>
            <Button
              onClick={() => save("published")}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Editor */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 grid gap-2">
              <Label htmlFor="e-title">Title</Label>
              <Input
                id="e-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="h-auto py-2.5 text-2xl font-bold"
              />
            </div>

            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="promote">Promote</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* CONTENT */}
              <TabsContent value="content" className="grid gap-5 pt-2">
                <div className="grid gap-2">
                  <Label htmlFor="e-featured">Featured image (cover)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="e-featured"
                      type="url"
                      value={featuredImage.startsWith("data:") ? "" : featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="Paste an image URL…"
                      className="flex-1"
                    />
                    <input
                      ref={featuredRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickFeatured}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => featuredRef.current?.click()}
                    >
                      Upload
                    </Button>
                    {featuredImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setFeaturedImage("")}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {featuredImage.startsWith("data:") ? (
                    <p className="text-xs font-medium text-green-600 dark:text-green-500">
                      ✓ Uploaded image
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      Paste a link, or upload an image if you don&apos;t have one.
                    </p>
                  )}
                  {featuredImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredImage}
                      alt="Featured preview"
                      className="mt-1 max-h-44 w-full rounded-lg border border-line object-cover"
                    />
                  )}
                  {featuredError && (
                    <p className="text-xs font-medium text-red-500">
                      {featuredError}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="e-excerpt">Excerpt</Label>
                  <Textarea
                    id="e-excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="A short summary…"
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Body</Label>
                  <BlockEditor blocks={blocks} onChange={setBlocks} />
                </div>
              </TabsContent>

              {/* PROMOTE (SEO) */}
              <TabsContent value="promote" className="grid gap-5 pt-2">
                <div className="grid gap-2">
                  <Label htmlFor="e-slug">Slug</Label>
                  <Input
                    id="e-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="my-first-post"
                  />
                  <p className="text-muted-foreground text-xs">
                    Auto-filled from the title — edit it to override.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="e-metatitle">SEO meta title</Label>
                  <Input
                    id="e-metatitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Defaults to the title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="e-metadesc">SEO meta description</Label>
                  <Textarea
                    id="e-metadesc"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Description for search engines…"
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* SETTINGS */}
              <TabsContent value="settings" className="grid gap-5 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="e-category">Category</Label>
                    <Input
                      id="e-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Engineering"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="e-tags">Tags (comma-separated)</Label>
                    <Input
                      id="e-tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="react, nextjs"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="e-author">Author name</Label>
                    <Input
                      id="e-author"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="e-authorimg">Author image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="e-authorimg"
                        type="url"
                        value={authImg.startsWith("data:") ? "" : authImg}
                        onChange={(e) => setAuthImg(e.target.value)}
                        placeholder="Paste an image URL…"
                        className="flex-1"
                      />
                      <input
                        ref={authorRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onPickAuthor}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => authorRef.current?.click()}
                      >
                        Upload
                      </Button>
                    </div>
                    {authImg && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={authImg}
                        alt="Author preview"
                        className="size-12 rounded-full border border-line object-cover"
                      />
                    )}
                    {authorError && (
                      <p className="text-xs font-medium text-red-500">
                        {authorError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="e-date">Publication date</Label>
                    <Input
                      id="e-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="e-reading">Reading time (minutes)</Label>
                    <Input
                      id="e-reading"
                      type="number"
                      min={1}
                      value={readingTime}
                      onChange={(e) => setReadingTime(e.target.value)}
                      placeholder="Auto if blank"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Status sidebar */}
          <aside className="w-full shrink-0 lg:w-72">
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  Status
                  <Badge
                    variant={status === "published" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Visibility</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as "draft" | "published")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-muted-foreground grid gap-1.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <span>Slug</span>
                    <span className="text-fg truncate">/{slug || "…"}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Date</span>
                    <span className="text-fg">{date || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Reading time</span>
                    <span className="text-fg">{computedReading} min</span>
                  </div>
                </div>

                {scheduled && (
                  <p className="text-xs font-medium text-orange-500">
                    Scheduled — goes live on {date}.
                  </p>
                )}

                <Button
                  onClick={() => save(status)}
                  className="w-full bg-orange-500 text-white hover:bg-orange-600"
                >
                  Save
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Unsaved-changes confirmation on back */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Leave without saving?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Save them as a draft, leave anyway, or
              keep editing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button
              onClick={() => save("draft")}
              className="w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              Save as draft
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/profile")}
              className="w-full"
            >
              Leave without saving
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              className="w-full"
            >
              Keep editing
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save / validation error */}
      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Can&apos;t save yet</DialogTitle>
            <DialogDescription>{saveError}</DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setErrorOpen(false)}
            className="w-full bg-orange-500 text-white hover:bg-orange-600"
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
