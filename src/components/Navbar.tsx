'use client';

import React from 'react';
import { useLaundry } from '@/context/LaundryContext';
import {
  Truck,
  Zap,
  Leaf,
  PhoneCall,
  Sparkles,
  ShoppingBag,
  Layers,
  Users,
  Tag,
  RotateCcw,
  Store,
  ExternalLink,
  UserCog,
  PackageSearch
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, todayStats, resetAllData, currentRole, availableRoles, switchRole } = useLaundry();

  const handleReset = () => {
    if (confirm('Kembalikan semua data ke pengaturan awal (demo)?')) {
      resetAllData();
    }
  };

  const handleSwitchRole = () => {
    if (confirm('Ganti hak akses? Anda akan kembali ke layar pilih role.')) {
      switchRole();
    }
  };

  // PROTOTYPE ONLY: filter menu berdasarkan role terpilih.
  // Di web asli, ini akan digantikan oleh permission dari sistem login.
  const roleDef = availableRoles.find((r) => r.id === currentRole);
  const allowedTabs = roleDef?.allowedTabs ?? [];
  const canAccess = (tab: 'pos' | 'orders' | 'customers' | 'services' | 'tracking') => allowedTabs.includes(tab);

  return (
    <header className="washy-header-root">
      {/* 1. TOP NOTICE BLUE BAR */}
      <div className="top-notice-bar">
        <div className="notice-container">
          <div className="notice-left-features">
            <div className="notice-item">
              <Truck size={14} className="notice-icon" />
              <span>Free Pickup & Delivery</span>
            </div>
            <div className="notice-item">
              <Zap size={14} className="notice-icon" />
              <span>Express Delivery in 24 Hours</span>
            </div>
            <div className="notice-item">
              <Leaf size={14} className="notice-icon" />
              <span>Eco Friendly Cleaning</span>
            </div>
          </div>

          <div className="notice-right-contact">
            <PhoneCall size={14} className="notice-icon" />
            <span>Customer Support: <strong>+62 812-3456-7890</strong></span>
          </div>
        </div>
      </div>

      {/* 2. MAIN WHITE NAVBAR */}
      <div className="main-navbar-bar">
        <div className="navbar-container">
          {/* Brand Logo: Washy LAUNDRY SERVICE */}
          <div 
            className="washy-brand-wrapper" 
            onClick={() => setActiveTab('landing')}
            style={{ cursor: 'pointer' }}
          >
            <div className="washy-logo-box">
              <Sparkles size={24} color="#ffffff" />
            </div>
            <div className="washy-text-group">
              <span className="washy-logo-name">Washy</span>
              <span className="washy-logo-subline">LAUNDRY SERVICE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="washy-nav-links">
            <button
              type="button"
              onClick={() => setActiveTab('landing')}
              className={`washy-link ${activeTab === 'landing' ? 'active' : ''}`}
            >
              Home
            </button>

            <a 
              href="#services-sec" 
              onClick={() => { if (activeTab !== 'landing') setActiveTab('landing'); }}
              className="washy-link"
            >
              Services
            </a>

            <a 
              href="#pricing-sec" 
              onClick={() => { if (activeTab !== 'landing') setActiveTab('landing'); }}
              className="washy-link"
            >
              Pricing
            </a>

            <a 
              href="#how-it-works-sec" 
              onClick={() => { if (activeTab !== 'landing') setActiveTab('landing'); }}
              className="washy-link"
            >
              How It Works
            </a>

            <a 
              href="#testimonials-sec" 
              onClick={() => { if (activeTab !== 'landing') setActiveTab('landing'); }}
              className="washy-link"
            >
              About Us
            </a>

            {/* Separator */}
            <span className="nav-vertical-divider" />

            {/* POS & Backend Management Links (hanya tampil sesuai hak akses) */}
            {canAccess('pos') && (
              <button
                type="button"
                onClick={() => setActiveTab('pos')}
                className={`washy-link pos-badge-link ${activeTab === 'pos' ? 'active' : ''}`}
              >
                <ShoppingBag size={15} />
                <span>Kasir POS</span>
              </button>
            )}

            {canAccess('orders') && (
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`washy-link ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <Layers size={15} />
                <span>Antrian ({todayStats.activeQueue})</span>
              </button>
            )}

            {canAccess('customers') && (
              <button
                type="button"
                onClick={() => setActiveTab('customers')}
                className={`washy-link ${activeTab === 'customers' ? 'active' : ''}`}
              >
                <Users size={15} />
                <span>Pelanggan</span>
              </button>
            )}

            {canAccess('tracking') && (
              <button
                type="button"
                onClick={() => setActiveTab('tracking')}
                className={`washy-link ${activeTab === 'tracking' ? 'active' : ''}`}
              >
                <PackageSearch size={15} />
                <span>Tracking</span>
              </button>
            )}

            {canAccess('services') && (
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`washy-link ${activeTab === 'services' ? 'active' : ''}`}
              >
                <Tag size={15} />
                <span>Tarif</span>
              </button>
            )}
          </nav>

          {/* Right Action Button */}
          <div className="navbar-right-actions">
            {canAccess('pos') && (
              <button
                type="button"
                onClick={() => setActiveTab('pos')}
                className="btn-book-pickup"
              >
                <span>Book a Pickup</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSwitchRole}
              className="btn-reset-pill"
              title={`Role saat ini: ${roleDef?.label ?? '-'} — Klik untuk ganti role`}
            >
              <UserCog size={14} />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="btn-reset-pill"
              title="Reset Demo Data"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* POS Mode Quick Banner Indicator (if in POS/Orders/Customers/Services view) */}
      {activeTab !== 'landing' && (
        <div className="pos-mode-subbar animate-fade-in">
          <div className="pos-mode-inner">
            <div className="pos-mode-label">
              <Store size={15} color="#0066cc" />
              <span>
                Mode Manajemen POS: <strong>{activeTab.toUpperCase()}</strong>
                {roleDef && <> &middot; Role: <strong>{roleDef.label}</strong></>}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('landing')}
              className="btn-back-to-web"
            >
              ← Kembali ke Website Washy
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
