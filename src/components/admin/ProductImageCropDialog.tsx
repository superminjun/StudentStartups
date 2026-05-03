import { useEffect, useMemo, useRef, useState } from 'react';
import { Move, ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

type Props = {
  open: boolean;
  sourceUrl: string;
  fileName: string;
  fileIndex?: number;
  fileCount?: number;
  onCancel: () => void;
  onSave: (settings: { sourceX: number; sourceY: number; sourceSize: number }) => void;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startOffsetX: number;
  startOffsetY: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function ProductImageCropDialog({
  open,
  sourceUrl,
  fileName,
  fileIndex,
  fileCount,
  onCancel,
  onSave,
}: Props) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [naturalSize, setNaturalSize] = useState({ width: 1200, height: 1200 });
  const [previewSize, setPreviewSize] = useState(320);
  const [dragState, setDragState] = useState<DragState | null>(null);

  useEffect(() => {
    if (!sourceUrl) return;
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth || 1200, height: img.naturalHeight || 1200 });
    };
    img.src = sourceUrl;
  }, [sourceUrl]);

  useEffect(() => {
    if (!open || !previewRef.current || typeof ResizeObserver === 'undefined') return;
    const element = previewRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const nextSize = Math.round(entry.contentRect.width);
      if (nextSize > 0) setPreviewSize(nextSize);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [open]);

  const rendered = useMemo(() => {
    const baseScale = Math.max(previewSize / naturalSize.width, previewSize / naturalSize.height);
    const totalScale = baseScale * zoom;
    const width = naturalSize.width * totalScale;
    const height = naturalSize.height * totalScale;
    const maxX = Math.max(0, (width - previewSize) / 2);
    const maxY = Math.max(0, (height - previewSize) / 2);

    return {
      width,
      height,
      maxX,
      maxY,
    };
  }, [naturalSize.height, naturalSize.width, previewSize, zoom]);

  const clampOffset = (x: number, y: number) => ({
    x: clamp(x, -rendered.maxX, rendered.maxX),
    y: clamp(y, -rendered.maxY, rendered.maxY),
  });

  useEffect(() => {
    const next = clampOffset(offsetX, offsetY);
    if (next.x !== offsetX) setOffsetX(next.x);
    if (next.y !== offsetY) setOffsetY(next.y);
    // We only want to react when the rendered bounds change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendered.maxX, rendered.maxY]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragState({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const next = clampOffset(
      dragState.startOffsetX + (event.clientX - dragState.startX),
      dragState.startOffsetY + (event.clientY - dragState.startY)
    );
    setOffsetX(next.x);
    setOffsetY(next.y);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState?.pointerId === event.pointerId) {
      setDragState(null);
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onCancel() : undefined)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Product Image</DialogTitle>
          <DialogDescription>
            Keep the product centered, drag to reposition, and use zoom to get a clean square crop.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),220px]">
          <div className="space-y-3">
            <div
              ref={previewRef}
              className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-3xl border border-border bg-[hsl(30,15%,94%)] shadow-inner touch-none select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {sourceUrl ? (
                <img
                  src={sourceUrl}
                  alt={fileName}
                  draggable={false}
                  className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                  style={{
                    width: `${rendered.width}px`,
                    height: `${rendered.height}px`,
                    transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
                  }}
                />
              ) : null}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-black/8 ring-inset" />
              <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-white/70 shadow-[0_0_0_9999px_rgba(32,28,24,0.28)]" />
            </div>
            <div className="flex items-center justify-between text-xs text-light">
              <span className="inline-flex items-center gap-1">
                <Move className="size-3.5" />
                Drag to reposition
              </span>
              {fileCount && fileCount > 1 ? (
                <span>
                  Image {fileIndex ?? 1} of {fileCount}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-mid">File</p>
              <p className="mt-1 break-words text-sm text-charcoal">{fileName}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-mid">
                <span className="inline-flex items-center gap-1">
                  <ZoomIn className="size-3.5" />
                  Zoom
                </span>
                <span>{zoom.toFixed(2)}x</span>
              </div>
              <Slider
                min={1}
                max={3}
                step={0.01}
                value={[zoom]}
                onValueChange={(value) => {
                  const nextZoom = value[0] ?? 1;
                  const next = clampOffset(offsetX, offsetY);
                  setZoom(nextZoom);
                  setOffsetX(next.x);
                  setOffsetY(next.y);
                }}
              />
            </div>

            <div className="rounded-2xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-mid">
              We will save a compressed square version for faster loading in the shop and product detail pages.
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-mid hover:text-charcoal"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const totalScale = rendered.width / naturalSize.width;
              const sourceSize = previewSize / totalScale;
              const sourceX = naturalSize.width / 2 - sourceSize / 2 - offsetX / totalScale;
              const sourceY = naturalSize.height / 2 - sourceSize / 2 - offsetY / totalScale;
              onSave({ sourceX, sourceY, sourceSize });
            }}
            className="rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white hover:bg-[hsl(20,8%,28%)]"
          >
            Save Cropped Image
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
