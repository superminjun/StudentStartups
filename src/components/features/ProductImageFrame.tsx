import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

type ProductImageFrameProps = {
  src: string;
  alt: string;
  priority?: boolean;
  fit?: 'cover' | 'contain';
  variant?: 'square' | 'detail';
  sizes?: string;
  containerClassName?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  fallbackLabel?: string;
};

export default function ProductImageFrame({
  src,
  alt,
  priority = false,
  fit = 'cover',
  variant = 'square',
  sizes,
  containerClassName,
  imageClassName,
  width = 1200,
  height = 1200,
  fallbackLabel,
}: ProductImageFrameProps) {
  const { t } = useLanguage();
  const hasImage = Boolean(src?.trim());

  return (
    <div className={cn('product-image-shell', variant === 'detail' && 'product-image-shell--detail', containerClassName)}>
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width={width}
          height={height}
          sizes={sizes}
          className={cn(
            'product-image-media',
            variant === 'detail' && 'product-image-media--detail',
            fit === 'contain' ? 'product-image-media--contain' : 'product-image-media--cover',
            imageClassName
          )}
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-muted/60 px-6 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {fallbackLabel ?? t('common.comingSoon')}
        </div>
      )}
    </div>
  );
}
