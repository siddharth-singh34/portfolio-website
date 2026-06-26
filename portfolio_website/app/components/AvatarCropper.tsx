"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const STAGE = 288; // full preview area (px) — you see the whole image here
const CIRCLE = 224; // diameter of the crop circle, centered in the stage
const OUTPUT = 256; // exported avatar size (px)

type Props = {
  image: string | null;
  open: boolean;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
};

export default function AvatarCropper({ image, open, onCancel, onSave }: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // Base "cover" size so the image fills the crop circle at zoom 1.
  const [cover, setCover] = useState({ w: CIRCLE, h: CIRCLE });
  const natural = useRef({ w: 0, h: 0 });
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(
    null
  );

  useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.onload = () => {
      natural.current = { w: img.naturalWidth, h: img.naturalHeight };
      const scale = CIRCLE / Math.min(img.naturalWidth, img.naturalHeight);
      setCover({ w: img.naturalWidth * scale, h: img.naturalHeight * scale });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = image;
  }, [image]);

  // Keep the image covering the crop circle (no empty gaps inside it).
  function clamp(o: { x: number; y: number }, z: number) {
    const maxX = Math.max(0, (cover.w * z - CIRCLE) / 2);
    const maxY = Math.max(0, (cover.h * z - CIRCLE) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, o.x)),
      y: Math.min(maxY, Math.max(-maxY, o.y)),
    };
  }

  function onPointerDown(e: PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: PointerEvent) {
    if (!drag.current) return;
    setOffset(
      clamp(
        {
          x: drag.current.ox + (e.clientX - drag.current.px),
          y: drag.current.oy + (e.clientY - drag.current.py),
        },
        zoom
      )
    );
  }
  function onPointerUp() {
    drag.current = null;
  }

  function handleZoom(z: number) {
    setZoom(z);
    setOffset((o) => clamp(o, z));
  }

  function handleSave() {
    if (!image) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { w: nw, h: nh } = natural.current;
      const s = (cover.w * zoom) / nw; // displayed px per natural px
      const srcW = CIRCLE / s;
      const srcH = CIRCLE / s;
      const srcX = nw / 2 - (CIRCLE / 2 + offset.x) / s;
      const srcY = nh / 2 - (CIRCLE / 2 + offset.y) / s;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT, OUTPUT);
      onSave(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = image;
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust photo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Stage: shows the whole image; drag to move. Outside the circle is dimmed. */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative cursor-grab touch-none overflow-hidden rounded-xl bg-black/80 active:cursor-grabbing"
            style={{ width: STAGE, height: STAGE }}
          >
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Crop preview"
                draggable={false}
                className="pointer-events-none absolute top-1/2 left-1/2 max-w-none select-none"
                style={{
                  width: cover.w,
                  height: cover.h,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                }}
              />
            )}

            {/* Translucent mask: everything outside the circle is dimmed */}
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: CIRCLE,
                height: CIRCLE,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                border: "2px solid rgba(255,255,255,0.85)",
              }}
            />
          </div>

          <div className="flex w-full items-center gap-3">
            <span className="text-muted-foreground text-xs">Zoom</span>
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={(v) => handleZoom(v[0])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            Save photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
