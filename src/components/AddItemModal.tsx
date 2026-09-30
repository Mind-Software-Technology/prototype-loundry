'use client';

import React, { useState, useEffect } from 'react';
import { LaundryService } from '@/types/laundry';
import { PERFUMES } from '@/data/initialData';
import { formatRupiah } from '@/utils/formatters';

interface AddItemModalProps {
  service: LaundryService | null;
  onClose: () => void;
  onConfirm: (service: LaundryService, quantity: number, notes?: string, perfume?: string) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ service, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [perfume, setPerfume] = useState<string>(PERFUMES[0]);

  useEffect(() => {
    if (service) {
      if (service.category === 'kiloan' || service.category === 'express') {
        setQuantity(service.minWeight || 2);
      } else {
        setQuantity(1);
      }
      setNotes('');
      setPerfume(PERFUMES[0]);
    }
  }, [service]);

  if (!service) return null;

  const isKiloan = service.unit === 'kg';
  const subtotal = Math.round(service.price * quantity);

  const handlePresetWeight = (addKg: number) => {
    setQuantity((prev) => Number((Math.max(0.5, prev + addKg)).toFixed(1)));
  };

  const handleSetExactWeight = (kg: number) => {
    setQuantity(kg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    onConfirm(service, quantity, notes, perfume);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card animate-fade-in">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div>
              <h3 className="modal-title">{service.name}</h3>
              <p className="modal-subtitle">
                Tarif: <strong className="text-cyan">{formatRupiah(service.price)}</strong> / {service.unit}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Quantity / Weight Input */}
          <div className="form-group">
            <label className="form-label">
              {isKiloan ? 'Berat Cucian (Kg):' : `Jumlah (${service.unit}):`}
            </label>

            <div className="qty-control-row">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((prev) => Math.max(isKiloan ? 0.5 : 1, Number((prev - (isKiloan ? 0.5 : 1)).toFixed(1))))}
              >
                −
              </button>

              <div className="qty-input-wrapper">
                <input
                  type="number"
                  step={isKiloan ? '0.1' : '1'}
                  min={isKiloan ? '0.1' : '1'}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="qty-input-large"
                  autoFocus
                />
                <span className="qty-unit-tag">{service.unit}</span>
              </div>

              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((prev) => Number((prev + (isKiloan ? 0.5 : 1)).toFixed(1)))}
              >
                +
              </button>
            </div>

            {/* Quick Weight Chips for Kiloan */}
            {isKiloan && (
              <div className="weight-chips-group">
                <span className="chip-label">Pilihan Cepat:</span>
                {[2, 3, 4, 5, 7, 10].map((kg) => (
                  <button
                    key={kg}
                    type="button"
                    onClick={() => handleSetExactWeight(kg)}
                    className={`weight-chip ${quantity === kg ? 'active' : ''}`}
                  >
                    {kg} kg
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePresetWeight(0.5)}
                  className="weight-chip chip-add"
                >
                  +0.5 kg
                </button>
              </div>
            )}
          </div>

          {/* Perfume Selector */}
          <div className="form-group">
            <label className="form-label">Aroma Pewangi Pilihan:</label>
            <select
              value={perfume}
              onChange={(e) => setPerfume(e.target.value)}
              className="form-select"
            >
              {PERFUMES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Notes / Special Request */}
          <div className="form-group">
            <label className="form-label">
              Catatan Khusus / Noda:
            </label>
            <input
              type="text"
              placeholder="Contoh: Ada noda oli di lengan kiri, pisahkan baju putih..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Subtotal Preview */}
          <div className="modal-subtotal-box">
            <span>Subtotal Item:</span>
            <strong className="subtotal-highlight">{formatRupiah(subtotal)}</strong>
          </div>

          {/* Footer Actions */}
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
