"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image as ImageIcon,
  Trash2,
  Type,
  Video,
} from "lucide-react";

import {
  makeBlock,
  youtubeId,
  type ContentBlock,
  type ImageBlock,
  type TextBlock,
  type VideoBlock,
} from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const dragIndex = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  function update(id: string, patch: Partial<ContentBlock>) {
    onChange(
      blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ContentBlock) : b))
    );
  }
  function remove(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }
  function add(type: ContentBlock["type"]) {
    onChange([...blocks, makeBlock(type)]);
  }
  function move(from: number, to: number) {
    if (from === to) return;
    const next = [...blocks];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  }

  function onDrop(e: DragEvent, to: number) {
    e.preventDefault();
    if (dragIndex.current !== null) move(dragIndex.current, to);
    dragIndex.current = null;
    setOver(null);
  }

  return (
    <div className="grid gap-3">
      {blocks.length === 0 && (
        <p className="text-muted-foreground rounded-lg border border-dashed border-line py-8 text-center text-sm">
          Empty body — add a text, image, or video block below.
        </p>
      )}

      {blocks.map((block, i) => (
        <div
          key={block.id}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(i);
          }}
          onDrop={(e) => onDrop(e, i)}
          className={`rounded-xl border bg-surface/40 p-3 transition ${
            over === i ? "border-orange-500" : "border-line"
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <span
              draggable
              onDragStart={() => {
                dragIndex.current = i;
              }}
              onDragEnd={() => {
                dragIndex.current = null;
                setOver(null);
              }}
              className="cursor-grab text-muted-foreground active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="size-4" />
            </span>
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
              {block.type === "text" && <Type className="size-3.5" />}
              {block.type === "image" && <ImageIcon className="size-3.5" />}
              {block.type === "video" && <Video className="size-3.5" />}
              {block.type}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Move block up"
              >
                <ChevronUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(i, i + 1)}
                disabled={i === blocks.length - 1}
                aria-label="Move block down"
              >
                <ChevronDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(block.id)}
                aria-label="Delete block"
                className="text-red-500 hover:text-red-500"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {block.type === "text" && (
            <Textarea
              value={(block as TextBlock).text}
              onChange={(e) => update(block.id, { text: e.target.value })}
              placeholder="Write a paragraph…"
              rows={4}
            />
          )}

          {block.type === "image" && (
            <ImageBlockEditor
              block={block as ImageBlock}
              onUpdate={(patch) => update(block.id, patch)}
            />
          )}

          {block.type === "video" && (
            <VideoBlockEditor
              block={block as VideoBlock}
              onUpdate={(patch) => update(block.id, patch)}
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => add("text")}>
          <Type className="size-4" /> Add text
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add("image")}>
          <ImageIcon className="size-4" /> Add image
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add("video")}>
          <Video className="size-4" /> Add video
        </Button>
      </div>
    </div>
  );
}

function ImageBlockEditor({
  block,
  onUpdate,
}: {
  block: ImageBlock;
  onUpdate: (patch: Partial<ImageBlock>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > 3_000_000) return setError("Image too large (max 3 MB).");
    onUpdate({ src: await fileToDataUrl(file) });
    e.target.value = "";
  }

  return (
    <div className="grid gap-2">
      {block.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.src}
          alt={block.alt}
          className="max-h-72 w-full rounded-lg border border-line object-contain"
        />
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed border-line py-8 text-center text-sm">
          No image yet
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>
          {block.src ? "Replace image" : "Upload image"}
        </Button>
        <Input
          value={block.alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Alt text (for screen readers / SEO)"
          className="h-8"
        />
      </div>
      <Input
        value={block.caption ?? ""}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        placeholder="Caption (shown under the image, e.g. “De Bruyne at the 2022 World Cup”)"
        className="h-8"
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function VideoBlockEditor({
  block,
  onUpdate,
}: {
  block: VideoBlock;
  onUpdate: (patch: Partial<VideoBlock>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const ytid = block.kind === "youtube" ? youtubeId(block.src) : null;

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) return setError("Choose a video file.");
    if (file.size > 2_000_000)
      return setError(
        "Video too large for browser storage (max 2 MB). Use a YouTube link for full videos."
      );
    onUpdate({ src: await fileToDataUrl(file) });
    e.target.value = "";
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant={block.kind === "youtube" ? "default" : "outline"}
          onClick={() => onUpdate({ kind: "youtube", src: "" })}
        >
          YouTube
        </Button>
        <Button
          type="button"
          size="sm"
          variant={block.kind === "file" ? "default" : "outline"}
          onClick={() => onUpdate({ kind: "file", src: "" })}
        >
          Upload MP4
        </Button>
      </div>

      {block.kind === "youtube" ? (
        <>
          <Input
            value={block.src}
            onChange={(e) => onUpdate({ src: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=…"
          />
          {ytid && (
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-line">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${ytid}`}
                title="YouTube preview"
                allowFullScreen
              />
            </div>
          )}
        </>
      ) : (
        <>
          <input
            ref={ref}
            type="file"
            accept="video/mp4,video/*"
            className="hidden"
            onChange={onPick}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>
            {block.src ? "Replace video" : "Upload MP4"}
          </Button>
          <p className="text-muted-foreground text-xs">
            Small clips only (≤2 MB) — use a YouTube link for full videos.
          </p>
          {block.src && (
            <video
              src={block.src}
              controls
              className="max-h-72 w-full rounded-lg border border-line"
            />
          )}
        </>
      )}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
