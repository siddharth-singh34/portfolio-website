"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";

import AvatarCropper from "../components/AvatarCropper";
import { type BlogPost, loadBlogs, removeBlog, upsertBlog } from "@/lib/blog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// A label + value row with an orange "Edit" link that turns into an input.
function EditableField({
  label,
  value,
  type = "text",
  onSave,
}: {
  label: string;
  value: string;
  type?: string;
  onSave: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function start() {
    setDraft(value);
    setEditing(true);
  }
  function save() {
    const v = draft.trim();
    if (v) onSave(v);
    setEditing(false);
  }

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground">{label}</Label>
        {!editing && (
          <Button
            type="button"
            variant="link"
            onClick={start}
            className="h-auto p-0 text-xs text-orange-500"
          >
            Edit
          </Button>
        )}
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={save}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <p className="font-medium">{value}</p>
      )}
    </div>
  );
}

type User = {
  name: string;
  email: string;
  avatar?: string;
  avatarOriginal?: string;
};

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

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  // Raw picked image waiting to be cropped (opens the cropper dialog).
  const [pending, setPending] = useState<string | null>(null);
  // Blog posts (stored locally for now) + the upload dialog state.
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      setUser(null);
    }
    setBlogs(loadBlogs());
    setReady(true);
  }, []);

  function deleteBlog(id: string) {
    setBlogs(removeBlog(id));
  }

  function patchBlog(b: BlogPost, patch: Partial<BlogPost>) {
    setBlogs(upsertBlog({ ...b, ...patch }));
  }

  function persist(next: User) {
    setUser(next);
    localStorage.setItem("user", JSON.stringify(next));
    window.dispatchEvent(new Event("auth-changed"));
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 2_000_000) {
      setError("Image is too large (max 2 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPending(reader.result as string);
    reader.readAsDataURL(file);
    // Allow re-picking the same file later.
    e.target.value = "";
  }

  function removePicture() {
    if (!user) return;
    const { avatar: _a, avatarOriginal: _o, ...rest } = user;
    void _a;
    void _o;
    persist(rest);
  }

  // Re-open the cropper on the existing photo (no new file needed).
  function editPicture() {
    if (!user) return;
    setPending(user.avatarOriginal ?? user.avatar ?? null);
  }

  function logout() {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  }

  if (!ready) return null;

  return (
    <main className="bg-transparent text-fg">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Blogs — main area (left / centre) */}
          <section className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold">Blogs</h1>
              <Button
                onClick={() => router.push("/blog-editor")}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                + Upload blog
              </Button>
            </div>

            {blogs.length === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground py-20 text-center">
                  No blogs yet — your posts will show up here.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {blogs.map((b) => (
                  <Card
                    key={b.id}
                    className="relative gap-0 overflow-hidden py-0 transition hover:border-line-strong hover:shadow-lg"
                  >
                    {b.featuredImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.featuredImage}
                        alt=""
                        className="h-40 w-full object-cover"
                      />
                    )}
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">
                          <Link
                            href={
                              b.status === "published"
                                ? `/blog?id=${b.id}`
                                : `/blog-editor?id=${b.id}`
                            }
                            className="rounded-sm outline-none after:absolute after:inset-0 hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            {b.title || "Untitled"}
                          </Link>
                        </h3>
                        <div className="relative z-10 flex shrink-0 items-center gap-1">
                          {/* sits above the stretched link so the menu stays clickable */}
                          <Badge
                            variant={
                              b.status === "published" &&
                              !b.hidden &&
                              (!b.date || b.date <= today)
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize"
                          >
                            {b.status !== "published"
                              ? b.status
                              : b.hidden
                                ? "Hidden"
                                : b.date && b.date > today
                                  ? "Scheduled"
                                  : "published"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-full"
                                aria-label="Blog options"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="size-4"
                                  aria-hidden="true"
                                >
                                  <circle cx="12" cy="5" r="1.6" />
                                  <circle cx="12" cy="12" r="1.6" />
                                  <circle cx="12" cy="19" r="1.6" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {b.status !== "published" && (
                                <DropdownMenuItem
                                  onClick={() => router.push(`/blog?id=${b.id}`)}
                                >
                                  Reader mode
                                </DropdownMenuItem>
                              )}
                              {b.status === "published" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    patchBlog(b, { hidden: !b.hidden })
                                  }
                                >
                                  {b.hidden ? "Show in Blogs" : "Hide from Blogs"}
                                </DropdownMenuItem>
                              )}
                              {b.status === "published" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    patchBlog(b, { status: "draft" })
                                  }
                                >
                                  Move to draft
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/blog-editor?id=${b.id}`)
                                }
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPendingDelete(b)}
                                className="text-red-600 dark:text-red-500"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {b.date} · {b.readingTime} min read
                        {b.category ? ` · ${b.category}` : ""}
                      </p>
                      {b.excerpt && (
                        <p className="text-muted-foreground mt-2 text-sm">
                          {b.excerpt}
                        </p>
                      )}
                      {b.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {b.tags.map((t) => (
                            <Badge key={t} variant="outline">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Profile — right column */}
          <aside className="w-full shrink-0 lg:w-80">
            <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profile</CardTitle>
            <CardDescription>
              {user ? "Your account details." : "You're not logged in."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="grid gap-6">
                {/* Profile picture (defaults to initials) */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Avatar className="size-24 text-2xl">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {user.avatar && (
                      <Button
                        type="button"
                        size="icon-sm"
                        onClick={editPicture}
                        aria-label="Edit picture"
                        title="Edit picture"
                        className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-orange-500 text-white shadow hover:bg-orange-600"
                      >
                        <Pencil />
                      </Button>
                    )}
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPick}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      {user.avatar ? "Change picture" : "Add profile picture"}
                    </Button>
                    {user.avatar && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removePicture}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {error && (
                    <p className="text-sm font-medium text-red-500">{error}</p>
                  )}
                </div>

                <EditableField
                  label="Name"
                  value={user.name}
                  onSave={(v) => persist({ ...user, name: v })}
                />
                <EditableField
                  label="Email"
                  type="email"
                  value={user.email}
                  onSave={(v) => persist({ ...user, email: v.toLowerCase() })}
                />

                <Button
                  type="button"
                  onClick={logout}
                  className="w-full bg-orange-500 text-white hover:bg-orange-600"
                >
                  Log out
                </Button>
              </div>
            ) : (
              <Button
                asChild
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
              >
                <a href="/login">Go to login</a>
              </Button>
            )}
          </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => {
          if (!o) setPendingDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this blog?</DialogTitle>
            <DialogDescription>
              &ldquo;{pendingDelete?.title || "Untitled"}&rdquo; will be
              permanently deleted. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button
              onClick={() => {
                if (pendingDelete) deleteBlog(pendingDelete.id);
                setPendingDelete(null);
              }}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AvatarCropper
        image={pending}
        open={pending !== null}
        onCancel={() => setPending(null)}
        onSave={(dataUrl) => {
          if (user)
            persist({
              ...user,
              avatar: dataUrl,
              avatarOriginal: pending ?? user.avatarOriginal,
            });
          setPending(null);
        }}
      />
    </main>
  );
}
