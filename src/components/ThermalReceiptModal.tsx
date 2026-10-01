'use client';

import React from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { formatRupiah, getPaymentStatusLabel, generateWhatsAppMessage, openWhatsApp } from '@/utils/formatters';
import { displayBrandName } from '@/utils/branding';
import { Printer, MessageCircle, X, Check, Scissors } from 'lucide-react';

export const ThermalReceiptModal: React.FC = () => {
  const { receiptModalOrder, closeReceiptModal, settings } = useLaundry();

  if (!receiptModalOrder) return null;

  const order = receiptModalOrder;
  const paymentBadge = getPaymentStatusLabel(order.paymentStatus);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage(order);
    openWhatsApp(order.customer.phone, message);
  };

  return (
    <div className="receipt-modal-backdrop">
      <div className="receipt-modal-container animate-fade-in">
        {/* Floating actions at top */}
        <div className="receipt-actions-header no-print">
          <div className="receipt-badge-status">
            <Check size={16} />
            <span>Transaksi Berhasil Dibuat</span>
          </div>

          <button
            type="button"
            onClick={closeReceiptModal}
            className="btn-icon-receipt-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* The Printable Thermal Paper (58mm / 80mm styled) */}
        <div className="thermal-paper" id="printable-receipt">
          {/* Header */}
          <div className="receipt-center-text">
            {settings.branding.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.branding.logo} alt="" style={{ width: 48, height: 48, objectFit: 'contain', margin: '0 auto 4px', display: 'block', filter: 'grayscale(1)' }} />
            )}
            <h2 className="receipt-store-name">{displayBrandName(settings.branding).toUpperCase()}</h2>
            <p className="receipt-store-sub">Premium Laundry & Wet Clean</p>
            <p className="receipt-store-info">Jl. Melati Raya No. 18 • WA: 0812-3456-7890</p>
          </div>

          <div className="receipt-divider-dash" />

          {/* Transaction Metadata */}
          <div className="receipt-meta-grid">
            <div className="meta-line">
              <span>No. Nota:</span>
              <strong className="mono">{order.id}</strong>
            </div>
            <div className="meta-line">
              <span>Tgl Masuk:</span>
              <span>{order.orderDate}</span>
            </div>
            <div className="meta-line">
              <span>Estimasi Siap:</span>
              <strong>{order.estimatedReadyDate}</strong>
            </div>
            <div className="meta-line">
              <span>Kasir:</span>
              <span>{order.cashierName}</span>
            </div>
          </div>

          <div className="receipt-divider-dash" />

          {/* Customer Info */}
          <div className="receipt-customer-block">
            <div className="meta-line">
              <span>Pelanggan:</span>
              <strong>{order.customer.name}</strong>
            </div>
            {order.customer.memberCode && (
              <div className="meta-line">
                <span>No. Member:</span>
                <strong>{order.customer.memberCode}</strong>
              </div>
            )}
            <div className="meta-line">
              <span>No. HP:</span>
              <span>{order.customer.phone}</span>
            </div>
            {order.perfume && (
              <div className="meta-line">
                <span>Pilihan Aroma:</span>
                <span>{order.perfume.split('(')[0]}</span>
              </div>
            )}
            {order.specialNotes && (
              <div className="meta-line">
                <span>Catatan:</span>
                <span className="italic">{order.specialNotes}</span>
              </div>
            )}
          </div>

          <div className="receipt-divider-double" />

          {/* Items Table */}
          <div className="receipt-items-table">
            <div className="items-header">
              <span>ITEM & JUMLAH</span>
              <span className="text-right">TOTAL</span>
            </div>

            <div className="receipt-divider-dash" />

            {order.items.map((it, idx) => (
              <div key={idx} className="receipt-item-row">
                <div className="item-left">
                  <div className="item-name-mono">{it.serviceName}</div>
                  <div className="item-detail-mono">
                    {it.quantity} {it.unit} x {formatRupiah(it.unitPrice)}
                    {it.notes ? ` (${it.notes})` : ''}
                  </div>
                </div>
                <div className="item-right-mono">
                  {formatRupiah(it.subtotal)}
                </div>
              </div>
            ))}
          </div>

          <div className="receipt-divider-dash" />

          {/* Totals */}
          <div className="receipt-totals-block">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="total-line">
                <span>Diskon{order.promoName ? ` (${order.promoName})` : ''}:</span>
                <span>-{formatRupiah(order.discount)}</span>
              </div>
            )}

            <div className="total-line grand">
              <span>TOTAL TAGIHAN:</span>
              <strong>{formatRupiah(order.finalAmount)}</strong>
            </div>

            <div className="receipt-divider-dash" />

            <div className="total-line">
              <span>Metode Bayar:</span>
              <span className="uppercase">{order.paymentMethod}</span>
            </div>

            <div className="total-line status">
              <span>Status Pembayaran:</span>
              <span 
                className="receipt-status-pill"
                style={{ color: paymentBadge.color, borderColor: paymentBadge.color }}
              >
                {paymentBadge.label}
              </span>
            </div>

            {order.paidAmount > 0 && (
              <div className="total-line">
                <span>Jumlah Dibayar:</span>
                <span>{formatRupiah(order.paidAmount)}</span>
              </div>
            )}

            {order.changeAmount > 0 && (
              <div className="total-line">
                <span>Kembalian:</span>
                <span>{formatRupiah(order.changeAmount)}</span>
              </div>
            )}

            {order.paymentStatus !== 'paid' && (
              <div className="total-line text-red">
                <span>Sisa Tagihan:</span>
                <strong>{formatRupiah(order.finalAmount - order.paidAmount)}</strong>
              </div>
            )}
          </div>

          <div className="receipt-divider-double" />

          {/* Simulated Barcode */}
          <div className="receipt-barcode-box">
            <div className="barcode-bars">
              ||| | || |||| | ||| || |||| | || | ||| ||||
            </div>
            <div className="barcode-number">*{order.id}*</div>
          </div>

          {/* Terms & Footer */}
          <div className="receipt-footer-terms">
            <p>1. Pengambilan cucian WAJIB membawa nota ini atau konfirmasi WhatsApp.</p>
            <p>2. Komplain pakaian maksimal 1x24 jam setelah cucian diambil.</p>
            <p>3. Cucian yang tidak diambil lebih dari 30 hari di luar tanggung jawab kami.</p>
            <p className="receipt-thank-you">~ Terima Kasih Atas Kepercayaan Anda ~</p>
          </div>

          {/* Cut line */}
          <div className="receipt-cut-line">
            <Scissors size={14} />
            <span>--------------------------------------</span>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="receipt-bottom-actions no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-print-thermal"
          >
            <Printer size={18} />
            <span>Cetak Struk Thermal</span>
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="btn-send-wa"
          >
            <MessageCircle size={18} />
            <span>Kirim Nota WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={closeReceiptModal}
            className="btn-close-receipt"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
