'use client';

import React from 'react';
import { useLaundry } from '@/context/LaundryContext';

interface BrandMarkProps {
  /** Kotak bawaan (ikon/huruf) yang dipakai bila owner belum mengunggah logo */
  boxClassName: string;
  size: number;
  children: React.ReactNode;
}

/** Menampilkan logo usaha bila ada, selain itu kotak bawaan. */
export const BrandMark: React.FC<BrandMarkProps> = ({ boxClassName, size, children }) => {
  const { settings } = useLaundry();
  const logo = settings.branding.logo;
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt="" className="brand-logo-img" style={{ width: size, height: size }} />;
  }
  return <span className={boxClassName}>{children}</span>;
};
