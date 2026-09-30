'use client';

import React, { useState, useMemo } from 'react';
import { Printer, MessageCircle } from 'lucide-react';
import { useLaundry } from '@/context/LaundryContext';
import { OrderStatus, Order } from '@/types/laundry';
import {
  formatRupiah,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getNextOrderStatus,
  generateWhatsAppMessage,
  openWhatsApp,
} from '@/utils/formatters';

// Urutan tahap pengerjaan
const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'queue', label: 'Baru Masuk' },
  { key: 'washing', label: 'Cuci' },
  { key: 'drying', label: 'Kering' },
  { key: 'ironing', label: 'Setrika' },
  { key: 'ready', label: 'Siap Diambil' },
  { key: 'completed', label: 'Selesai' },
];

const FILTERS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'queue', label: 'Baru Masuk' },
  { key: 'washing', label: 'Dicuci' },
  { key: 'drying', label: 'Pengeringan' },
  { key: 'ironing', label: 'Setrika' },
  { key: 'ready', label: 'Siap Diambil' },
  { key: 'completed', label: 'Selesai' },
];

const NEXT_ACTION: Partial<Record<OrderStatus, string>> = {
  queue: 'Mulai Cuci',
  washing: 'Lanjut Keringkan',
  drying: 'Lanjut Setrika',
  ironing: 'Tandai Siap Diambil',
  ready: 'Serahkan ke Pelanggan',
};

export const OrdersView: React.FC = () => {
  const { orders, customers, updateOrderStatus, updatePaymentStatus, openReceiptModal } = useLaundry();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const memberCodeOf = (o: Order) =>
    o.customer.memberCode || customers.find((c) => c.id === o.customer.id)?.memberCode || '';

  const countOf = (key: OrderStatus | 'all') =>
    key === 'all' ? orders.length : orders.filter((o) => o.orderStatus === key).length;

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      const matchSearch =
        order.id.toLowerCase().includes(q) ||
        order.customer.name.toLowerCase().includes(q) ||
        memberCodeOf(order).toLowerCase().includes(q) ||
        order.customer.phone.includes(searchQuery);
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleNextStep = (order: Order) => {
    const next = getNextOrderStatus(order.orderStatus);
    if (next) updateOrderStatus(order.id, next);
  };

  const handleMarkPaid = (order: Order) => {
    if (confirm(`Tandai pembayaran pesanan ${order.id} sebesar ${formatRupiah(order.finalAmount)} sebagai LUNAS?`)) {
      updatePaymentStatus(order.id, 'paid');
    }
  };

  const handleWhatsApp = (order: Order) => {
    openWhatsApp(order.customer.phone, generateWhatsAppMessage(order));
  };

  return (
    <div className="trk-page">
      <div className="trk-head">
        <div>
          <h1 className="trk-title">Pelacakan Pesanan</h1>
          <p className="trk-sub">Perbarui tahap pengerjaan dan pembayaran setiap pesanan.</p>
        </div>
        <input
          type="text"
          placeholder="Cari nota, nomor member, nama, atau WhatsApp"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="trk-search"
        />
      </div>

      <div className="trk-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`trk-filter ${statusFilter === f.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label} <span className="trk-filter-count">{countOf(f.key)}</span>
          </button>
        ))}
      </div>

      <div className="trk-grid">
        {filteredOrders.map((order) => {
          const status = getOrderStatusLabel(order.orderStatus);
          const pay = getPaymentStatusLabel(order.paymentStatus);
          const nextStatus = getNextOrderStatus(order.orderStatus);
          const stepIndex = STEPS.findIndex((s) => s.key === order.orderStatus);
          const cancelled = order.orderStatus === 'cancelled';

          return (
            <article key={order.id} className="tkc">
              <header className="tkc-head">
                <div className="tkc-id">
                  <span className="tkc-nota">{order.id}</span>
                  <span className="tkc-status" style={{ color: status.color, background: status.bg }}>
                    {status.label}
                  </span>
                </div>
                <div className="tkc-pay-group">
                  <span className="tkc-pay" style={{ color: pay.color, background: pay.bg }}>
                    {pay.label}
                  </span>
                  {order.paymentStatus !== 'paid' && (
                    <button type="button" className="tkc-paynow" onClick={() => handleMarkPaid(order)}>
                      Bayar Sekarang
                    </button>
                  )}
                </div>
              </header>

              <div className="tkc-body">
                <div className="tkc-customer">
                  <span className="tkc-avatar">{order.customer.name.substring(0, 2).toUpperCase()}</span>
                  <div>
                    <strong>{order.customer.name}</strong>
                    <span>
                      {order.customer.phone}
                      {memberCodeOf(order) && <> &middot; {memberCodeOf(order)}</>}
                    </span>
                  </div>
                </div>

                <div className="tkc-dates">
                  <span>Masuk: <strong>{order.orderDate}</strong></span>
                  <span>Target: <strong>{order.estimatedReadyDate}</strong></span>
                </div>

                <div className="tkc-detail">
                  <div className="tkc-detail-title">Rincian Cucian:</div>
                  <ul>
                    {order.items.map((it) => (
                      <li key={it.cartItemId}>
                        <strong>{it.quantity} {it.unit}</strong> - {it.serviceName}
                        {it.notes && <span className="tkc-item-note"> ({it.notes})</span>}
                      </li>
                    ))}
                  </ul>
                  {order.perfume && (
                    <div className="tkc-perfume">Parfum: {order.perfume.split('(')[0].trim()}</div>
                  )}
                  {order.specialNotes && (
                    <div className="tkc-note">Catatan: {order.specialNotes}</div>
                  )}
                </div>

                {!cancelled && (
                  <div className="order-progress-stepper trk-stepper">
                    {STEPS.map((st, i) => {
                      const isDone = i <= stepIndex;
                      const isCurrent = i === stepIndex;
                      return (
                        <div
                          key={st.key}
                          className={`stepper-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                        >
                          <div className="step-dot">{isDone ? '✓' : i + 1}</div>
                          <span className="step-label">{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <footer className="tkc-foot">
                <div className="tkc-total">
                  <small>Total:</small>
                  <strong>{formatRupiah(order.finalAmount)}</strong>
                </div>
                <div className="tkc-actions">
                  <button
                    type="button"
                    className="tkc-icon-btn"
                    onClick={() => openReceiptModal(order)}
                    title="Cetak struk"
                    aria-label="Cetak struk"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    type="button"
                    className="tkc-icon-btn wa"
                    onClick={() => handleWhatsApp(order)}
                    title="Kirim WhatsApp"
                    aria-label="Kirim WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </button>
                  {nextStatus && (
                    <button type="button" className="tkc-next" onClick={() => handleNextStep(order)}>
                      {NEXT_ACTION[order.orderStatus] ?? 'Lanjut'}
                    </button>
                  )}
                  {order.orderStatus === 'completed' && <span className="tkc-done">Selesai</span>}
                </div>
              </footer>
            </article>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="trk-empty">Tidak ada pesanan yang sesuai dengan filter.</div>
        )}
      </div>
    </div>
  );
};
