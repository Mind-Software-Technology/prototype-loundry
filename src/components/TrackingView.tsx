'use client';

import React, { useState } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { Order, OrderStatus } from '@/types/laundry';
import { formatRupiah, getOrderStatusLabel, getPaymentStatusLabel } from '@/utils/formatters';
import { Search, PackageSearch, Check, Clock } from 'lucide-react';

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'queue', label: 'Diterima' },
  { key: 'washing', label: 'Dicuci' },
  { key: 'drying', label: 'Dikeringkan' },
  { key: 'ironing', label: 'Disetrika' },
  { key: 'ready', label: 'Siap Diambil' },
  { key: 'completed', label: 'Selesai' },
];

const normalizePhone = (v: string) => v.replace(/\D/g, '').replace(/^62/, '0');

export const TrackingView: React.FC = () => {
  const { orders } = useLaundry();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  // Pelanggan hanya bisa melihat pesanan dengan nomor nota persis / no. HP persis (bukan daftar semua).
  const results: Order[] = React.useMemo(() => {
    if (!submitted) return [];
    const q = submitted.trim().toLowerCase();
    const phone = normalizePhone(submitted);
    return orders.filter(
      (o) =>
        o.id.toLowerCase() === q ||
        (o.customer.memberCode ?? '').toLowerCase() === q ||
        (phone.length >= 8 && normalizePhone(o.customer.phone) === phone)
    );
  }, [orders, submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query.trim() || null);
  };

  return (
    <div className="tracking-page">
      <div className="tracking-hero">
        <PackageSearch size={40} />
        <h1>Lacak Cucian Anda</h1>
        <p>Masukkan nomor nota (contoh: LD-2409-001) nomor member (contoh: WSH-0001), atau nomor HP yang terdaftar.</p>

        <form onSubmit={handleSubmit} className="tracking-form">
          <Search size={18} className="tracking-form-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nomor nota, nomor member, atau no. HP"
            className="tracking-input"
            autoFocus
          />
          <button type="submit" className="tracking-btn">Lacak</button>
        </form>
      </div>

      <div className="tracking-results">
        {submitted && results.length === 0 && (
          <div className="tracking-empty">
            Pesanan tidak ditemukan. Periksa kembali nomor nota / no. HP Anda.
          </div>
        )}

        {results.map((order) => {
          const st = getOrderStatusLabel(order.orderStatus);
          const pay = getPaymentStatusLabel(order.paymentStatus);
          const cancelled = order.orderStatus === 'cancelled';
          const currentIdx = STEPS.findIndex((s) => s.key === order.orderStatus);

          return (
            <div key={order.id} className="tracking-card">
              <div className="tracking-card-head">
                <div>
                  <span className="tracking-id">{order.id}</span>
                  <span className="tracking-date">Masuk {order.orderDate}</span>
                </div>
                <span className="tracking-status-pill" style={{ color: st.color, background: st.bg }}>
                  {st.label}
                </span>
              </div>

              {!cancelled && (
                <ol className="tracking-timeline">
                  {STEPS.map((step, i) => {
                    const done = i < currentIdx || order.orderStatus === 'completed';
                    const current = i === currentIdx && order.orderStatus !== 'completed';
                    return (
                      <li key={step.key} className={`tl-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                        <span className="tl-dot">{done ? <Check size={13} /> : i + 1}</span>
                        <span className="tl-label">{step.label}</span>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="tracking-info-grid">
                <div><small>Pelanggan</small><strong>{order.customer.name}</strong></div>
                <div>
                  <small>Estimasi Selesai</small>
                  <strong><Clock size={12} /> {order.estimatedReadyDate}</strong>
                </div>
                <div><small>Total</small><strong>{formatRupiah(order.finalAmount)}</strong></div>
                <div><small>Pembayaran</small><strong>{pay.label}</strong></div>
              </div>

              <ul className="tracking-items">
                {order.items.map((it) => (
                  <li key={it.cartItemId}>
                    <span>{it.serviceName}</span>
                    <span>{it.quantity} {it.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
