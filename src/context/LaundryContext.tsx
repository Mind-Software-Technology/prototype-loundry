'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LaundryService,
  Customer,
  Order,
  CartItem,
  OrderStatus,
  UnitType,
  PaymentStatus,
  PaymentMethod,
  UserRole,
  RoleDefinition,
  AppTab,
  AppSettings,
  Promo,
} from '@/types/laundry';
import { INITIAL_SERVICES, INITIAL_CUSTOMERS, INITIAL_ORDERS, DEFAULT_SETTINGS, resolveRoles } from '@/data/initialData';

interface LaundryContextType {
  // Role / Hak Akses (prototype only — akan dihilangkan di versi web asli,
  // digantikan sistem login sungguhan yang menentukan menu berdasarkan akun)
  currentRole: UserRole | null;
  selectRole: (role: UserRole) => void;
  switchRole: () => void;
  availableRoles: RoleDefinition[];

  // Pengaturan SaaS (menu aktif, role aktif, hak akses) — dikelola owner
  settings: AppSettings;
  updateSettings: (next: AppSettings) => void;
  resetSettings: () => void;

  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Master Services
  services: LaundryService[];
  addService: (service: Omit<LaundryService, 'id'>) => void;
  updateService: (id: string, service: Partial<LaundryService>) => void;
  deleteService: (id: string) => void;

  // Promo & Voucher (dikelola owner)
  promos: Promo[];
  addPromo: (promo: Omit<Promo, 'id'>) => void;
  updatePromo: (id: string, promo: Partial<Promo>) => void;
  deletePromo: (id: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'memberCode' | 'totalOrders' | 'totalSpent'>) => Customer;
  findCustomerById: (id: string) => Customer | undefined;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customer: Customer;
    items: CartItem[];
    discount: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    perfume: string;
    specialNotes?: string;
    estimatedReadyHours?: number;
    promoName?: string;
    promoDiscount?: number;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus, paidAmount?: number) => void;

  // Cart
  cart: CartItem[];
  addToCart: (service: LaundryService, quantity: number, notes?: string, perfume?: string) => void;
  addCustomItem: (item: {
    name: string;
    unit: UnitType;
    unitPrice: number;
    quantity: number;
    notes: string;
    perfume?: string;
  }) => void;
  updateCartItemQty: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;

  // Modal Cetak Struk
  receiptModalOrder: Order | null;
  openReceiptModal: (order: Order) => void;
  closeReceiptModal: () => void;

  // Quick stats
  todayStats: {
    revenue: number;
    activeQueue: number;
    readyForPickup: number;
    totalOrdersToday: number;
  };

  // Reset to initial data helper
  resetAllData: () => void;
}

const MEMBER_PREFIX = 'WSH-';

const nextMemberCode = (list: Customer[]): string => {
  const max = list.reduce((m, c) => {
    const n = c.memberCode?.startsWith(MEMBER_PREFIX) ? parseInt(c.memberCode.slice(MEMBER_PREFIX.length), 10) : 0;
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `${MEMBER_PREFIX}${String(max + 1).padStart(4, '0')}`;
};

// Data lama di localStorage belum punya nomor member: lengkapi secara berurutan.
const ensureMemberCodes = (list: Customer[]): Customer[] => {
  const result = [...list];
  for (let i = result.length - 1; i >= 0; i--) {
    if (!result[i].memberCode) {
      result[i] = { ...result[i], memberCode: nextMemberCode(result) };
    }
  }
  return result;
};

const LaundryContext = createContext<LaundryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SERVICES: 'laundry_pos_services_v1',
  CUSTOMERS: 'laundry_pos_customers_v1',
  ORDERS: 'laundry_pos_orders_v1',
  ROLE: 'laundry_pos_role_v1',
  SETTINGS: 'laundry_pos_settings_v1',
  PROMOS: 'laundry_pos_promos_v1',
};

export const LaundryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const availableRoles = resolveRoles(settings);
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [services, setServices] = useState<LaundryService[]>(INITIAL_SERVICES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedServices = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (savedServices) setServices(JSON.parse(savedServices));

      const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (savedCustomers) setCustomers(ensureMemberCodes(JSON.parse(savedCustomers)));

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedPromos = localStorage.getItem(STORAGE_KEYS.PROMOS);
      if (savedPromos) setPromos(JSON.parse(savedPromos));

      const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
      let loadedSettings = DEFAULT_SETTINGS;
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as Partial<AppSettings>;
        loadedSettings = {
          enabledModules: { ...DEFAULT_SETTINGS.enabledModules, ...parsed.enabledModules },
          enabledRoles: { ...DEFAULT_SETTINGS.enabledRoles, ...parsed.enabledRoles },
          permissions: { ...DEFAULT_SETTINGS.permissions, ...parsed.permissions },
        };
        setSettings(loadedSettings);
      }
      const roleDef = resolveRoles(loadedSettings).find((r) => r.id === savedRole);
      if (roleDef) {
        setCurrentRole(roleDef.id);
        setActiveTab(roleDef.defaultTab);
      }
    } catch (e) {
      console.error('Failed to load data from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {
      console.error('Error saving services', e);
    }
  }, [services, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error('Error saving customers', e);
    }
  }, [customers, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders', e);
    }
  }, [orders, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promos));
    } catch (e) {
      console.error('Error saving promos', e);
    }
  }, [promos, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }, [settings, isLoaded]);

  const updateSettings = (next: AppSettings) => setSettings(next);
  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  // Role / Hak Akses operations
  const selectRole = (role: UserRole) => {
    setCurrentRole(role);
    setActiveTab(availableRoles.find((r) => r.id === role)?.defaultTab ?? 'landing');
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
    } catch (e) {
      console.error('Error saving role', e);
    }
  };

  const switchRole = () => {
    setCurrentRole(null);
    setActiveTab('landing');
    try {
      localStorage.removeItem(STORAGE_KEYS.ROLE);
    } catch (e) {
      console.error('Error removing role', e);
    }
  };

  // Cart operations
  const addToCart = (
    service: LaundryService, 
    quantity: number, 
    notes?: string, 
    perfume?: string
  ) => {
    const validQty = Math.max(0.1, Number(quantity));
    const subtotal = Math.round(service.price * validQty);

    const existingIndex = cart.findIndex(
      (item) => item.serviceId === service.id && (item.notes || '') === (notes || '')
    );

    if (existingIndex > -1) {
      // update existing
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + validQty;
      updated[existingIndex].quantity = Number(newQty.toFixed(2));
      updated[existingIndex].subtotal = Math.round(updated[existingIndex].quantity * updated[existingIndex].unitPrice);
      if (perfume) updated[existingIndex].perfume = perfume;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        serviceId: service.id,
        serviceName: service.name,
        category: service.category,
        unit: service.unit,
        unitPrice: service.price,
        quantity: Number(validQty.toFixed(2)),
        perfume: perfume || 'Akasia Floral (Best Seller)',
        notes: notes || '',
        subtotal: subtotal,
      };
      setCart([...cart, newItem]);
    }
  };

  // Layanan di luar daftar resmi: selalu baris baru (tidak digabung), tidak masuk master layanan
  const addCustomItem: LaundryContextType['addCustomItem'] = ({ name, unit, unitPrice, quantity, notes, perfume }) => {
    const qty = Number(Math.max(0.1, quantity).toFixed(2));
    const newItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      serviceId: 'custom',
      serviceName: name.trim(),
      category: 'satuan',
      unit,
      unitPrice,
      quantity: qty,
      perfume: perfume || 'Akasia Floral (Best Seller)',
      notes: notes.trim(),
      subtotal: Math.round(unitPrice * qty),
      isCustom: true,
    };
    setCart((prev) => [...prev, newItem]);
  };

  const updateCartItemQty = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(
      cart.map((item) => {
        if (item.cartItemId === cartItemId) {
          const qty = Number(newQty.toFixed(2));
          return {
            ...item,
            quantity: qty,
            subtotal: Math.round(item.unitPrice * qty),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Customer operations
  const addCustomer = (customerData: Omit<Customer, 'id' | 'memberCode' | 'totalOrders' | 'totalSpent'>): Customer => {
    // Check if phone already exists
    const existing = customers.find((c) => c.phone.trim() === customerData.phone.trim());
    if (existing) {
      return existing;
    }

    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      memberCode: nextMemberCode(customers),
      totalOrders: 0,
      totalSpent: 0,
    };

    setCustomers([newCustomer, ...customers]);
    return newCustomer;
  };

  const findCustomerById = (id: string) => customers.find((c) => c.id === id);

  // Promo operations
  const addPromo = (promoData: Omit<Promo, 'id'>) => {
    setPromos((prev) => [...prev, { ...promoData, id: `promo-${Date.now()}` }]);
  };

  const updatePromo = (id: string, fields: Partial<Promo>) => {
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));
  };

  const deletePromo = (id: string) => {
    setPromos((prev) => prev.filter((p) => p.id !== id));
  };

  // Service operations
  const addService = (serviceData: Omit<LaundryService, 'id'>) => {
    const newService: LaundryService = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    setServices([...services, newService]);
  };

  const updateService = (id: string, updatedFields: Partial<LaundryService>) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  // Order operations
  const createOrder = (orderData: {
    customer: Customer;
    items: CartItem[];
    discount: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    perfume: string;
    specialNotes?: string;
    estimatedReadyHours?: number;
    promoName?: string;
    promoDiscount?: number;
  }): Order => {
    const now = new Date();
    const orderDateStr = now.toISOString().replace('T', ' ').substring(0, 16);

    // Calculate ready date based on estimated hours (default 48h)
    const hoursToAdd = orderData.estimatedReadyHours || 48;
    const readyDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
    const estimatedReadyDateStr = readyDate.toISOString().replace('T', ' ').substring(0, 16);

    const subtotal = orderData.items.reduce((acc, it) => acc + it.subtotal, 0);
    const finalAmount = Math.max(0, subtotal - (orderData.discount || 0));
    const paidAmount = orderData.paidAmount || 0;
    const changeAmount = Math.max(0, paidAmount - finalAmount);

    // Generate Order ID: LD-YYMM-XXX
    const yearMonth = `${now.getFullYear().toString().substring(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const orderCountThisMonth = orders.filter((o) => o.id.startsWith(`LD-${yearMonth}`)).length + 1;
    const orderId = `LD-${yearMonth}-${String(orderCountThisMonth).padStart(3, '0')}`;

    const newOrder: Order = {
      id: orderId,
      orderDate: orderDateStr,
      estimatedReadyDate: estimatedReadyDateStr,
      customer: orderData.customer,
      items: orderData.items,
      subtotal,
      discount: orderData.discount || 0,
      tax: 0,
      finalAmount,
      paidAmount,
      changeAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus,
      orderStatus: 'queue',
      perfume: orderData.perfume,
      specialNotes: orderData.specialNotes || '',
      cashierName: 'Kasir - LaundryCare',
      ...(orderData.promoName ? { promoName: orderData.promoName, promoDiscount: orderData.promoDiscount || 0 } : {}),
    };

    // Update customer stats
    setCustomers((prevCusts) =>
      prevCusts.map((c) => {
        if (c.id === orderData.customer.id) {
          return {
            ...c,
            totalOrders: (c.totalOrders || 0) + 1,
            totalSpent: (c.totalSpent || 0) + finalAmount,
            lastOrderDate: orderDateStr.split(' ')[0],
          };
        }
        return c;
      })
    );

    // Add to orders list at front
    setOrders([newOrder, ...orders]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            orderStatus: status,
            completedAt: status === 'completed' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : o.completedAt,
          };
        }
        return o;
      })
    );
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: PaymentStatus, paidAmount?: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newPaidAmount = paidAmount !== undefined ? paidAmount : o.finalAmount;
          return {
            ...o,
            paymentStatus,
            paidAmount: newPaidAmount,
            changeAmount: Math.max(0, newPaidAmount - o.finalAmount),
          };
        }
        return o;
      })
    );
  };

  // Receipt Modal
  const openReceiptModal = (order: Order) => setReceiptModalOrder(order);
  const closeReceiptModal = () => setReceiptModalOrder(null);

  // Quick stats calculations
  const todayDatePrefix = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.orderDate.startsWith(todayDatePrefix));
  const todayRevenue = todayOrders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.finalAmount : o.paidAmount), 0);
  const activeQueue = orders.filter((o) => !['completed', 'cancelled'].includes(o.orderStatus)).length;
  const readyForPickup = orders.filter((o) => o.orderStatus === 'ready').length;

  const resetAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.SERVICES);
      localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
    }
    setServices(INITIAL_SERVICES);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setCart([]);
  };

  return (
    <LaundryContext.Provider
      value={{
        currentRole,
        selectRole,
        switchRole,
        availableRoles,
        settings,
        updateSettings,
        resetSettings,
        activeTab,
        setActiveTab,
        services,
        addService,
        updateService,
        deleteService,
        promos,
        addPromo,
        updatePromo,
        deletePromo,
        customers,
        addCustomer,
        findCustomerById,
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        cart,
        addToCart,
        addCustomItem,
        updateCartItemQty,
        removeFromCart,
        clearCart,
        cartSubtotal,
        receiptModalOrder,
        openReceiptModal,
        closeReceiptModal,
        todayStats: {
          revenue: todayRevenue,
          activeQueue,
          readyForPickup,
          totalOrdersToday: todayOrders.length,
        },
        resetAllData,
      }}
    >
      {children}
    </LaundryContext.Provider>
  );
};

export const useLaundry = () => {
  const context = useContext(LaundryContext);
  if (!context) {
    throw new Error('useLaundry must be used within a LaundryProvider');
  }
  return context;
};
