const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to load image.'));
    img.src = src;
  });

const replaceExtension = (name: string, extension: string) => {
  const base = name.replace(/\.[^.]+$/, '') || 'product-image';
  return `${base}.${extension}`;
};

export type ProductCropSettings = {
  x: number;
  y: number;
  width: number;
  height: number;
  outputSize?: number;
  quality?: number;
};

export async function getFilePreviewUrl(file: File) {
  return readFileAsDataUrl(file);
}

export async function cropProductImageToSquare(
  file: File,
  sourceUrl: string,
  settings: ProductCropSettings
) {
  const image = await loadImage(sourceUrl);
  const requestedWidth = Math.round(settings.width);
  const requestedHeight = Math.round(settings.height);
  const requestedX = Math.round(settings.x);
  const requestedY = Math.round(settings.y);
  const cropWidth = Math.max(
    1,
    Math.min(
      requestedWidth,
      image.naturalWidth,
      image.naturalHeight
    )
  );
  const cropHeight = Math.max(
    1,
    Math.min(
      requestedHeight,
      image.naturalHeight,
      image.naturalWidth
    )
  );
  const sourceSize = Math.max(1, Math.min(cropWidth, cropHeight));
  const sourceX = Math.max(0, Math.min(image.naturalWidth - sourceSize, requestedX));
  const sourceY = Math.max(0, Math.min(image.naturalHeight - sourceSize, requestedY));
  const outputSize = Math.max(600, Math.min(settings.outputSize ?? 1400, Math.round(sourceSize)));
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas is not available in this browser.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);

  const preferredType = 'image/webp';
  const quality = settings.quality ?? 0.86;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, preferredType, quality);
  });

  if (blob) {
    return new File([blob], replaceExtension(file.name, 'webp'), { type: preferredType });
  }

  const fallbackBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.9);
  });

  if (!fallbackBlob) {
    throw new Error('Unable to process the cropped image.');
  }

  return new File([fallbackBlob], replaceExtension(file.name, 'jpg'), { type: 'image/jpeg' });
}
