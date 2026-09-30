'use client';

import React from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { AppTab } from '@/types/laundry';

const TAB_LABEL: Partial<Record<AppTab, string>> = {
  pos: 'Kasir',
  orders: 'Pelacakan',
  report: 'Laporan',
  services: 'Layanan',
};

/** Navbar sederhana untuk semua role — menu hanya menampilkan tab sesuai hak akses. */
export const RoleHeader: React.FC = () => {
  const { currentRole, availableRoles, switchRole, todayStats, activeTab, setActiveTab } = useLaundry();
  const roleDef = availableRoles.find((r) => r.id === currentRole);
  const menuTabs = (roleDef?.allowedTabs ?? []).filter((t) => TAB_LABEL[t]);

  const handleSwitchRole = () => {
    if (confirm('Ganti hak akses? Anda akan kembali ke layar pilih role.')) switchRole();
  };

  return (
    <header className="nav-bar">
      <div className="nav-inner">
        <div className="nav-brand">
          <span className="nav-brand-mark">W</span>
          <span className="nav-brand-name">Washy <span className="nav-brand-sub">Laundry</span></span>
        </div>

        {menuTabs.length > 1 && (
          <nav className="nav-tabs">
            {menuTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {TAB_LABEL[tab]}
                {tab === 'orders' && todayStats.activeQueue > 0 && (
                  <span className="nav-tab-count">{todayStats.activeQueue}</span>
                )}
              </button>
            ))}
          </nav>
        )}

        <div className="nav-user">
          <span className="nav-avatar" aria-hidden>{(roleDef?.label ?? '?').charAt(0)}</span>
          <div className="nav-user-text">
            <small>Masuk sebagai</small>
            <strong>{roleDef?.label}</strong>
          </div>
          <button type="button" onClick={handleSwitchRole} className="nav-logout">
            {currentRole === 'pelanggan' ? 'Keluar' : 'Ganti role'}
          </button>
        </div>
      </div>
    </header>
  );
};
