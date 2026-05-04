import { useEffect, useMemo, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Focus, ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { PRODUCT_IMAGE_ASPECT_RATIO } from '@/constants/productImages';

type Props = {
  open: boolean;
  sourceUrl: string;
  fileName: string;
  fileIndex?: number;
  fileCount?: number;
  onCancel: () => void;
  onSave: (cropPixels: Area) => void;
};

export default function ProductImageCropDialog({
  open,
  sourceUrl,
  fileName,
  fileIndex,
  fileCount,
  onCancel,
  onSave,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [open, sourceUrl]);

  const helperText = useMemo(() => {
    if (fileCount && fileCount > 1) {
      return `Image ${fileIndex ?? 1} of ${fileCount}`;
    }
    return 'Square crop for live product image';
  }, [fileCount, fileIndex]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crop Product Image</DialogTitle>
          <DialogDescription>
            Position the product exactly where you want it. This fixed square frame matches the live product detail image, and you can reopen it later from any product preview.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),240px]">
          <div className="space-y-3">
            <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-3xl border border-border bg-[hsl(30,15%,94%)]">
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                aspect={PRODUCT_IMAGE_ASPECT_RATIO}
                cropShape="rect"
                showGrid={false}
                objectFit="cover"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
              />
              <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-white/70 shadow-[0_0_0_9999px_rgba(32,28,24,0.28)]" />
            </div>
            <div className="flex items-center justify-between text-xs text-light">
              <span className="inline-flex items-center gap-1">
                <Focus className="size-3.5" />
                Drag to choose the focus area
              </span>
              <span>{helperText}</span>
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
                onValueChange={(value) => setZoom(value[0] ?? 1)}
              />
            </div>

            <div className="rounded-2xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-mid">
              Save this crop to control exactly what stays visible once the live site uses full-bleed image cover mode.
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
              if (!croppedAreaPixels) return;
              onSave(croppedAreaPixels);
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
