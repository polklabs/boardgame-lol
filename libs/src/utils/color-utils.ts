import { clamp } from './helper-utils';

/**
 * Converts a hex color (#RRGGBB or #RGB) to RGB components.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace(/^#/, '');
  if (![3, 6].includes(normalized.length)) return null;

  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;

  const num = Number.parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates relative luminance according to WCAG 2.0.
 */
function luminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculates contrast ratio between two colors.
 */
function contrastRatio(l1: number, l2: number): number {
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

function getValue(v: number, amount: number): number {
  return clamp(v + amount, 0, 255);
}

/**
 * Given a text color, returns a background color (#000000 or #FFFFFF)
 * that meets WCAG AA contrast ratio (>= 4.5:1).
 */
export function getAccessibleBackground(textHex: string): string {
  if (!textHex) {
    return '';
  } else {
    // continue
  }

  const rgb = hexToRgb(textHex);
  if (!rgb) {
    return '';
  } else if (rgb.r === 255 && rgb.g === 255 && rgb.b === 255) {
    return 'rgb(0,0,0)';
  } else if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
    return 'rgb(255,255,255)';
  } else {
    // continue
  }

  const textLum = luminance(rgb.r, rgb.g, rgb.b);

  const contrastWithWhite = contrastRatio(textLum, 1);
  const contrastWithBlack = contrastRatio(textLum, 0);

  // Pick the background with higher contrast
  let adjustment;
  if (contrastWithWhite >= contrastWithBlack) {
    adjustment = 1;
  } else {
    adjustment = -1;
  }

  let adjust = 1;
  let contrast = contrastRatio(
    textLum,
    luminance(getValue(rgb.r, adjust), getValue(rgb.g, adjust), getValue(rgb.b, adjust)),
  );
  let loops = 0;
  while (contrast < 5 && loops < 256) {
    adjust += adjustment;
    contrast = contrastRatio(
      textLum,
      luminance(getValue(rgb.r, adjust), getValue(rgb.g, adjust), getValue(rgb.b, adjust)),
    );
    loops += 1;
  }
  return `rgb(${getValue(rgb.r, adjust)}, ${getValue(rgb.g, adjust)}, ${getValue(rgb.b, adjust)})`;
}
