'use client';

import React from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { Crown, ShoppingBag, Truck, User, Sparkles, ArrowRight } from 'lucide-react';

const ROLE_ICONS = {
  Crown,
  ShoppingBag,
  Truck,
  User,
};

export const RoleSelectScreen: React.FC = () => {
  const { availableRoles, selectRole } = useLaundry();

  return (
    <div className="role-select-root">
      <div className="role-select-card">
        <div className="role-select-brand">
          <div className="washy-logo-box">
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div className="washy-text-group">
            <span className="washy-logo-name">Washy</span>
            <span className="washy-logo-subline">LAUNDRY SERVICE</span>
          </div>
        </div>

        <h1 className="role-select-title">Pilih Hak Akses</h1>
        <p className="role-select-subtitle">
          Simulasi login prototype — di versi produksi, menu akan otomatis
          menyesuaikan hak akses akun yang login.
        </p>

        <div className="role-select-list">
          {availableRoles.map((role) => {
            const Icon = ROLE_ICONS[role.iconName];
            return (
              <button
                key={role.id}
                type="button"
                className="role-select-item"
                onClick={() => selectRole(role.id)}
              >
                <div className="role-select-icon">
                  <Icon size={22} />
                </div>
                <div className="role-select-item-text">
                  <span className="role-select-item-label">{role.label}</span>
                  <span className="role-select-item-desc">{role.description}</span>
                </div>
                <ArrowRight size={18} className="role-select-item-arrow" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
