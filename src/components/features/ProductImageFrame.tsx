import { cn } from '@/lib/utils';

type ProductImageFrameProps = {
  src: string;
  alt: string;
  priority?: boolean;
  fit?: 'cover' | 'contain';
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
  fit = 'cover',
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
        className={cn('product-image-media', fit === 'contain' ? 'product-image-media--contain' : 'product-image-media--cover', imageClassName)}
      />
    </div>
  );
}
