'use client';

import React from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { AppTab } from '@/types/laundry';
import { Sparkles, LogOut } from 'lucide-react';

const TAB_LABEL: Partial<Record<AppTab, string>> = {
  pos: 'Kasir',
  orders: 'Pelacakan',
  report: 'Laporan',
};

/** Header ringkas untuk semua role — menu hanya menampilkan tab sesuai hak akses. */
export const RoleHeader: React.FC = () => {
  const { currentRole, availableRoles, switchRole, todayStats, activeTab, setActiveTab } = useLaundry();
  const roleDef = availableRoles.find((r) => r.id === currentRole);
  const menuTabs = (roleDef?.allowedTabs ?? []).filter((t) => TAB_LABEL[t]);

  const handleSwitchRole = () => {
    if (confirm('Ganti hak akses? Anda akan kembali ke layar pilih role.')) switchRole();
  };

  return (
    <header className="role-header">
      <div className="role-header-inner">
        <div className="washy-brand-wrapper">
          <div className="washy-logo-box">
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div className="washy-text-group">
            <span className="washy-logo-name">Washy</span>
            <span className="washy-logo-subline">LAUNDRY SERVICE</span>
          </div>
        </div>

        {menuTabs.length > 1 && (
          <nav className="role-header-nav">
            {menuTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`role-nav-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {TAB_LABEL[tab]}
                {tab === 'orders' && <span className="role-nav-count">{todayStats.activeQueue}</span>}
              </button>
            ))}
          </nav>
        )}

        <div className="role-header-right">
          <span className="role-header-badge">{roleDef?.label}</span>
          <button type="button" onClick={handleSwitchRole} className="role-header-logout">
            <LogOut size={15} />
            <span>{currentRole === 'pelanggan' ? 'Keluar' : 'Ganti Role'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
