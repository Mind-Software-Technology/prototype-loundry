'use client';

import React, { useState, useMemo } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { LaundryService, ServiceCategory, UnitType } from '@/types/laundry';
import { formatRupiah } from '@/utils/formatters';
import { 
  Tag, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Check, 
  X,
  Layers,
  Shirt,
  Sparkles,
  Zap
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { services, addService, deleteService, updateService } = useLaundry();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('kiloan');
  const [unit, setUnit] = useState<UnitType>('kg');
  const [price, setPrice] = useState<number>(8000);
  const [estimatedHours, setEstimatedHours] = useState<number>(48);
  const [description, setDescription] = useState('');

  const filteredServices = useMemo(() => {
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) {
      alert('Nama layanan dan tarif wajib diisi dengan benar');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      unit,
      price,
      estimatedHours,
      iconName: category === 'express' ? 'Zap' : (category === 'kiloan' ? 'Shirt' : 'Sparkles'),
      description: description.trim() || 'Layanan laundry berkualitas tinggi.',
      minWeight: unit === 'kg' ? 2 : undefined,
    };

    if (editingId) {
      updateService(editingId, payload);
    } else {
      addService(payload);
    }
    closeModal();
  };

  const resetForm = () => {
    setName('');
    setCategory('kiloan');
    setUnit('kg');
    setPrice(8000);
    setEstimatedHours(48);
    setDescription('');
  };

  const openAdd = () => {
    resetForm();
    setEditingId(null);
    setShowAddModal(true);
  };

  const openEdit = (srv: LaundryService) => {
    setEditingId(srv.id);
    setName(srv.name);
    setCategory(srv.category);
    setUnit(srv.unit);
    setPrice(srv.price);
    setEstimatedHours(srv.estimatedHours);
    setDescription(srv.description);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: string, sName: string) => {
    if (confirm(`Hapus layanan "${sName}" dari daftar tarif?`)) {
      deleteService(id);
    }
  };

  return (
    <div className="services-container">
      {/* Top action bar */}
      <div className="services-header-bar">
        <div className="search-srv-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Cari tarif layanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="btn-add-service-main"
        >
          <Plus size={18} />
          <span>Tambah Layanan / Tarif Baru</span>
        </button>
      </div>

      {/* Services List Table / Grid */}
      <div className="services-cards-container">
        <div className="services-table-wrapper">
          <table className="services-table">
            <thead>
              <tr>
                <th>Layanan & Deskripsi</th>
                <th>Kategori</th>
                <th>Satuan</th>
                <th>Estimasi Selesai</th>
                <th>Tarif Harga</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((srv) => (
                <tr key={srv.id}>
                  <td>
                    <div className="srv-name-cell">
                      <div className={`srv-icon-badge cat-${srv.category}`}>
                        {srv.category === 'express' ? <Zap size={16} /> : <Shirt size={16} />}
                      </div>
                      <div>
                        <strong className="srv-title-text">{srv.name}</strong>
                        <p className="srv-desc-sub">{srv.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`cat-pill-badge cat-${srv.category}`}>
                      {srv.category.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="unit-badge">per {srv.unit}</span>
                  </td>
                  <td>
                    <div className="est-hours-badge">
                      <Clock size={13} />
                      <span>{srv.estimatedHours} Jam{srv.estimatedHours >= 24 ? ` (${Math.round(srv.estimatedHours / 24)} hari)` : ''}</span>
                    </div>
                  </td>
                  <td>
                    <strong className="srv-price-text">{formatRupiah(srv.price)}</strong>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => openEdit(srv)}
                      className="btn-edit-row"
                      title="Ubah layanan"
                      aria-label="Ubah layanan"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(srv.id, srv.name)}
                      className="btn-delete-row"
                      title="Hapus tarif"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Service */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-badge-icon">
                  <Tag size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 className="modal-title">{editingId ? 'Ubah Layanan' : 'Tambah Layanan Laundry Baru'}</h3>
                  <p className="modal-subtitle">{editingId ? 'Perbarui nama, tarif, atau durasi layanan' : 'Tentukan nama, tarif, dan durasi pengerjaan'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="btn-icon-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Nama Layanan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Cuci Karpet Tebal / Cuci Jas Setelan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="form-select"
                  >
                    <option value="kiloan">Kiloan</option>
                    <option value="express">Express (Kilat)</option>
                    <option value="satuan">Satuan</option>
                    <option value="karpet_sepatu">Karpet & Sepatu</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Satuan Hitung</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="form-select"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="pcs">Potong / Pcs</option>
                    <option value="pasang">Pasang (Sepatu)</option>
                    <option value="meter">Meter Persegi (m²)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tarif Harga (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimasi Pengerjaan (Jam)</label>
                  <input
                    type="number"
                    min="1"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Layanan</label>
                <input
                  type="text"
                  placeholder="Contoh: Termasuk deterjen konsentrat, pewangi, & plastik pembungkus"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={18} />
                  {editingId ? 'Simpan Perubahan' : 'Simpan Tarif Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
