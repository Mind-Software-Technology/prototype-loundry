import { OrderStatus, PaymentStatus, Order } from '@/types/laundry';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getOrderStatusLabel = (status: OrderStatus): { label: string; color: string; bg: string } => {
  switch (status) {
    case 'queue':
      return { label: 'Baru Masuk', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' };
    case 'washing':
      return { label: 'Sedang Dicuci', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' };
    case 'drying':
      return { label: 'Pengeringan', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' };
    case 'ironing':
      return { label: 'Setrika / Lipat', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
    case 'ready':
      return { label: 'Siap Diambil', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    case 'completed':
      return { label: 'Selesai', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' };
    case 'cancelled':
      return { label: 'Dibatalkan', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' };
    default:
      return { label: status, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
  }
};

export const getPaymentStatusLabel = (status: PaymentStatus): { label: string; color: string; bg: string } => {
  switch (status) {
    case 'paid':
      return { label: 'LUNAS', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    case 'unpaid':
      return { label: 'BELUM LUNAS', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
    case 'dp':
      return { label: 'DP DIBAYAR', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    default:
      return { label: status, color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
  }
};

export const getNextOrderStatus = (current: OrderStatus): OrderStatus | null => {
  switch (current) {
    case 'queue':
      return 'washing';
    case 'washing':
      return 'drying';
    case 'drying':
      return 'ironing';
    case 'ironing':
      return 'ready';
    case 'ready':
      return 'completed';
    default:
      return null;
  }
};

export const generateWhatsAppMessage = (order: Order, storeName = 'CleanWave Laundry'): string => {
  const itemsList = order.items
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.serviceName}* (${it.quantity} ${it.unit}) = ${formatRupiah(it.subtotal)}`
    )
    .join('%0A');

  const statusBayarText = order.paymentStatus === 'paid' ? 'LUNAS' : `BELUM LUNAS (Sisa: ${formatRupiah(order.finalAmount - order.paidAmount)})`;

  let greeting = `Halo Kak *${order.customer.name}*, terima kasih telah mempercayakan pakaian Anda di *${storeName}*! ✨%0A%0A`;
  
  if (order.orderStatus === 'ready') {
    greeting = `Halo Kak *${order.customer.name}*! 🎉%0ACucian Anda di *${storeName}* *SUDAH SELESAI & SIAP DIAMBIL*.%0A%0A`;
  }

  const message = `${greeting}` +
    `📋 *NOTA TRANSAKSI:* #${order.id}%0A` +
    `📅 Tanggal: ${order.orderDate}%0A` +
    `🌸 Parfum: ${order.perfume}%0A` +
    `--------------------------------%0A` +
    `*RINCIAN ITEM:*%0A` +
    `${itemsList}%0A` +
    `--------------------------------%0A` +
    `💰 *Total:* ${formatRupiah(order.finalAmount)}%0A` +
    `💳 *Status Bayar:* ${statusBayarText}%0A` +
    `⏳ *Estimasi Selesai:* ${order.estimatedReadyDate}%0A%0A` +
    `Harap tunjukkan pesan ini atau sebutkan No. Nota saat pengambilan.%0A` +
    `Terima kasih dan sehat selalu! 🙏`;

  return message;
};

export const openWhatsApp = (phone: string, message: string) => {
  // Normalize indonesian phone number
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }
  const url = `https://wa.me/${cleanPhone}?text=${message}`;
  window.open(url, '_blank');
};
