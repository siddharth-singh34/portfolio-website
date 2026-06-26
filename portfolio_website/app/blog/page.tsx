"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import BlogReadView from "../components/BlogReadView";
import { loadBlogs, type BlogPost } from "@/lib/blog";
import { Button } from "@/components/ui/button";

export default function BlogReadPage() {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const slug = params.get("slug");
    const all = loadBlogs();
    const found =
      (id && all.find((b) => b.id === id)) ||
      (slug && all.find((b) => b.slug === slug)) ||
      null;
    setPost(found);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="bg-transparent text-fg">
        <div className="mx-auto flex max-w-3xl justify-center px-6 py-24">
          <div
            className="size-6 animate-spin rounded-full border-2 border-line border-t-orange-500"
            aria-label="Loading"
          />
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="bg-transparent text-fg">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="text-muted mt-2">
            This post may have been deleted or never existed.
          </p>
          <Button
            onClick={() => router.push("/profile")}
            className="mt-6 bg-orange-500 text-white hover:bg-orange-600"
          >
            Back to profile
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-transparent text-fg">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 -ml-2 text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <BlogReadView post={post} />
      </div>
    </main>
  );
}
