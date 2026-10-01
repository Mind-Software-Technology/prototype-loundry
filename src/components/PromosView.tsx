'use client';

import React, { useState } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { LoyaltyMode, Promo, PromoDiscountType, PromoKind } from '@/types/laundry';
import { formatRupiah } from '@/utils/formatters';
import { describePromo } from '@/utils/promo';

interface PromoFormState {
  name: string;
  kind: PromoKind;
  code: string;
  minOrders: number;
  loyaltyMode: LoyaltyMode;
  discountType: PromoDiscountType;
  value: number;
  maxDiscount: number;
  minSubtotal: number;
  validUntil: string;
  active: boolean;
}

const EMPTY_FORM: PromoFormState = {
  name: '',
  kind: 'loyalty',
  code: '',
  minOrders: 5,
  loyaltyMode: 'threshold',
  discountType: 'percent',
  value: 10,
  maxDiscount: 0,
  minSubtotal: 0,
  validUntil: '',
  active: true,
};

const toForm = (p: Promo): PromoFormState => ({
  name: p.name,
  kind: p.kind,
  code: p.code ?? '',
  minOrders: p.minOrders ?? 5,
  loyaltyMode: p.loyaltyMode ?? 'threshold',
  discountType: p.discountType,
  value: p.value,
  maxDiscount: p.maxDiscount ?? 0,
  minSubtotal: p.minSubtotal ?? 0,
  validUntil: p.validUntil ?? '',
  active: p.active,
});

export const PromosView: React.FC = () => {
  const { promos, addPromo, updatePromo, deletePromo } = useLaundry();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoFormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patch = (fields: Partial<PromoFormState>) => setForm((f) => (f ? { ...f, ...fields } : f));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const openEdit = (p: Promo) => {
    setEditingId(p.id);
    setForm(toForm(p));
    setError(null);
  };

  const closeForm = () => {
    setForm(null);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    if (!name) return setError('Nama promo wajib diisi.');
    if (form.value <= 0) return setError('Nilai potongan harus lebih dari 0.');
    if (form.discountType === 'percent' && form.value > 100) return setError('Potongan persen maksimal 100%.');
    if (form.kind === 'voucher') {
      if (!code) return setError('Kode voucher wajib diisi.');
      if (promos.some((p) => p.id !== editingId && p.kind === 'voucher' && (p.code ?? '').toUpperCase() === code)) {
        return setError(`Kode "${code}" sudah dipakai voucher lain.`);
      }
    } else if (form.kind === 'loyalty' && form.minOrders < 1) {
      return setError('Jumlah order minimal 1.');
    }

    const payload: Omit<Promo, 'id'> = {
      name,
      kind: form.kind,
      discountType: form.discountType,
      value: form.value,
      active: form.active,
      ...(form.kind === 'voucher' ? { code } : form.kind === 'loyalty' ? { minOrders: form.minOrders, loyaltyMode: form.loyaltyMode } : {}),
      ...(form.discountType === 'percent' && form.maxDiscount > 0 ? { maxDiscount: form.maxDiscount } : {}),
      ...(form.minSubtotal > 0 ? { minSubtotal: form.minSubtotal } : {}),
      ...(form.validUntil ? { validUntil: form.validUntil } : {}),
    };

    if (editingId) {
      // Ganti seluruh isi promo agar field yang dikosongkan ikut terhapus
      updatePromo(editingId, {
        code: undefined,
        minOrders: undefined,
        loyaltyMode: undefined,
        maxDiscount: undefined,
        minSubtotal: undefined,
        validUntil: undefined,
        ...payload,
      });
    } else {
      addPromo(payload);
    }
    closeForm();
  };

  const handleDelete = (p: Promo) => {
    if (confirm(`Hapus promo "${p.name}"?`)) deletePromo(p.id);
  };

  return (
    <div className="set-page">
      <div className="set-head">
        <div>
          <h1 className="set-title">Promo &amp; Voucher</h1>
          <p className="set-sub">
            Buat voucher berkode atau potongan otomatis untuk pelanggan rutin. Kasir akan melihat promo yang
            memenuhi syarat saat transaksi.
          </p>
        </div>
        <div className="set-head-actions">
          <button type="button" className="btn-add-service-main" onClick={openAdd}>
            + Buat Promo
          </button>
        </div>
      </div>

      <section className="set-card">
        <div className="set-table-wrap">
          <table className="set-table">
            <thead>
              <tr>
                <th>Promo</th>
                <th>Jenis</th>
                <th>Aturan</th>
                <th>Syarat</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'row-off'}>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>
                    <span className="cat-pill-badge">{p.kind === 'voucher' ? 'VOUCHER' : p.kind === 'auto' ? 'OTOMATIS' : 'LOYALITAS'}</span>
                  </td>
                  <td>{describePromo(p)}</td>
                  <td>
                    <small>
                      {p.minSubtotal ? `Min. belanja ${formatRupiah(p.minSubtotal)}` : 'Tanpa minimal belanja'}
                      {p.maxDiscount ? ` · maks. potongan ${formatRupiah(p.maxDiscount)}` : ''}
                      {p.validUntil ? ` · s/d ${p.validUntil}` : ''}
                    </small>
                  </td>
                  <td>
                    <button type="button" className="set-btn" onClick={() => updatePromo(p.id, { active: !p.active })}>
                      {p.active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td>
                    <button type="button" className="set-btn" onClick={() => openEdit(p)}>
                      Ubah
                    </button>{' '}
                    <button type="button" className="set-btn" onClick={() => handleDelete(p)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <small>Belum ada promo. Klik &quot;+ Buat Promo&quot; untuk membuat voucher atau diskon pelanggan rutin.</small>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {form && (
        <div className="modal-backdrop">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <div className="modal-title-group">
                <div>
                  <h3 className="modal-title">{editingId ? 'Ubah Promo' : 'Buat Promo Baru'}</h3>
                  <p className="modal-subtitle">Atur jenis, besar potongan, dan syarat berlakunya.</p>
                </div>
              </div>
              <button type="button" onClick={closeForm} className="btn-icon-close">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Nama Promo *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Contoh: Member Setia / Promo Lebaran"
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Promo</label>
                <select
                  value={form.kind}
                  onChange={(e) => patch({ kind: e.target.value as PromoKind })}
                  className="form-select"
                >
                  <option value="auto">Diskon Otomatis — semua pelanggan, tanpa kode</option>
                  <option value="loyalty">Loyalitas — otomatis untuk pelanggan rutin</option>
                  <option value="voucher">Voucher — kasir memasukkan kode</option>
                </select>
              </div>

              {form.kind === 'voucher' ? (
                <div className="form-group">
                  <label className="form-label">Kode Voucher *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => patch({ code: e.target.value.toUpperCase() })}
                    placeholder="HEMAT10"
                    className="form-input"
                  />
                </div>
              ) : form.kind === 'loyalty' ? (
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Jumlah Order (N) *</label>
                    <input
                      type="number"
                      min="1"
                      value={form.minOrders}
                      onChange={(e) => patch({ minOrders: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Berlaku</label>
                    <select
                      value={form.loyaltyMode}
                      onChange={(e) => patch({ loyaltyMode: e.target.value as LoyaltyMode })}
                      className="form-select"
                    >
                      <option value="threshold">Setelah N kali order (seterusnya)</option>
                      <option value="every">Setiap kelipatan N (ke-N, ke-2N...)</option>
                    </select>
                  </div>
                </div>
              ) : null}

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tipe Potongan</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => patch({ discountType: e.target.value as PromoDiscountType })}
                    className="form-select"
                  >
                    <option value="percent">Persen (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Nilai Potongan {form.discountType === 'percent' ? '(%)' : '(Rp)'} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.value || ''}
                    onChange={(e) => patch({ value: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Minimal Belanja (Rp) — opsional</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.minSubtotal || ''}
                    onChange={(e) => patch({ minSubtotal: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="0 = tanpa minimal"
                    className="form-input"
                  />
                </div>
                {form.discountType === 'percent' && (
                  <div className="form-group">
                    <label className="form-label">Maks. Potongan (Rp) — opsional</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={form.maxDiscount || ''}
                      onChange={(e) => patch({ maxDiscount: Math.max(0, parseInt(e.target.value) || 0) })}
                      placeholder="0 = tanpa batas"
                      className="form-input"
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Berlaku Sampai (opsional)</label>
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => patch({ validUntil: e.target.value })}
                  className="form-input"
                />
              </div>

              <label className="form-label">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => patch({ active: e.target.checked })}
                />{' '}
                Promo aktif
              </label>

              {error && <div className="pos-error-message">{error}</div>}

              <div className="modal-footer">
                <button type="button" onClick={closeForm} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Simpan Perubahan' : 'Simpan Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
