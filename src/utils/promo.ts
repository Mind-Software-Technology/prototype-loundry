import { Customer, Promo } from '@/types/laundry';

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Besar potongan promo untuk subtotal tertentu (tidak pernah melebihi subtotal). */
export const calcPromoDiscount = (promo: Promo, subtotal: number): number => {
  let amount = promo.discountType === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
  if (promo.discountType === 'percent' && promo.maxDiscount && promo.maxDiscount > 0) {
    amount = Math.min(amount, promo.maxDiscount);
  }
  return Math.max(0, Math.min(amount, subtotal));
};

/** Alasan promo tidak bisa dipakai, atau null bila memenuhi syarat. */
export const promoIneligibleReason = (promo: Promo, customer: Customer | null, subtotal: number): string | null => {
  if (!promo.active) return 'Promo tidak aktif.';
  if (promo.validUntil && promo.validUntil < todayStr()) return 'Promo sudah kedaluwarsa.';
  if (promo.minSubtotal && subtotal < promo.minSubtotal) return `Minimal belanja belum tercapai.`;
  if (promo.kind === 'loyalty') {
    if (!customer) return 'Pilih pelanggan terlebih dahulu.';
    const orders = customer.totalOrders || 0;
    const min = Math.max(1, promo.minOrders ?? 1);
    if (promo.loyaltyMode === 'every') {
      if ((orders + 1) % min !== 0) return `Berlaku di order ke-${min}, ke-${min * 2}, dst.`;
    } else if (orders < min) {
      return `Pelanggan baru ${orders}x order (butuh ${min}x).`;
    }
  }
  return null;
};

export const findVoucherByCode = (promos: Promo[], code: string): Promo | undefined => {
  const c = code.trim().toUpperCase();
  return c ? promos.find((p) => p.kind === 'voucher' && (p.code ?? '').toUpperCase() === c) : undefined;
};

export const describePromo = (p: Promo): string => {
  const val = p.discountType === 'percent' ? `${p.value}%` : `Rp ${p.value.toLocaleString('id-ID')}`;
  if (p.kind === 'voucher') return `Voucher ${p.code} · potongan ${val}`;
  const min = p.minOrders ?? 1;
  return p.loyaltyMode === 'every'
    ? `Setiap order ke-${min} · potongan ${val}`
    : `Setelah ${min}x order · potongan ${val}`;
};
