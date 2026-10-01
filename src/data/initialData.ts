import {
  LaundryService,
  Customer,
  Order,
  RoleDefinition,
  ModuleDefinition,
  ModuleTab,
  AppSettings,
  AppTab,
  UserRole,
} from '@/types/laundry';

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'owner',
    label: 'Owner / Admin',
    description: 'Melihat Laporan usaha, mengelola Pelacakan pesanan, dan menambah/mengubah Layanan.',
    iconName: 'Crown',
    allowedTabs: ['report', 'orders', 'services'],
    defaultTab: 'report',
  },
  {
    id: 'kasir',
    label: 'Kasir',
    description: 'Sistem Kasir POS untuk transaksi dan mengelola Pelacakan pesanan.',
    iconName: 'ShoppingBag',
    allowedTabs: ['pos', 'orders'],
    defaultTab: 'pos',
  },
  {
    id: 'kurir',
    label: 'Kurir / Operasional',
    description: 'Akses terbatas: mengelola Pelacakan (memperbarui status pesanan).',
    iconName: 'Truck',
    allowedTabs: ['orders'],
    defaultTab: 'orders',
  },
  {
    id: 'pelanggan',
    label: 'Pelanggan',
    description: 'Hanya pelacakan (tracking) status cucian dengan nomor nota atau no. HP.',
    iconName: 'User',
    allowedTabs: ['tracking'],
    defaultTab: 'tracking',
  },
];

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  { id: 'report', label: 'Laporan', description: 'Ringkasan omzet, transaksi, layanan terlaris, dan status pesanan.' },
  { id: 'pos', label: 'Kasir (POS)', description: 'Terminal transaksi: pilih layanan, pelanggan, dan pembayaran.' },
  { id: 'orders', label: 'Pelacakan Pesanan', description: 'Perbarui tahap pengerjaan, status bayar, cetak struk, dan WhatsApp.' },
  { id: 'services', label: 'Layanan & Tarif', description: 'Tambah, ubah, dan hapus layanan laundry beserta tarifnya.' },
  { id: 'tracking', label: 'Cek Status (Pelanggan)', description: 'Pencarian status cucian dengan nomor nota, nomor member, atau no. HP.' },
];

// Urutan menu di navbar
export const TAB_ORDER: AppTab[] = ['report', 'pos', 'orders', 'services', 'tracking', 'promos', 'settings'];

const isModule = (t: AppTab): t is ModuleTab => MODULE_DEFINITIONS.some((m) => m.id === t);

export const DEFAULT_SETTINGS: AppSettings = {
  enabledModules: { pos: true, orders: true, services: true, report: true, tracking: true },
  enabledRoles: { owner: true, kasir: true, kurir: true, pelanggan: true },
  permissions: ROLE_DEFINITIONS.reduce((acc, r) => {
    acc[r.id] = r.allowedTabs.filter(isModule);
    return acc;
  }, {} as Record<UserRole, ModuleTab[]>),
};

/** Gabungkan definisi role dengan pengaturan owner -> role aktif beserta menu yang boleh diakses. */
export const resolveRoles = (settings: AppSettings): RoleDefinition[] =>
  ROLE_DEFINITIONS.filter((r) => r.id === 'owner' || settings.enabledRoles[r.id]).flatMap((r) => {
    const modules = (settings.permissions[r.id] ?? []).filter((m) => settings.enabledModules[m]);
    const tabs: AppTab[] = r.id === 'owner' ? [...modules, 'promos', 'settings'] : modules;
    const allowedTabs = TAB_ORDER.filter((t) => tabs.includes(t));
    if (allowedTabs.length === 0) return [];
    return [{ ...r, allowedTabs, defaultTab: allowedTabs.includes(r.defaultTab) ? r.defaultTab : allowedTabs[0] }];
  });

export const INITIAL_SERVICES: LaundryService[] = [
  // Kiloan
  {
    id: 'srv-kilo-reg',
    name: 'Cuci Komplit Reguler',
    category: 'kiloan',
    unit: 'kg',
    price: 7000,
    estimatedHours: 48,
    iconName: 'Shirt',
    description: 'Cuci bersih, pewangi premium, pengeringan, & setrika rapi.',
    minWeight: 2,
  },
  {
    id: 'srv-kilo-exp',
    name: 'Cuci Komplit Express',
    category: 'express',
    unit: 'kg',
    price: 13000,
    estimatedHours: 8,
    iconName: 'Zap',
    description: 'Layanan kilat super cepat selesai dalam 8 jam.',
    minWeight: 2,
  },
  {
    id: 'srv-kilo-dry',
    name: 'Cuci Kering Lipat',
    category: 'kiloan',
    unit: 'kg',
    price: 5000,
    estimatedHours: 24,
    iconName: 'Wind',
    description: 'Cuci bersih, wangi, kering higienis, dilipat rapi tanpa setrika.',
    minWeight: 2,
  },
  {
    id: 'srv-kilo-iron',
    name: 'Setrika Uap Saja',
    category: 'kiloan',
    unit: 'kg',
    price: 4500,
    estimatedHours: 24,
    iconName: 'Sparkles',
    description: 'Setrika uap halus wangi dan rapi tahan lama.',
    minWeight: 2,
  },

  // Satuan
  {
    id: 'srv-bedcover-std',
    name: 'Bedcover Single / Queen',
    category: 'satuan',
    unit: 'pcs',
    price: 25000,
    estimatedHours: 48,
    iconName: 'Layers',
    description: 'Pencucian khusus selimut bedcover ukuran single & queen.',
  },
  {
    id: 'srv-bedcover-king',
    name: 'Bedcover King / Jumbo',
    category: 'satuan',
    unit: 'pcs',
    price: 35000,
    estimatedHours: 48,
    iconName: 'Layers',
    description: 'Pencucian bedcover ukuran ekstra besar king & super king.',
  },
  {
    id: 'srv-jas',
    name: 'Jas / Blazer Setelan',
    category: 'satuan',
    unit: 'pcs',
    price: 30000,
    estimatedHours: 48,
    iconName: 'Briefcase',
    description: 'Dry cleaning & pressing khusus jas formal/blazer.',
  },
  {
    id: 'srv-gamis',
    name: 'Gamis / Gaun Pesta',
    category: 'satuan',
    unit: 'pcs',
    price: 25000,
    estimatedHours: 48,
    iconName: 'Sparkles',
    description: 'Perawatan bahan lembut dan payet terawat sempurna.',
  },
  {
    id: 'srv-boneka',
    name: 'Boneka Sedang / Besar',
    category: 'satuan',
    unit: 'pcs',
    price: 20000,
    estimatedHours: 48,
    iconName: 'Smile',
    description: 'Cuci boneka anti kuman, wangi, dan bulu lembut kembali.',
  },

  // Sepatu & Karpet
  {
    id: 'srv-shoes-sneakers',
    name: 'Cuci Sepatu Sneakers',
    category: 'karpet_sepatu',
    unit: 'pasang',
    price: 25000,
    estimatedHours: 72,
    iconName: 'Footprints',
    description: 'Deep clean upper, midsole, outsole & insole sepatu sneakers.',
  },
  {
    id: 'srv-shoes-leather',
    name: 'Sepatu Kulit & Loafers',
    category: 'karpet_sepatu',
    unit: 'pasang',
    price: 35000,
    estimatedHours: 72,
    iconName: 'Footprints',
    description: 'Pembersihan khusus bahan kulit + leather conditioner polishing.',
  },
  {
    id: 'srv-karpet',
    name: 'Karpet Permadani (m²)',
    category: 'karpet_sepatu',
    unit: 'meter',
    price: 15000,
    estimatedHours: 72,
    iconName: 'Grid',
    description: 'Cuci karpet tuntas debu, tungau, wangi segar berseri.',
  },
  {
    id: 'srv-helm',
    name: 'Helm Full / Half Face',
    category: 'satuan',
    unit: 'pcs',
    price: 20000,
    estimatedHours: 24,
    iconName: 'Shield',
    description: 'Cuci busa dalam helm anti bakteri dan pewangi segar.',
  },
];

export const PERFUMES = [
  'Ocean Fresh (Segar Dingin)',
  'Akasia Floral (Best Seller)',
  'Lavender Dreams (Relaksasi)',
  'Downy Red Mist (Mewah Semerbak)',
  'Baby Cuddle (Lembut & Hangat)',
  'Tanpa Pewangi (Sensitif)',
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    memberCode: 'WSH-0001',
    name: 'Budi Santoso',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, RT 02/05',
    notes: 'Pakaian kantor, kerah jangan terlalu panas',
    totalOrders: 6,
    totalSpent: 215000,
    lastOrderDate: '2026-09-15',
  },
  {
    id: 'cust-2',
    memberCode: 'WSH-0002',
    name: 'Siti Rahmawati',
    phone: '085678912345',
    address: 'Perum Grand Asri Blok C-4',
    notes: 'Langganan cuci bedcover bulanan',
    totalOrders: 4,
    totalSpent: 160000,
    lastOrderDate: '2026-09-16',
  },
  {
    id: 'cust-3',
    memberCode: 'WSH-0003',
    name: 'Dimas Prasetyo',
    phone: '087812349876',
    address: 'Kos Graha Mahasiswa Kamar 102',
    notes: 'Suka parfum Akasia Floral',
    totalOrders: 9,
    totalSpent: 285000,
    lastOrderDate: '2026-09-17',
  },
  {
    id: 'cust-4',
    memberCode: 'WSH-0004',
    name: 'dr. Amanda Clarissa',
    phone: '081399887766',
    address: 'Jl. Pandanaran Raya No. 45',
    notes: 'Jas dokter dan blazer minta digantung plastik',
    totalOrders: 3,
    totalSpent: 145000,
    lastOrderDate: '2026-09-12',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'LD-2609-001',
    orderDate: '2026-09-17 09:30',
    estimatedReadyDate: '2026-09-19 12:00',
    customer: INITIAL_CUSTOMERS[0],
    items: [
      {
        cartItemId: 'item-1',
        serviceId: 'srv-kilo-reg',
        serviceName: 'Cuci Komplit Reguler',
        category: 'kiloan',
        unit: 'kg',
        unitPrice: 7000,
        quantity: 4.5,
        perfume: 'Akasia Floral (Best Seller)',
        notes: 'Ada 2 kemeja putih minta perhatian kerah',
        subtotal: 31500,
      },
    ],
    subtotal: 31500,
    discount: 0,
    tax: 0,
    finalAmount: 31500,
    paidAmount: 31500,
    changeAmount: 0,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    orderStatus: 'washing',
    perfume: 'Akasia Floral (Best Seller)',
    specialNotes: 'Dipisah cucian putih dan berwarna',
    cashierName: 'Kasir 1 - Maya',
  },
  {
    id: 'LD-2609-002',
    orderDate: '2026-09-17 11:15',
    estimatedReadyDate: '2026-09-17 19:30',
    customer: INITIAL_CUSTOMERS[1],
    items: [
      {
        cartItemId: 'item-2',
        serviceId: 'srv-bedcover-king',
        serviceName: 'Bedcover King / Jumbo',
        category: 'satuan',
        unit: 'pcs',
        unitPrice: 35000,
        quantity: 1,
        perfume: 'Lavender Dreams (Relaksasi)',
        notes: '',
        subtotal: 35000,
      },
      {
        cartItemId: 'item-3',
        serviceId: 'srv-shoes-sneakers',
        serviceName: 'Cuci Sepatu Sneakers',
        category: 'karpet_sepatu',
        unit: 'pasang',
        unitPrice: 25000,
        quantity: 1,
        perfume: 'Ocean Fresh (Segar Dingin)',
        notes: 'Sepatu putih Nike',
        subtotal: 25000,
      },
    ],
    subtotal: 60000,
    discount: 5000,
    tax: 0,
    finalAmount: 55000,
    paidAmount: 0,
    changeAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    orderStatus: 'queue',
    perfume: 'Lavender Dreams (Relaksasi)',
    specialNotes: 'Bayar tunai saat cucian diambil',
    cashierName: 'Kasir 1 - Maya',
  },
  {
    id: 'LD-2609-003',
    orderDate: '2026-09-16 14:20',
    estimatedReadyDate: '2026-09-17 14:00',
    customer: INITIAL_CUSTOMERS[2],
    items: [
      {
        cartItemId: 'item-4',
        serviceId: 'srv-kilo-exp',
        serviceName: 'Cuci Komplit Express',
        category: 'express',
        unit: 'kg',
        unitPrice: 13000,
        quantity: 3.0,
        perfume: 'Ocean Fresh (Segar Dingin)',
        notes: '',
        subtotal: 39000,
      },
    ],
    subtotal: 39000,
    discount: 0,
    tax: 0,
    finalAmount: 39000,
    paidAmount: 50000,
    changeAmount: 11000,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    orderStatus: 'ready',
    perfume: 'Ocean Fresh (Segar Dingin)',
    specialNotes: 'Bisa langsung diambil customer',
    cashierName: 'Kasir 2 - Rian',
  },
];
