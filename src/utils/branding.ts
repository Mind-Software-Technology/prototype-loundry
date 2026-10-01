import { BrandingSettings } from '@/types/laundry';
import { DEFAULT_BRANDING } from '@/data/initialData';

const parseHex = (hex: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const v = parseInt(m ? m[1] : DEFAULT_BRANDING.primaryColor.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

const toHex = (rgb: number[]) => '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');

/** Campur warna `hex` dengan `target` sebanyak `t` (0-1). */
const mix = (hex: string, target: string, t: number): string => {
  const a = parseHex(hex);
  const b = parseHex(target);
  return toHex(a.map((c, i) => c + (b[i] - c) * t));
};

/** Variabel CSS turunan dari satu warna utama. */
export const brandCssVars = (primary: string): Record<string, string> => {
  const hover = mix(primary, '#000000', 0.2);
  return {
    '--washy-primary': primary,
    '--accent': primary,
    '--washy-primary-hover': hover,
    '--accent-hover': hover,
    '--washy-sky-bg': mix(primary, '#ffffff', 0.92),
    '--washy-sky-light': mix(primary, '#ffffff', 0.96),
  };
};

/** True bila warna terlalu terang sehingga teks putih di atasnya sulit dibaca. */
export const isTooLight = (hex: string): boolean => {
  const [r, g, b] = parseHex(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
};

export const displayBrandName = (b: BrandingSettings): string => b.businessName.trim() || DEFAULT_BRANDING.businessName;

/** Perkecil gambar logo (maks 256px) agar muat di penyimpanan browser. */
export const resizeLogo = (file: File, max = 256): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Canvas tidak tersedia'));
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gambar tidak bisa dibaca'));
    };
    img.src = url;
  });
