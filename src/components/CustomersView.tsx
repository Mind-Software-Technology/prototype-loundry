'use client';

import React, { useState, useMemo } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { Customer } from '@/types/laundry';
import { formatRupiah, openWhatsApp } from '@/utils/formatters';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  MessageCircle, 
  ArrowUpRight,
  X,
  Check
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, setActiveTab } = useLaundry();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [customers, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Nama dan No. WhatsApp wajib diisi');
      return;
    }

    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
    });

    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleStartOrder = (customer: Customer) => {
    setActiveTab('pos');
  };

  return (
    <div className="customers-container">
      {/* Top action bar */}
      <div className="customers-header-bar">
        <div className="search-cust-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, nomor WhatsApp, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-add-customer-main"
        >
          <UserPlus size={18} />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Customer Cards Grid */}
      <div className="customers-grid">
        {filteredCustomers.map((cust) => (
          <div key={cust.id} className="customer-card-item">
            <div className="customer-card-top">
              <div className="cust-avatar-large">
                {cust.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="cust-meta-main">
                <h3 className="cust-name-heading">{cust.name}</h3>
                <div className="cust-phone-badge">
                  <Phone size={13} />
                  <span>{cust.phone}</span>
                </div>
              </div>
            </div>

            <div className="customer-card-body">
              {cust.address && (
                <div className="cust-info-row">
                  <MapPin size={14} className="info-icon" />
                  <span>{cust.address}</span>
                </div>
              )}

              {cust.notes && (
                <div className="cust-note-box">
                  <strong>Catatan Khusus:</strong> {cust.notes}
                </div>
              )}

              <div className="cust-stats-row">
                <div className="stat-col">
                  <span className="stat-label">Total Transaksi</span>
                  <strong className="stat-num">{cust.totalOrders || 0}x Order</strong>
                </div>
                <div className="stat-col">
                  <span className="stat-label">Total Pengeluaran</span>
                  <strong className="stat-num text-cyan">
                    {formatRupiah(cust.totalSpent || 0)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="customer-card-footer">
              <button
                type="button"
                onClick={() => openWhatsApp(cust.phone, `Halo Kak ${cust.name}, salam dari CleanWave Laundry!`)}
                className="btn-cust-wa"
                title="Kirim pesan WhatsApp"
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartOrder(cust)}
                className="btn-cust-order"
              >
                <span>Buka Kasir</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="empty-customers-box">
            <Users size={48} color="#94a3b8" />
            <p>Tidak ada pelanggan yang cocok dengan pencarian "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-badge-icon">
                  <UserPlus size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 className="modal-title">Tambah Pelanggan Baru</h3>
                  <p className="modal-subtitle">Simpan data kontak & riwayat cucian pelanggan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-icon-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input
                  type="text"
                  placeholder="Contoh: Ibu Rina Wati"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor WhatsApp / HP *</label>
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Rumah / Antar-Jemput</label>
                <textarea
                  placeholder="Contoh: Jl. Mawar No. 5 RT 01 RW 03"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-textarea"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Preferensi Pakaian</label>
                <input
                  type="text"
                  placeholder="Contoh: Alergi parfum menyengat, baju kerja disetrika licin..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={18} />
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
