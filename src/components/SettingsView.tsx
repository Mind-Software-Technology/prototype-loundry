'use client';

import React, { useState } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { MODULE_DEFINITIONS, ROLE_DEFINITIONS } from '@/data/initialData';
import { AppSettings, BrandingSettings, ModuleTab, UserRole } from '@/types/laundry';
import { DEFAULT_BRANDING } from '@/data/initialData';
import { isTooLight, resizeLogo } from '@/utils/branding';

const COLOR_PRESETS = ['#0052cc', '#0e7490', '#059669', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#334155'];

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled, label }) => (
  <label className={`sw ${disabled ? 'disabled' : ''}`}>
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
    />
    <span className="sw-track" />
  </label>
);

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useLaundry();

  const [logoError, setLogoError] = useState<string | null>(null);
  const { branding } = settings;

  const setBranding = (fields: Partial<BrandingSettings>) =>
    updateSettings({ ...settings, branding: { ...branding, ...fields } });

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLogoError(null);
    if (!file.type.startsWith('image/')) return setLogoError('File harus berupa gambar (PNG, JPG, SVG, dll).');
    if (file.size > 5 * 1024 * 1024) return setLogoError('Ukuran gambar maksimal 5 MB.');
    try {
      setBranding({ logo: await resizeLogo(file) });
    } catch {
      setLogoError('Gambar tidak bisa dibaca. Coba file lain.');
    }
  };

  const setModule = (id: ModuleTab, value: boolean) =>
    updateSettings({ ...settings, enabledModules: { ...settings.enabledModules, [id]: value } });

  const setRole = (id: UserRole, value: boolean) =>
    updateSettings({ ...settings, enabledRoles: { ...settings.enabledRoles, [id]: value } });

  const togglePermission = (role: UserRole, mod: ModuleTab, value: boolean) => {
    const current = settings.permissions[role] ?? [];
    const next = value ? [...new Set([...current, mod])] : current.filter((m) => m !== mod);
    updateSettings({ ...settings, permissions: { ...settings.permissions, [role]: next } } as AppSettings);
  };

  const handleReset = () => {
    if (confirm('Kembalikan semua pengaturan tampilan, menu, role, dan hak akses ke default?')) resetSettings();
  };

  const activeModules = MODULE_DEFINITIONS.filter((m) => settings.enabledModules[m.id]).length;
  const activeRoles = ROLE_DEFINITIONS.filter((r) => r.id === 'owner' || settings.enabledRoles[r.id]).length;

  return (
    <div className="set-page">
      <div className="set-head">
        <div>
          <h1 className="set-title">Pengaturan</h1>
          <p className="set-sub">
            Pilih menu dan role yang dipakai usaha Anda. Perubahan tersimpan otomatis dan langsung berlaku.
          </p>
        </div>
        <div className="set-head-actions">
          <span className="set-summary">{activeModules} menu aktif &middot; {activeRoles} role aktif</span>
          <button type="button" className="set-btn" onClick={handleReset}>Kembalikan default</button>
        </div>
      </div>

      <section className="set-card">
        <div className="set-card-head">
          <h2>Identitas &amp; tampilan usaha</h2>
          <p>Nama, logo, dan warna utama akan tampil di seluruh aplikasi dan nota.</p>
        </div>
        <ul className="set-list">
          <li className="set-row">
            <div className="set-row-text">
              <strong>Nama usaha</strong>
              <span>Tampil di header, layar masuk, website, dan nota.</span>
            </div>
            <input
              type="text"
              className="form-input"
              style={{ maxWidth: 260 }}
              value={branding.businessName}
              maxLength={40}
              placeholder={DEFAULT_BRANDING.businessName}
              onChange={(e) => setBranding({ businessName: e.target.value })}
            />
          </li>
          <li className="set-row">
            <div className="set-row-text">
              <strong>Logo</strong>
              <span>Unggah gambar (otomatis diperkecil). Hapus untuk memakai ikon bawaan.</span>
              {logoError && <span className="text-red">{logoError}</span>}
            </div>
            <div className="brand-set-row">
              <div className="brand-set-preview">
                {branding.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={branding.logo} alt="Logo usaha" className="brand-logo-img" style={{ width: 56, height: 56 }} />
                ) : (
                  <small>Belum ada</small>
                )}
              </div>
              <label className="set-btn" style={{ cursor: 'pointer' }}>
                Unggah logo
                <input type="file" accept="image/*" onChange={handleLogoFile} hidden />
              </label>
              {branding.logo && (
                <button type="button" className="set-btn" onClick={() => setBranding({ logo: '' })}>
                  Hapus logo
                </button>
              )}
            </div>
          </li>
          <li className="set-row">
            <div className="set-row-text">
              <strong>Warna utama</strong>
              <span>Dipakai untuk tombol, menu aktif, dan aksen.</span>
              {isTooLight(branding.primaryColor) && (
                <span className="text-red">Warna terlalu terang, teks putih pada tombol akan sulit dibaca.</span>
              )}
            </div>
            <div className="brand-set-row">
              <div className="brand-swatches">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`brand-swatch ${branding.primaryColor.toLowerCase() === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setBranding({ primaryColor: c })}
                    aria-label={`Pilih warna ${c}`}
                  />
                ))}
              </div>
              <input
                type="color"
                className="brand-color-input"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ primaryColor: e.target.value })}
                aria-label="Pilih warna kustom"
              />
            </div>
          </li>
        </ul>
      </section>

      <section className="set-card">
        <div className="set-card-head">
          <h2>Menu yang digunakan</h2>
          <p>Menu yang dimatikan tidak akan tampil untuk role mana pun.</p>
        </div>
        <ul className="set-list">
          {MODULE_DEFINITIONS.map((m) => (
            <li key={m.id} className="set-row">
              <div className="set-row-text">
                <strong>{m.label}</strong>
                <span>{m.description}</span>
              </div>
              <Switch
                checked={settings.enabledModules[m.id]}
                onChange={(v) => setModule(m.id, v)}
                label={`Aktifkan menu ${m.label}`}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="set-card">
        <div className="set-card-head">
          <h2>Role yang digunakan</h2>
          <p>Role yang dimatikan tidak muncul di pilihan masuk. Owner selalu aktif.</p>
        </div>
        <ul className="set-list">
          {ROLE_DEFINITIONS.map((r) => (
            <li key={r.id} className="set-row">
              <div className="set-row-text">
                <strong>{r.label}</strong>
                <span>{r.id === 'owner' ? 'Pemilik usaha — selalu aktif dan mengatur seluruh pengaturan ini.' : r.description}</span>
              </div>
              <Switch
                checked={r.id === 'owner' ? true : settings.enabledRoles[r.id]}
                disabled={r.id === 'owner'}
                onChange={(v) => setRole(r.id, v)}
                label={`Aktifkan role ${r.label}`}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="set-card">
        <div className="set-card-head">
          <h2>Hak akses menu per role</h2>
          <p>Centang menu yang boleh dibuka tiap role. Menu yang sedang dimatikan ditampilkan redup.</p>
        </div>
        <div className="set-table-wrap">
          <table className="set-table">
            <thead>
              <tr>
                <th>Role</th>
                {MODULE_DEFINITIONS.map((m) => (
                  <th key={m.id} className={settings.enabledModules[m.id] ? '' : 'off'}>{m.label}</th>
                ))}
                <th>Pengaturan</th>
              </tr>
            </thead>
            <tbody>
              {ROLE_DEFINITIONS.map((r) => {
                const roleOff = r.id !== 'owner' && !settings.enabledRoles[r.id];
                return (
                  <tr key={r.id} className={roleOff ? 'row-off' : ''}>
                    <td>
                      <strong>{r.label}</strong>
                      {roleOff && <small> (nonaktif)</small>}
                    </td>
                    {MODULE_DEFINITIONS.map((m) => (
                      <td key={m.id} className={settings.enabledModules[m.id] ? '' : 'off'}>
                        <input
                          type="checkbox"
                          className="set-check"
                          checked={(settings.permissions[r.id] ?? []).includes(m.id)}
                          onChange={(e) => togglePermission(r.id, m.id, e.target.checked)}
                          aria-label={`${r.label} boleh membuka ${m.label}`}
                        />
                      </td>
                    ))}
                    <td>
                      <input
                        type="checkbox"
                        className="set-check"
                        checked={r.id === 'owner'}
                        disabled
                        aria-label={`Hak akses pengaturan ${r.label}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="set-note">
          Role tanpa satu pun menu aktif otomatis disembunyikan dari pilihan masuk. Menu Pengaturan hanya untuk Owner.
        </p>
      </section>
    </div>
  );
};
