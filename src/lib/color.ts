export const normalizeHex = (input: string): string | null => {
  if (!input) return null;
  const trimmed = input.trim().toLowerCase();
  const raw = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  if (raw.length === 3 && /^[0-9a-f]{3}$/.test(raw)) {
    const expanded = raw
      .split('')
      .map((c) => `${c}${c}`)
      .join('');
    return `#${expanded}`;
  }
  if (raw.length === 6 && /^[0-9a-f]{6}$/.test(raw)) {
    return `#${raw}`;
  }
  return null;
};

export const hexToHsl = (hex: string): string => {
  const normalized = normalizeHex(hex);
  if (!normalized) return '0 0% 100%';
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};
