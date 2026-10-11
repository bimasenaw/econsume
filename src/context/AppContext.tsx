'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ProductData,
  InventoryItem,
  ShoppingListItem,
  UserProfile,
  INITIAL_USER,
  INITIAL_INVENTORY,
  INITIAL_WASTE_LOGS,
  INITIAL_PURCHASES,
} from '@/data/seedData';
import {
  estimateConsumption,
  buildPredictions,
  summarizeWaste,
  type PurchaseLog,
  type WasteLogEntry,
  type ConsumptionEstimate,
  type PredictionItem,
  type WasteSummary,
} from '@/lib/tracking';

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  shoppingList: ShoppingListItem[];
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
  purchaseLogs: PurchaseLog[];
  wasteLogs: WasteLogEntry[];
  estimates: ConsumptionEstimate[];
  predictions: PredictionItem[];
  wasteSummary: WasteSummary;
  addToInventory: (product: ProductData, quantity?: number, expiryDate?: string, location?: InventoryItem['location']) => void;
  removeFromInventory: (id: string) => void;
  updateInventoryItem: (
    id: string,
    patch: {
      name?: string;
      location?: InventoryItem['location'];
      quantity?: number;
      unit?: string;
      expiryDate?: string;
    }
  ) => void;
  addToShoppingList: (product: ProductData, quantity?: number, isAiRecommended?: boolean) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  generateShoppingListFromPredictions: () => void;
  addPurchaseLog: (log: Omit<PurchaseLog, 'id'>) => void;
  removePurchaseLog: (id: string) => void;
  addWasteLog: (log: Omit<WasteLogEntry, 'id'>) => void;
  removeWasteLog: (id: string) => void;
  addGreenPoints: (points: number, reason: string) => void;
  compareList: ProductData[];
  addToCompare: (product: ProductData) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLog[]>(INITIAL_PURCHASES);
  const [wasteLogs, setWasteLogs] = useState<WasteLogEntry[]>(INITIAL_WASTE_LOGS);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([
    {
      id: 'shop-01',
      productId: 'prod-01',
      name: 'Beras Organik Pandan Wangi 5kg',
      brand: 'Nusantara Organik',
      category: 'Makanan & Minuman',
      quantity: 1,
      unit: 'sak (5kg)',
      estimatedPrice: 95000,
      isAiRecommended: true,
      priority: 'high',
      ecoScore: 92,
      grade: 'A',
      checked: false,
      carbonSavedKg: 2.6,
    },
    {
      id: 'shop-02',
      productId: 'prod-07',
      name: 'Deterjen Ramah Lingkungan Konsentrat Lerak 1L',
      brand: 'BumiBersih Lab',
      category: 'Pembersih Rumah',
      quantity: 1,
      unit: 'botol (1L)',
      estimatedPrice: 45000,
      isAiRecommended: true,
      priority: 'high',
      ecoScore: 94,
      grade: 'A',
      checked: false,
      carbonSavedKg: 5.8,
    },
    {
      id: 'shop-03',
      productId: 'prod-03',
      name: 'Minyak Goreng Kelapa Cold-Pressed 1L',
      brand: 'CocoNusa Eco',
      category: 'Makanan & Minuman',
      quantity: 1,
      unit: 'botol (1L)',
      estimatedPrice: 38000,
      isAiRecommended: true,
      priority: 'medium',
      ecoScore: 89,
      grade: 'A',
      checked: true,
      carbonSavedKg: 3.8,
    },
  ]);
  const [compareList, setCompareList] = useState<ProductData[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    setUser(load('ecoconsume_user', INITIAL_USER));
    setInventory(load('ecoconsume_inventory', INITIAL_INVENTORY));
    setShoppingList(load('ecoconsume_shopping', [
      {
        id: 'shop-01',
        productId: 'prod-01',
        name: 'Beras Organik Pandan Wangi 5kg',
        brand: 'Nusantara Organik',
        category: 'Makanan & Minuman',
        quantity: 1,
        unit: 'sak (5kg)',
        estimatedPrice: 95000,
        isAiRecommended: true,
        priority: 'high',
        ecoScore: 92,
        grade: 'A',
        checked: false,
        carbonSavedKg: 2.6,
      },
    ]));
    setPurchaseLogs(load('ecoconsume_purchases', INITIAL_PURCHASES));
    setWasteLogs(load('ecoconsume_waste', INITIAL_WASTE_LOGS));
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem('ecoconsume_inventory', JSON.stringify(inventory));
    } catch {}
  }, [inventory]);
  useEffect(() => {
    try {
      localStorage.setItem('ecoconsume_shopping', JSON.stringify(shoppingList));
    } catch {}
  }, [shoppingList]);
  useEffect(() => {
    try {
      localStorage.setItem('ecoconsume_purchases', JSON.stringify(purchaseLogs));
    } catch {}
  }, [purchaseLogs]);
  useEffect(() => {
    try {
      localStorage.setItem('ecoconsume_waste', JSON.stringify(wasteLogs));
    } catch {}
  }, [wasteLogs]);

  // Empirical derivations
  const estimates = useMemo(() => estimateConsumption(purchaseLogs), [purchaseLogs]);
  const predictions = useMemo(() => buildPredictions(inventory, estimates), [inventory, estimates]);
  const wasteSummary = useMemo(
    () => summarizeWaste(wasteLogs, user.householdSize),
    [wasteLogs, user.householdSize]
  );

  const addToInventory = useCallback(
    (product: ProductData, quantity = 1, expiryDate?: string, location: InventoryItem['location'] = 'Pantry') => {
      const nowStr = new Date().toISOString().split('T')[0];
      const exp =
        expiryDate ||
        new Date(Date.now() + (product.avgLifespanDays || 14) * 86400000).toISOString().split('T')[0];

      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        userId: user.id,
        productId: product.id,
        product,
        quantity,
        unit: product.unit.split(' ')[0] || 'pcs',
        expiryDate: exp,
        purchasedAt: nowStr,
        location,
        avgDailyConsumption: 0,
      };
      setInventory((prev) => [newItem, ...prev]);
    },
    [user.id]
  );

  const removeFromInventory = useCallback((id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateInventoryItem = useCallback(
    (
      id: string,
      patch: {
        name?: string;
        location?: InventoryItem['location'];
        quantity?: number;
        unit?: string;
        expiryDate?: string;
      }
    ) => {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            quantity: patch.quantity ?? item.quantity,
            unit: patch.unit ?? item.unit,
            expiryDate: patch.expiryDate ?? item.expiryDate,
            location: patch.location ?? item.location,
            product: {
              ...item.product,
              name: patch.name ?? item.product.name,
            },
          };
        })
      );
    },
    []
  );

  const addToShoppingList = useCallback(
    (product: ProductData, quantity = 1, isAiRecommended = false) => {
      setShoppingList((prev) => {
        const exists = prev.find((item) => item.productId === product.id);
        if (exists) {
          return prev.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        const newItem: ShoppingListItem = {
          id: `shop-${Date.now()}`,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          quantity,
          unit: product.unit,
          estimatedPrice: product.price * quantity,
          isAiRecommended,
          priority: product.ecoScore >= 80 ? 'high' : 'medium',
          ecoScore: product.ecoScore,
          grade: product.grade,
          checked: false,
          carbonSavedKg: Number(((4.0 - product.co2PerUnitKg) * quantity).toFixed(1)),
        };
        return [newItem, ...prev];
      });
    },
    []
  );

  const toggleShoppingItem = useCallback((id: string) => {
    setShoppingList((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  }, []);

  const removeShoppingItem = useCallback((id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const generateShoppingListFromPredictions = useCallback(() => {
    const lowStockItems = predictions.filter((p) => p.sufficient && p.daysRemaining !== null && p.daysRemaining <= 5);
    lowStockItems.forEach((pred) => addToShoppingList(pred.product, 1, true));
  }, [predictions, addToShoppingList]);

  const addPurchaseLog = useCallback((log: Omit<PurchaseLog, 'id'>) => {
    setPurchaseLogs((prev) => [{ ...log, id: `p-${Date.now()}` }, ...prev]);
  }, []);
  const removePurchaseLog = useCallback((id: string) => {
    setPurchaseLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);
  const addWasteLog = useCallback((log: Omit<WasteLogEntry, 'id'>) => {
    setWasteLogs((prev) => [{ ...log, id: `w-${Date.now()}` }, ...prev]);
  }, []);
  const removeWasteLog = useCallback((id: string) => {
    setWasteLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addGreenPoints = useCallback((points: number, _reason: string) => {
    setUser((prev) => {
      const updated = { ...prev, greenPoints: prev.greenPoints + points };
      try {
        localStorage.setItem('ecoconsume_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const addToCompare = useCallback(
    (product: ProductData) => {
      setCompareList((prev) => {
        if (prev.length >= 3 || prev.some((p) => p.id === product.id)) return prev;
        return [...prev, product];
      });
    },
    []
  );
  const removeFromCompare = useCallback((productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  }, []);
  const clearCompare = useCallback(() => setCompareList([]), []);

  const value: AppContextType = {
    user,
    setUser,
    inventory,
    setInventory,
    shoppingList,
    setShoppingList,
    purchaseLogs,
    wasteLogs,
    estimates,
    predictions,
    wasteSummary,
    addToInventory,
    removeFromInventory,
    updateInventoryItem,
    addToShoppingList,
    toggleShoppingItem,
    removeShoppingItem,
    generateShoppingListFromPredictions,
    addPurchaseLog,
    removePurchaseLog,
    addWasteLog,
    removeWasteLog,
    addGreenPoints,
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
