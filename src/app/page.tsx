'use client';

import React from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { WashyLanding } from '@/components/WashyLanding';
import { PosView } from '@/components/PosView';
import { OrdersView } from '@/components/OrdersView';
import { CustomersView } from '@/components/CustomersView';
import { ServicesView } from '@/components/ServicesView';
import { ThermalReceiptModal } from '@/components/ThermalReceiptModal';
import { RoleSelectScreen } from '@/components/RoleSelectScreen';
import { ReportView } from '@/components/ReportView';
import { SettingsView } from '@/components/SettingsView';
import { RoleHeader } from '@/components/RoleHeader';
import { TrackingView } from '@/components/TrackingView';

export default function Home() {
  const { activeTab, currentRole, availableRoles } = useLaundry();

  // PROTOTYPE ONLY: layar pilih hak akses ini akan dihilangkan di web asli,
  // digantikan sistem login sungguhan yang menentukan role dari akun user.
  if (!currentRole) {
    return <RoleSelectScreen />;
  }

  // Guard: pastikan tab aktif memang diizinkan untuk role saat ini
  // (jaga-jaga bila role diganti saat berada di tab yang kini terlarang).
  const roleDef = availableRoles.find((r) => r.id === currentRole);
  const allowedTabs = roleDef?.allowedTabs ?? [];
  const safeTab = allowedTabs.includes(activeTab) ? activeTab : roleDef?.defaultTab ?? 'landing';

  return (
    <div className={`app-wrapper ${currentRole === 'kasir' ? 'theme-kasir' : ''}`}>
      <RoleHeader />

      <main className="main-content-body">
        {safeTab === 'tracking' && <TrackingView />}
        {safeTab === 'report' && <ReportView />}
        {safeTab === 'settings' && <SettingsView />}
        {safeTab === 'landing' && <WashyLanding />}
        {safeTab === 'pos' && (
          <div className="pos-fullscreen-container">
            <PosView />
          </div>
        )}
        {safeTab === 'orders' && <OrdersView />}
        {safeTab === 'customers' && (
          <div className="main-app-container">
            <CustomersView />
          </div>
        )}
        {safeTab === 'services' && (
          <div className="main-app-container">
            <ServicesView />
          </div>
        )}
      </main>

      {/* Global Thermal Receipt Modal */}
      <ThermalReceiptModal />
    </div>
  );
}
