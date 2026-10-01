'use client';

import React, { useState, useMemo } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { LaundryService, Customer, ServiceCategory, PaymentMethod, PaymentStatus } from '@/types/laundry';
import { formatRupiah } from '@/utils/formatters';
import { PERFUMES } from '@/data/initialData';
import { AddItemModal } from './AddItemModal';
import { CustomItemModal } from './CustomItemModal';

export const PosView: React.FC = () => {
  const { 
    services, 
    customers, 
    addCustomer, 
    cart, 
    addToCart, 
    updateCartItemQty, 
    removeFromCart, 
    clearCart, 
    cartSubtotal,
    createOrder,
    openReceiptModal
  } = useLaundry();

  // Search & Filters
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalService, setModalService] = useState<LaundryService | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  // Customer State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerListOpen, setCustomerListOpen] = useState(false);
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [customerNotice, setCustomerNotice] = useState<string | null>(null);

  // Checkout State
  const [globalPerfume, setGlobalPerfume] = useState(PERFUMES[0]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [cashPaidAmount, setCashPaidAmount] = useState<number>(0);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Filter Services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchCat = selectedCategory === 'all' || srv.category === selectedCategory;
      const matchSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Filter Customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.memberCode ?? '').toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  // Calculations
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const changeAmount = Math.max(0, cashPaidAmount - finalTotal);


  // Add new customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerNotice(null);
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Nama dan No. WhatsApp wajib diisi');
      return;
    }
    const alreadyRegistered = customers.some((c) => c.phone.trim() === newCustPhone.trim());
    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
    });
    setSelectedCustomer(created);
    setCustomerNotice(
      alreadyRegistered
        ? `No. HP sudah terdaftar — memakai member ${created.memberCode} (${created.name}).`
        : `Pelanggan baru terdaftar. Nomor member: ${created.memberCode}. Catat/berikan ke pelanggan agar tidak perlu input ulang.`
    );
    setIsAddingNewCustomer(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setCustomerSearch('');
  };

  // Quick Cash Preset
  const handleQuickCash = (amount: number) => {
    setCashPaidAmount(amount);
  };

  // Process Transaction
  const handleProcessTransaction = () => {
    setOrderError(null);

    if (cart.length === 0) {
      setOrderError('Keranjang masih kosong. Pilih layanan laundry terlebih dahulu.');
      return;
    }

    if (!selectedCustomer) {
      setOrderError('Pilih pelanggan terlebih dahulu.');
      return;
    }

    if (paymentStatus === 'paid' && paymentMethod === 'cash' && cashPaidAmount > 0 && cashPaidAmount < finalTotal) {
      setOrderError(`Uang tunai kurang dari total tagihan (${formatRupiah(finalTotal)})!`);
      return;
    }

    const hasExpress = cart.some((c) => c.category === 'express');
    const estimatedHours = hasExpress ? 8 : 48;

    const paid = paymentStatus === 'paid' 
      ? (paymentMethod === 'cash' && cashPaidAmount > 0 ? cashPaidAmount : finalTotal)
      : (paymentStatus === 'dp' ? cashPaidAmount : 0);

    const newOrder = createOrder({
      customer: selectedCustomer,
      items: cart,
      discount: discountAmount,
      paidAmount: paid,
      paymentMethod,
      paymentStatus,
      perfume: globalPerfume,
      specialNotes: specialNotes.trim(),
      estimatedReadyHours: estimatedHours,
    });

    setSpecialNotes('');
    setDiscountAmount(0);
    setCashPaidAmount(0);
    openReceiptModal(newOrder);
  };

  return (
    <div className="pos-terminal-wrapper">
      {/* POS TOP BAR */}
      <div className="pos-top-header">
        <div className="pos-title-block">
          <div>
            <h2 className="pos-main-heading">Terminal Kasir POS</h2>
            <p className="pos-sub-heading">Point of Sale & Kalkulator Cucian Laundry</p>
          </div>
        </div>

        <div className="pos-header-badges">
          <div className="pos-kpi-chip">
            <span className="kpi-chip-label">Keranjang:</span>
            <strong className="kpi-chip-val">{cart.length} Layanan</strong>
          </div>
          <div className="pos-kpi-chip highlight-blue">
            <span className="kpi-chip-label">Total Sementara:</span>
            <strong className="kpi-chip-val">{formatRupiah(cartSubtotal)}</strong>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN POS TERMINAL LAYOUT */}
      <div className="pos-grid-layout">
        {/* LEFT COLUMN: SERVICE CATALOG */}
        <div className="pos-left-catalog">
          {/* Search and Category Filter Toolbar */}
          <div className="pos-filter-toolbar">
            <div className="pos-search-wrapper">
              <input
                type="text"
                placeholder="Cari layanan (Komplit, Bedcover, Sepatu, Setrika)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pos-search-field"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="btn-clear-pos-search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="pos-cat-tabs">
              <button
                type="button"
                className={`pos-tab-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Semua
              </button>
              <button
                type="button"
                className="pos-tab-pill"
                onClick={() => setCustomModalOpen(true)}
              >
                + Layanan Lain
              </button>
              <button
                type="button"
                className={`pos-tab-pill ${selectedCategory === 'kiloan' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('kiloan')}
              >
                Kiloan
              </button>
              <button
                type="button"
                className={`pos-tab-pill ${selectedCategory === 'express' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('express')}
              >
                Express
              </button>
              <button
                type="button"
                className={`pos-tab-pill ${selectedCategory === 'satuan' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('satuan')}
              >
                Satuan
              </button>
              <button
                type="button"
                className={`pos-tab-pill ${selectedCategory === 'karpet_sepatu' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('karpet_sepatu')}
              >
                Sepatu & Karpet
              </button>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="pos-items-grid">
            {filteredServices.map((service) => {
              const isKiloan = service.unit === 'kg';
              const isInCart = cart.some((c) => c.serviceId === service.id);

              return (
                <div
                  key={service.id}
                  className={`pos-item-card ${isInCart ? 'card-in-cart' : ''} ${service.category === 'express' ? 'card-express-highlight' : ''}`}
                  onClick={() => setModalService(service)}
                >
                  <div className="pos-card-head">
                    {service.category === 'express' ? (
                      <span className="pos-badge-express">Kilat 8 Jam</span>
                    ) : (
                      <span className="pos-badge-unit">per {service.unit}</span>
                    )}
                  </div>

                  <div className="pos-card-content">
                    <h4 className="pos-item-name">{service.name}</h4>
                    <p className="pos-item-brief">{service.description}</p>
                  </div>

                  <div className="pos-card-bottom">
                    <div className="pos-price-tag">
                      <span className="pos-price-unit">{formatRupiah(service.price)}</span>
                      <small className="pos-price-sub">/{service.unit}</small>
                    </div>

                    <button
                      type="button"
                      className="pos-btn-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalService(service);
                      }}
                    >
                      {isKiloan ? 'Timbang' : 'Pilih'}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredServices.length === 0 && (
              <div className="pos-empty-catalog">
                <p>Tidak ada layanan yang sesuai dengan pencarian "{searchQuery}"</p>
                <button type="button" className="btn-link-add" onClick={() => setCustomModalOpen(true)}>
                  + Tambah sebagai Layanan Lain{searchQuery ? ` "${searchQuery}"` : ''}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: UNIFIED CHECKOUT TERMINAL */}
        <div className="pos-right-terminal">
          {/* Card 1: Data Pelanggan */}
          <div className="terminal-card">
            <div className="terminal-card-title">
              <span className="card-label">
Data Pelanggan
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
                className="btn-toggle-customer"
              >
                {isAddingNewCustomer ? 'Pilih Terdaftar' : '+ Pelanggan Baru'}
              </button>
            </div>

            {isAddingNewCustomer ? (
              <form onSubmit={handleSaveCustomer} className="new-customer-box">
                <p className="member-hint">Nomor member unik (WSH-xxxx) dibuat otomatis saat disimpan.</p>
                <input
                  type="text"
                  placeholder="Nama Pelanggan *"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="terminal-input"
                  required
                />
                <input
                  type="tel"
                  placeholder="No. WhatsApp / HP *"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="terminal-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Alamat (opsional)"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="terminal-input"
                />
                <div className="cust-actions-row">
                  <button type="submit" className="btn-save-cust-sm">
Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCustomer(false)}
                    className="btn-cancel-cust-sm"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div className="customer-picker-area">
                <div className="customer-search-input-wrap">
                  <input
                    type="text"
                    placeholder="Pilih dari daftar atau ketik nomor member, nama, no. telepon..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setCustomerListOpen(true);
                    }}
                    onFocus={() => setCustomerListOpen(true)}
                    onBlur={() => setCustomerListOpen(false)}
                    className="customer-search-field"
                  />
                </div>

                {customerListOpen && (
                  <div className="customer-dropdown-menu">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((c) => (
                        <div
                          key={c.id}
                          className="customer-dropdown-item"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomerNotice(null);
                            setCustomerSearch('');
                            setCustomerListOpen(false);
                          }}
                        >
                          <span className="dropdown-name">
                            {c.name} <span className="member-code-tag">{c.memberCode}</span>
                          </span>
                          <span className="dropdown-phone">{c.phone}</span>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-empty-msg">
                        {customerSearch.trim() ? 'Pelanggan tidak ditemukan.' : 'Belum ada pelanggan terdaftar.'}{' '}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIsAddingNewCustomer(true);
                            setNewCustName(customerSearch);
                          }}
                          className="btn-link-add"
                        >
                          + Tambah "{customerSearch}"
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {customerNotice && <div className="customer-notice">{customerNotice}</div>}

                {selectedCustomer && (
                  <div className="selected-customer-pill">
                    <div className="customer-avatar-badge">
                      {selectedCustomer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="customer-meta-text">
                      <strong className="customer-name-bold">{selectedCustomer.name}</strong>
                      <span className="customer-phone-sub">
                        {selectedCustomer.phone}
                      </span>
                      <span className="member-code-tag">No. Member: {selectedCustomer.memberCode}</span>
                    </div>
                    <span className="customer-order-count">
                      {selectedCustomer.totalOrders || 0}x Order
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Keranjang Item Cucian */}
          <div className="terminal-card">
            <div className="terminal-card-title">
              <span className="card-label">
Keranjang Cucian ({cart.length})
              </span>
              {cart.length > 0 && (
                <button type="button" onClick={clearCart} className="btn-clear-cart-link">
                  Kosongkan
                </button>
              )}
            </div>

            <div className="terminal-cart-list">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.cartItemId} className="cart-list-item">
                    <div className="item-details-col">
                      <strong className="item-title">
                        {item.serviceName}
                        {item.isCustom && <span className="member-code-tag"> Custom</span>}
                      </strong>
                      <div className="item-sub-meta">
                        <span>{formatRupiah(item.unitPrice)}/{item.unit}</span>
                        {item.perfume && (
                          <span className="item-perfume-tag">• {item.perfume.split('(')[0]}</span>
                        )}
                      </div>
                      {item.notes && (
                        <div className="item-note-text">Catatan: {item.notes}</div>
                      )}
                    </div>

                    <div className="item-controls-col">
                      {/* Stepper */}
                      <div className="compact-stepper">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItemQty(
                              item.cartItemId,
                              item.quantity - (item.unit === 'kg' ? 0.5 : 1)
                            )
                          }
                          className="stepper-arrow-btn"
                        >
                          −
                        </button>
                        <span className="stepper-number">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItemQty(
                              item.cartItemId,
                              item.quantity + (item.unit === 'kg' ? 0.5 : 1)
                            )
                          }
                          className="stepper-arrow-btn"
                        >
                          +
                        </button>
                      </div>

                      <div className="item-total-price">
                        {formatRupiah(item.subtotal)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="btn-remove-item"
                        title="Hapus item"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cart-empty-box">
                  <p>Keranjang cucian masih kosong</p>
                  <small>Klik layanan di sebelah kiri untuk menambahkan</small>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Opsi Parfum & Catatan Transaksi */}
          <div className="terminal-card">
            <div className="preference-form-row">
              <label className="pref-label">Pewangi:</label>
              <select
                value={globalPerfume}
                onChange={(e) => setGlobalPerfume(e.target.value)}
                className="pref-select"
              >
                {PERFUMES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="preference-form-row">
              <label className="pref-label">Catatan:</label>
              <input
                type="text"
                placeholder="Instruksi pakaian / noda..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="pref-input"
              />
            </div>
          </div>

          {/* Card 4: Kalkulator Pembayaran & Selesai */}
          <div className="terminal-card billing-summary-card">
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatRupiah(cartSubtotal)}</strong>
            </div>

            <div className="summary-line">
              <span>Diskon (Rp)</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className="discount-field"
              />
            </div>

            <div className="grand-total-row">
              <span className="total-title">TOTAL TAGIHAN</span>
              <span className="total-figure">{formatRupiah(finalTotal)}</span>
            </div>

            {/* Status Bayar */}
            <div className="payment-options-block">
              <span className="opt-title">Status Pembayaran:</span>
              <div className="status-button-group">
                <button
                  type="button"
                  className={`status-btn ${paymentStatus === 'paid' ? 'active-paid' : ''}`}
                  onClick={() => {
                    setPaymentStatus('paid');
                    setCashPaidAmount(finalTotal);
                  }}
                >
Lunas
                </button>
                <button
                  type="button"
                  className={`status-btn ${paymentStatus === 'unpaid' ? 'active-unpaid' : ''}`}
                  onClick={() => {
                    setPaymentStatus('unpaid');
                    setCashPaidAmount(0);
                  }}
                >
                  Bayar Nanti
                </button>
                <button
                  type="button"
                  className={`status-btn ${paymentStatus === 'dp' ? 'active-dp' : ''}`}
                  onClick={() => setPaymentStatus('dp')}
                >
                  DP
                </button>
              </div>
            </div>

            {/* Metode Bayar */}
            <div className="payment-options-block">
              <span className="opt-title">Metode Pembayaran:</span>
              <div className="method-button-group">
                <button
                  type="button"
                  className={`method-btn ${paymentMethod === 'cash' ? 'active-method' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
Tunai
                </button>
                <button
                  type="button"
                  className={`method-btn ${paymentMethod === 'qris' ? 'active-method' : ''}`}
                  onClick={() => setPaymentMethod('qris')}
                >
QRIS
                </button>
                <button
                  type="button"
                  className={`method-btn ${paymentMethod === 'transfer' ? 'active-method' : ''}`}
                  onClick={() => setPaymentMethod('transfer')}
                >
Transfer
                </button>
              </div>
            </div>

            {/* Tunai Details */}
            {paymentMethod === 'cash' && paymentStatus !== 'unpaid' && (
              <div className="cash-calculator-box">
                <div className="cash-input-row">
                  <span className="cash-label">Uang Tunai:</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder={formatRupiah(finalTotal)}
                    value={cashPaidAmount || ''}
                    onChange={(e) => setCashPaidAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="cash-field"
                  />
                </div>

                <div className="quick-cash-row">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(finalTotal)}
                    className="quick-chip"
                  >
                    Uang Pas
                  </button>
                  {[20000, 50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickCash(amt)}
                      className={`quick-chip ${cashPaidAmount === amt ? 'chip-active' : ''}`}
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>

                <div className="change-result-row">
                  <span>Kembalian:</span>
                  <strong className={changeAmount >= 0 ? 'text-green' : 'text-red'}>
                    {formatRupiah(changeAmount)}
                  </strong>
                </div>
              </div>
            )}

            {orderError && (
              <div className="pos-error-message">
                <span>{orderError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleProcessTransaction}
              disabled={cart.length === 0}
              className="btn-complete-order"
            >
              <span>PROSES PESANAN & CETAK NOTA</span>
            </button>
          </div>
        </div>
      </div>

      <CustomItemModal
        open={customModalOpen}
        initialName={searchQuery}
        onClose={() => setCustomModalOpen(false)}
      />

      {/* Modal Timbang Berat / Pcs & Parfum */}
      <AddItemModal
        service={modalService}
        onClose={() => setModalService(null)}
        onConfirm={(srv, qty, notes, perfume) => {
          addToCart(srv, qty, notes, perfume);
        }}
      />
    </div>
  );
};
