import { cn } from '@/lib/utils';

type ProductImageFrameProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  containerClassName?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
};

export default function ProductImageFrame({
  src,
  alt,
  priority = false,
  sizes,
  containerClassName,
  imageClassName,
  width = 1200,
  height = 1200,
}: ProductImageFrameProps) {
  return (
    <div className={cn('product-image-shell', containerClassName)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        width={width}
        height={height}
        sizes={sizes}
        className={cn('product-image-media', imageClassName)}
      />
    </div>
  );
}
