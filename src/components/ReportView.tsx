'use client';

import React, { useMemo, useState } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { OrderStatus, PaymentMethod } from '@/types/laundry';
import { formatRupiah, getOrderStatusLabel } from '@/utils/formatters';
import { Wallet, Receipt, Layers, AlertCircle, TrendingUp } from 'lucide-react';

type Period = 'today' | '7d' | '30d' | 'all';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Hari Ini' },
  { key: '7d', label: '7 Hari' },
  { key: '30d', label: '30 Hari' },
  { key: 'all', label: 'Semua' },
];

const METHOD_LABEL: Record<PaymentMethod, string> = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer' };
const DAY_MS = 24 * 60 * 60 * 1000;
const dateKey = (d: Date) => d.toISOString().split('T')[0];

export const ReportView: React.FC = () => {
  const { orders } = useLaundry();
  const [period, setPeriod] = useState<Period>('7d');

  const report = useMemo(() => {
    const now = new Date();
    const days = period === 'today' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : Infinity;
    const minKey = days === Infinity ? '' : dateKey(new Date(now.getTime() - (days - 1) * DAY_MS));

    const list = orders.filter((o) => o.orderStatus !== 'cancelled' && o.orderDate.split(' ')[0] >= minKey);
    const received = (o: (typeof list)[number]) => (o.paymentStatus === 'paid' ? o.finalAmount : o.paidAmount);

    const revenue = list.reduce((a, o) => a + received(o), 0);
    const receivable = list.reduce((a, o) => a + Math.max(0, o.finalAmount - received(o)), 0);
    const avg = list.length ? Math.round(list.reduce((a, o) => a + o.finalAmount, 0) / list.length) : 0;

    const byStatus = new Map<OrderStatus, number>();
    const byMethod = new Map<PaymentMethod, number>();
    const byService = new Map<string, { qty: number; unit: string; total: number }>();
    const byDay = new Map<string, number>();

    list.forEach((o) => {
      const day = o.orderDate.split(' ')[0];
      byStatus.set(o.orderStatus, (byStatus.get(o.orderStatus) || 0) + 1);
      byMethod.set(o.paymentMethod, (byMethod.get(o.paymentMethod) || 0) + received(o));
      byDay.set(day, (byDay.get(day) || 0) + received(o));
      o.items.forEach((it) => {
        const label = it.isCustom ? `${it.serviceName} (Custom)` : it.serviceName;
        const cur = byService.get(label) || { qty: 0, unit: it.unit, total: 0 };
        cur.qty += it.quantity;
        cur.total += it.subtotal;
        byService.set(label, cur);
      });
    });

    // Grafik harian: maksimal 14 hari terakhir
    let dayRows: { day: string; value: number }[];
    if (days !== Infinity) {
      const n = Math.min(days, 14);
      dayRows = Array.from({ length: n }, (_, i) => {
        const day = dateKey(new Date(now.getTime() - (n - 1 - i) * DAY_MS));
        return { day, value: byDay.get(day) || 0 };
      });
    } else {
      dayRows = [...byDay.entries()].sort().slice(-14).map(([day, value]) => ({ day, value }));
    }

    return {
      list,
      revenue,
      receivable,
      avg,
      byStatus: [...byStatus.entries()],
      byMethod: [...byMethod.entries()].filter(([, v]) => v > 0),
      topServices: [...byService.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 5),
      dayRows,
    };
  }, [orders, period]);

  const maxDay = Math.max(1, ...report.dayRows.map((d) => d.value));
  const maxSrv = Math.max(1, ...report.topServices.map(([, v]) => v.total));
  const totalMethod = Math.max(1, report.byMethod.reduce((a, [, v]) => a + v, 0));

  return (
    <div className="report-page">
      <div className="report-head">
        <div>
          <h1 className="report-title">Laporan Usaha</h1>
          <p className="report-sub">Ringkasan omzet dan transaksi laundry (hanya lihat).</p>
        </div>
        <div className="report-period">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`pos-tab-pill ${period === p.key ? 'active' : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="report-kpis">
        <div className="report-kpi"><Wallet size={18} /><small>Omzet Diterima</small><strong>{formatRupiah(report.revenue)}</strong></div>
        <div className="report-kpi"><Receipt size={18} /><small>Jumlah Transaksi</small><strong>{report.list.length}</strong></div>
        <div className="report-kpi"><TrendingUp size={18} /><small>Rata-rata / Nota</small><strong>{formatRupiah(report.avg)}</strong></div>
        <div className="report-kpi warn"><AlertCircle size={18} /><small>Belum Dibayar</small><strong>{formatRupiah(report.receivable)}</strong></div>
      </div>

      <div className="report-grid">
        <section className="report-card report-wide">
          <h3>Omzet Harian</h3>
          <div className="report-bars">
            {report.dayRows.map((d) => (
              <div key={d.day} className="report-bar-col" title={`${d.day}: ${formatRupiah(d.value)}`}>
                <span className="report-bar-val">{d.value ? Math.round(d.value / 1000) + 'k' : ''}</span>
                <div className="report-bar" style={{ height: `${(d.value / maxDay) * 80}%` }} />
                <span className="report-bar-label">{d.day.slice(8)}/{d.day.slice(5, 7)}</span>
              </div>
            ))}
            {report.dayRows.length === 0 && <p className="report-empty">Belum ada data.</p>}
          </div>
        </section>

        <section className="report-card">
          <h3>Layanan Terlaris</h3>
          {report.topServices.map(([name, v]) => (
            <div key={name} className="report-row">
              <div className="report-row-top"><span>{name}</span><strong>{formatRupiah(v.total)}</strong></div>
              <div className="report-track"><div className="report-fill" style={{ width: `${(v.total / maxSrv) * 100}%` }} /></div>
              <small>{Number(v.qty.toFixed(1))} {v.unit}</small>
            </div>
          ))}
          {report.topServices.length === 0 && <p className="report-empty">Belum ada data.</p>}
        </section>

        <section className="report-card">
          <h3>Metode Pembayaran</h3>
          {report.byMethod.map(([m, v]) => (
            <div key={m} className="report-row">
              <div className="report-row-top"><span>{METHOD_LABEL[m]}</span><strong>{formatRupiah(v)}</strong></div>
              <div className="report-track"><div className="report-fill alt" style={{ width: `${(v / totalMethod) * 100}%` }} /></div>
              <small>{Math.round((v / totalMethod) * 100)}%</small>
            </div>
          ))}
          {report.byMethod.length === 0 && <p className="report-empty">Belum ada data.</p>}
        </section>

        <section className="report-card">
          <h3><Layers size={15} /> Status Pesanan</h3>
          <div className="report-status-list">
            {report.byStatus.map(([st, n]) => {
              const b = getOrderStatusLabel(st);
              return (
                <div key={st} className="report-status-item">
                  <span style={{ color: b.color, background: b.bg }} className="report-status-pill">{b.label}</span>
                  <strong>{n}</strong>
                </div>
              );
            })}
            {report.byStatus.length === 0 && <p className="report-empty">Belum ada data.</p>}
          </div>
        </section>

        <section className="report-card report-wide">
          <h3>Transaksi Terbaru</h3>
          <div className="services-table-wrapper">
            <table className="services-table">
              <thead>
                <tr><th>Nota</th><th>Tanggal</th><th>Pelanggan</th><th>Status</th><th className="text-right">Total</th></tr>
              </thead>
              <tbody>
                {report.list.slice(0, 10).map((o) => {
                  const b = getOrderStatusLabel(o.orderStatus);
                  return (
                    <tr key={o.id}>
                      <td><strong>{o.id}</strong></td>
                      <td>{o.orderDate}</td>
                      <td>{o.customer.name}</td>
                      <td><span style={{ color: b.color, background: b.bg }} className="report-status-pill">{b.label}</span></td>
                      <td className="text-right"><strong>{formatRupiah(o.finalAmount)}</strong></td>
                    </tr>
                  );
                })}
                {report.list.length === 0 && (
                  <tr><td colSpan={5} className="report-empty">Tidak ada transaksi pada periode ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
