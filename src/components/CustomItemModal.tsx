'use client';

import React, { useState } from 'react';
import { UnitType } from '@/types/laundry';
import { PERFUMES } from '@/data/initialData';
import { formatRupiah } from '@/utils/formatters';
import { useLaundry } from '@/context/LaundryContext';

// Batas nilai satu item custom untuk kasir. Di atas ini harus diinput oleh owner.
export const CASHIER_CUSTOM_LIMIT = 500000;

interface CustomItemModalProps {
  open: boolean;
  initialName?: string;
  onClose: () => void;
}

const UNITS: UnitType[] = ['kg', 'pcs', 'meter', 'pasang'];

export const CustomItemModal: React.FC<CustomItemModalProps> = ({ open, initialName = '', onClose }) => {
  // Form dipasang ulang tiap dibuka, sehingga state otomatis kembali ke awal
  if (!open) return null;
  return <CustomItemForm initialName={initialName} onClose={onClose} />;
};

const CustomItemForm: React.FC<Omit<CustomItemModalProps, 'open'>> = ({ initialName = '', onClose }) => {
  const { currentRole, addCustomItem } = useLaundry();
  const [name, setName] = useState(initialName);
  const [unit, setUnit] = useState<UnitType>('pcs');
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [perfume, setPerfume] = useState(PERFUMES[0]);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentRole === 'owner';
  const subtotal = Math.round(price * quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Nama layanan wajib diisi.');
    if (price <= 0) return setError('Harga satuan harus lebih dari 0.');
    if (quantity <= 0) return setError('Jumlah harus lebih dari 0.');
    if (!notes.trim()) return setError('Catatan wajib diisi (jelaskan layanan/permintaan pelanggan).');
    if (!isOwner && subtotal > CASHIER_CUSTOM_LIMIT) {
      return setError(
        `Nilai item melebihi batas kasir (${formatRupiah(CASHIER_CUSTOM_LIMIT)}). Minta owner untuk menginput atau menyetujui.`
      );
    }
    addCustomItem({ name, unit, unitPrice: price, quantity, notes, perfume });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card animate-fade-in">
        <div className="modal-header">
          <div className="modal-title-group">
            <div>
              <h3 className="modal-title">Layanan Lain (Custom)</h3>
              <p className="modal-subtitle">
                Untuk layanan yang belum ada di daftar. Item ini ditandai &quot;Custom&quot; di laporan.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Nama Layanan *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Cuci Boneka Besar"
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Harga Satuan (Rp) & Satuan *</label>
            <div className="qty-control-row">
              <input
                type="number"
                min="0"
                step="1000"
                value={price || ''}
                onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className="form-input"
              />
              <select value={unit} onChange={(e) => setUnit(e.target.value as UnitType)} className="form-select">
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    per {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Jumlah ({unit}) *</label>
            <input
              type="number"
              min="0.1"
              step={unit === 'kg' ? '0.1' : '1'}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Catatan / Detail Permintaan *</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jelaskan permintaan pelanggan..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Aroma Pewangi:</label>
            <select value={perfume} onChange={(e) => setPerfume(e.target.value)} className="form-select">
              {PERFUMES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-subtotal-box">
            <span>Subtotal Item:</span>
            <strong className="subtotal-highlight">{formatRupiah(subtotal)}</strong>
          </div>

          {error && <div className="pos-error-message">{error}</div>}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Tambahkan ke Keranjang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
