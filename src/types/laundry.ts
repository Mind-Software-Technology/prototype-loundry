export type UserRole = 'owner' | 'kasir' | 'kurir' | 'pelanggan';

export type AppTab = 'landing' | 'pos' | 'orders' | 'customers' | 'services' | 'tracking' | 'report' | 'settings';

export interface RoleDefinition {
  id: UserRole;
  label: string;
  description: string;
  iconName: 'Crown' | 'ShoppingBag' | 'Truck' | 'User';
  allowedTabs: AppTab[];
  defaultTab: AppTab;
}

export type ServiceCategory = 'kiloan' | 'satuan' | 'express' | 'karpet_sepatu';

export type UnitType = 'kg' | 'pcs' | 'meter' | 'pasang';

export interface LaundryService {
  id: string;
  name: string;
  category: ServiceCategory;
  unit: UnitType;
  price: number;
  estimatedHours: number;
  iconName: string;
  description: string;
  minWeight?: number;
}

export interface Customer {
  id: string;
  memberCode: string; // nomor unik pelanggan, mis. WSH-0001
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface CartItem {
  cartItemId: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  unit: UnitType;
  unitPrice: number;
  quantity: number; // e.g. 3.5 for kg, 2 for pcs
  perfume?: string;
  notes?: string;
  subtotal: number;
  isCustom?: boolean; // layanan di luar daftar resmi, diinput manual oleh kasir
}

export type OrderStatus = 
  | 'queue'      // Baru Masuk / Antrian
  | 'washing'    // Sedang Dicuci
  | 'drying'     // Pengeringan
  | 'ironing'    // Setrika / Lipat
  | 'ready'      // Siap Diambil
  | 'completed'  // Selesai / Sudah Diambil
  | 'cancelled'; // Dibatalkan

export type PaymentStatus = 
  | 'paid'    // Lunas
  | 'unpaid'  // Belum Lunas (Bayar Nanti)
  | 'dp';     // DP (Down Payment)

export type PaymentMethod = 
  | 'cash'
  | 'qris'
  | 'transfer';

export interface Order {
  id: string; // e.g. "LD-2409-001"
  orderDate: string;
  estimatedReadyDate: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  finalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  perfume: string;
  specialNotes?: string;
  cashierName: string;
  completedAt?: string;
}

// Menu (modul) yang bisa diaktifkan/dinonaktifkan oleh owner
export type ModuleTab = 'pos' | 'orders' | 'services' | 'report' | 'tracking';

export interface ModuleDefinition {
  id: ModuleTab;
  label: string;
  description: string;
}

// Pengaturan langganan/fitur per usaha (SaaS): menu aktif, role aktif, dan hak akses per role
export interface AppSettings {
  enabledModules: Record<ModuleTab, boolean>;
  enabledRoles: Record<UserRole, boolean>;
  permissions: Record<UserRole, ModuleTab[]>;
}
