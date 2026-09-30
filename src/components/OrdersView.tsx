'use client';

import React, { useState, useMemo } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { OrderStatus, Order, PaymentStatus } from '@/types/laundry';
import { 
  formatRupiah, 
  getOrderStatusLabel, 
  getPaymentStatusLabel, 
  getNextOrderStatus,
  generateWhatsAppMessage,
  openWhatsApp 
} from '@/utils/formatters';
import { 
  Search, 
  Printer, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Check, 
  AlertTriangle,
  User,
  ShoppingBag,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, updatePaymentStatus, openReceiptModal } = useLaundry();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      const matchSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer.memberCode ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery);
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Workflow steps definition
  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'queue', label: 'Baru Masuk' },
    { key: 'washing', label: 'Cuci' },
    { key: 'drying', label: 'Kering' },
    { key: 'ironing', label: 'Setrika' },
    { key: 'ready', label: 'Siap Diambil' },
    { key: 'completed', label: 'Selesai' },
  ];

  const getNextActionLabel = (current: OrderStatus): string => {
    switch (current) {
      case 'queue': return 'Mulai Cuci';
      case 'washing': return 'Lanjut Keringkan';
      case 'drying': return 'Lanjut Setrika / Lipat';
      case 'ironing': return 'Tandai Siap Diambil';
      case 'ready': return 'Selesaikan & Serahkan';
      default: return 'Selesai';
    }
  };

  const handleNextStep = (order: Order) => {
    const next = getNextOrderStatus(order.orderStatus);
    if (next) {
      updateOrderStatus(order.id, next);
    }
  };

  const handleMarkPaid = (order: Order) => {
    if (confirm(`Tandai pembayaran pesanan ${order.id} sebesar ${formatRupiah(order.finalAmount)} sebagai LUNAS?`)) {
      updatePaymentStatus(order.id, 'paid');
    }
  };

  const handleWhatsApp = (order: Order) => {
    const message = generateWhatsAppMessage(order);
    openWhatsApp(order.customer.phone, message);
  };

  return (
    <div className="orders-container">
      {/* Header & Filter Controls */}
      <div className="orders-header-bar">
        <div className="search-order-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nomor nota, nomor member, nama, atau No. WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="btn-clear-search">
              ×
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="status-filter-pills">
          <button
            type="button"
            className={`status-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Semua ({orders.length})
          </button>
          <button
            type="button"
            className={`status-pill pill-blue ${statusFilter === 'queue' ? 'active' : ''}`}
            onClick={() => setStatusFilter('queue')}
          >
            Baru Masuk ({orders.filter((o) => o.orderStatus === 'queue').length})
          </button>
          <button
            type="button"
            className={`status-pill pill-cyan ${statusFilter === 'washing' ? 'active' : ''}`}
            onClick={() => setStatusFilter('washing')}
          >
            Dicuci ({orders.filter((o) => o.orderStatus === 'washing').length})
          </button>
          <button
            type="button"
            className={`status-pill pill-purple ${statusFilter === 'drying' ? 'active' : ''}`}
            onClick={() => setStatusFilter('drying')}
          >
            Pengeringan ({orders.filter((o) => o.orderStatus === 'drying').length})
          </button>
          <button
            type="button"
            className={`status-pill pill-amber ${statusFilter === 'ironing' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ironing')}
          >
            Setrika ({orders.filter((o) => o.orderStatus === 'ironing').length})
          </button>
          <button
            type="button"
            className={`status-pill pill-green ${statusFilter === 'ready' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ready')}
          >
            Siap Diambil ({orders.filter((o) => o.orderStatus === 'ready').length})
          </button>
          <button
            type="button"
            className={`status-pill pill-gray ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Selesai ({orders.filter((o) => o.orderStatus === 'completed').length})
          </button>
        </div>
      </div>

      {/* Orders Grid / Card List */}
      <div className="orders-grid">
        {filteredOrders.map((order) => {
          const statusBadge = getOrderStatusLabel(order.orderStatus);
          const paymentBadge = getPaymentStatusLabel(order.paymentStatus);
          const nextStatus = getNextOrderStatus(order.orderStatus);

          return (
            <div 
              key={order.id} 
              className={`order-tracking-card status-border-${order.orderStatus}`}
            >
              {/* Card Header */}
              <div className="order-card-header">
                <div className="order-id-group">
                  <span className="order-id-badge">{order.id}</span>
                  <span 
                    className="order-status-badge"
                    style={{ color: statusBadge.color, backgroundColor: statusBadge.bg }}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                {/* Payment Badge & Quick Pay Action */}
                <div className="payment-badge-group">
                  <span 
                    className="order-pay-badge"
                    style={{ color: paymentBadge.color, backgroundColor: paymentBadge.bg }}
                  >
                    {paymentBadge.label}
                  </span>
                  {order.paymentStatus !== 'paid' && (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(order)}
                      className="btn-quick-pay"
                      title="Pelanggan bayar sekarang"
                    >
                      Bayar Sekarang
                    </button>
                  )}
                </div>
              </div>

              {/* Customer and Timeline details */}
              <div className="order-card-body">
                <div className="order-customer-info">
                  <div className="cust-avatar-sm">
                    {order.customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="cust-title-name">{order.customer.name}</h4>
                    <span className="cust-phone-sub">{order.customer.phone}</span>
                  </div>
                </div>

                <div className="order-dates-row">
                  <div className="date-item">
                    <Calendar size={13} />
                    <span>Masuk: <strong>{order.orderDate}</strong></span>
                  </div>
                  <div className="date-item">
                    <Clock size={13} />
                    <span>Target: <strong>{order.estimatedReadyDate}</strong></span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="order-items-box">
                  <div className="items-box-title">Rincian Cucian:</div>
                  <ul className="items-bullet-list">
                    {order.items.map((it, idx) => (
                      <li key={idx}>
                        <strong>{it.quantity} {it.unit}</strong> - {it.serviceName}
                        {it.notes && <span className="item-note-sub"> ({it.notes})</span>}
                      </li>
                    ))}
                  </ul>
                  {order.perfume && (
                    <div className="order-perfume-tag">
                      <Sparkles size={12} />
                      <span>Parfum: {order.perfume.split('(')[0]}</span>
                    </div>
                  )}
                  {order.specialNotes && (
                    <div className="order-special-note">
                      Catatan: {order.specialNotes}
                    </div>
                  )}
                </div>

                {/* Step Progress Bar */}
                <div className="order-progress-stepper">
                  {steps.map((st, i) => {
                    const currentIndex = steps.findIndex((s) => s.key === order.orderStatus);
                    const isDone = i <= currentIndex;
                    const isCurrent = i === currentIndex;
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
              </div>

              {/* Card Footer Actions */}
              <div className="order-card-footer">
                <div className="order-total-block">
                  <span className="label">Total:</span>
                  <strong className="amount">{formatRupiah(order.finalAmount)}</strong>
                </div>

                <div className="order-action-buttons">
                  <button
                    type="button"
                    onClick={() => openReceiptModal(order)}
                    className="btn-icon-action"
                    title="Cetak Struk"
                  >
                    <Printer size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsApp(order)}
                    className="btn-icon-action btn-wa-icon"
                    title="Kirim Pesan WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>

                  {nextStatus && (
                    <button
                      type="button"
                      onClick={() => handleNextStep(order)}
                      className="btn-advance-status"
                    >
                      <span>{getNextActionLabel(order.orderStatus)}</span>
                      <ArrowRight size={15} />
                    </button>
                  )}

                  {order.orderStatus === 'completed' && (
                    <span className="badge-done-tag">
                      <Check size={14} /> Selesai
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="empty-orders-state">
            <Layers size={48} color="#94a3b8" />
            <p>Tidak ada transaksi laundry yang sesuai dengan filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
