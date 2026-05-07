import { useMemo } from 'react';
import { cn } from '@/lib/utils';

type MemberPortraitProps = {
  name: string;
  src?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

const palette = [
  ['#f4efe8', '#d8d3cb', '#2a2522'],
  ['#eef3f8', '#d2dbe8', '#1f2a37'],
  ['#f3f2ef', '#d9d6ce', '#3b342e'],
  ['#edf1ef', '#cfd9d4', '#1f3028'],
];

function hashName(value: string) {
  return value.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'SS';
}

function createFallbackDataUrl(name: string) {
  const index = Math.abs(hashName(name)) % palette.length;
  const [start, end, text] = palette[index];
  const initials = getInitials(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" rx="60" fill="url(#g)" />
      <circle cx="400" cy="360" r="140" fill="rgba(255,255,255,0.46)" />
      <path d="M210 770c38-138 138-214 190-214s152 76 190 214" fill="rgba(255,255,255,0.38)" />
      <text x="50%" y="90%" text-anchor="middle" fill="${text}" font-family="Inter, Arial, sans-serif" font-size="96" font-weight="600" opacity="0.84">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function MemberPortrait({
  name,
  src,
  alt,
  className,
  imageClassName,
  priority = false,
}: MemberPortraitProps) {
  const fallbackSrc = useMemo(() => createFallbackDataUrl(name), [name]);
  const resolvedSrc = src?.trim() ? src : fallbackSrc;

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      <img
        src={resolvedSrc}
        alt={alt ?? name}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('h-full w-full max-w-full object-cover object-center', imageClassName)}
      />
    </div>
  );
}
