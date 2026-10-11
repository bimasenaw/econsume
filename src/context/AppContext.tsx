'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ProductData,
  InventoryItem,
  ShoppingListItem,
  UserProfile,
  INITIAL_USER,
  INITIAL_INVENTORY,
  SEED_PRODUCTS,
} from '@/data/seedData';
import { predictConsumption, PredictionResultItem } from '@/lib/algorithms';

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  shoppingList: ShoppingListItem[];
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
  predictions: PredictionResultItem[];
  addToInventory: (product: ProductData, quantity?: number, expiryDate?: string, location?: string) => void;
  removeFromInventory: (id: string) => void;
  addToShoppingList: (product: ProductData, quantity?: number, isAiRecommended?: boolean) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  generateShoppingListFromPredictions: () => void;
  addGreenPoints: (points: number, reason: string) => void;
  recordWaste: (productName: string, quantity: string, reason: string) => void;
  compareList: ProductData[];
  addToCompare: (product: ProductData) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
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
    }
  ]);
  const [compareList, setCompareList] = useState<ProductData[]>([]);

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('ecoconsume_user');
      const savedInv = localStorage.getItem('ecoconsume_inventory');
      const savedShop = localStorage.getItem('ecoconsume_shopping');

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedInv) setInventory(JSON.parse(savedInv));
      if (savedShop) setShoppingList(JSON.parse(savedShop));
    } catch {
      // ignore
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecoconsume_inventory', JSON.stringify(inventory));
    } catch {
      // ignore
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('ecoconsume_shopping', JSON.stringify(shoppingList));
    } catch {
      // ignore
    }
  }, [shoppingList]);

  const predictions = predictConsumption({
    userId: user.id,
    householdSize: user.householdSize,
    items: inventory.map((inv) => ({
      productId: inv.productId,
      currentQuantity: inv.quantity,
      lastPurchasedAt: inv.purchasedAt,
      avgDailyConsumption: inv.avgDailyConsumption,
    })),
  });

  const addToInventory = (
    product: ProductData,
    quantity = 1,
    expiryDate?: string,
    location = 'Pantry'
  ) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const exp =
      expiryDate ||
      new Date(Date.now() + (product.avgLifespanDays || 14) * 86400000)
        .toISOString()
        .split('T')[0];

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      userId: user.id,
      productId: product.id,
      product,
      quantity,
      unit: product.unit.split(' ')[0] || 'pcs',
      expiryDate: exp,
      purchasedAt: nowStr,
      location: location as any,
      avgDailyConsumption: Number((quantity / (product.avgLifespanDays || 14)).toFixed(3)),
    };

    setInventory((prev) => [newItem, ...prev]);
  };

  const removeFromInventory = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const addToShoppingList = (
    product: ProductData,
    quantity = 1,
    isAiRecommended = false
  ) => {
    const exists = shoppingList.find((item) => item.productId === product.id);
    if (exists) {
      setShoppingList((prev) =>
        prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
      return;
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

    setShoppingList((prev) => [newItem, ...prev]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  const generateShoppingListFromPredictions = () => {
    const lowStockItems = predictions.filter((p) => p.daysRemaining <= 5);

    lowStockItems.forEach((pred) => {
      // Look for greener alternative if current product has low ecoScore
      let chosenProduct = pred.product;
      if (chosenProduct.ecoScore < 80) {
        const greener = SEED_PRODUCTS.find(
          (p) => p.category === chosenProduct.category && p.ecoScore >= 80
        );
        if (greener) chosenProduct = greener;
      }

      // Check if already in shopping list
      const inList = shoppingList.some((s) => s.productId === chosenProduct.id);
      if (!inList) {
        addToShoppingList(chosenProduct, 1, true);
      }
    });
  };

  const addGreenPoints = (points: number, _reason: string) => {
    setUser((prev) => {
      const updated = { ...prev, greenPoints: prev.greenPoints + points };
      try {
        localStorage.setItem('ecoconsume_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const recordWaste = (_productName: string, _quantity: string, _reason: string) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        wasteScore: Math.min(100, Number((prev.wasteScore + 1.5).toFixed(1))),
      };
      try {
        localStorage.setItem('ecoconsume_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addToCompare = (product: ProductData) => {
    if (compareList.length >= 3) {
      alert('Maksimal membandingkan 3 produk sekaligus');
      return;
    }
    if (!compareList.some((p) => p.id === product.id)) {
      setCompareList([...compareList, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        inventory,
        setInventory,
        shoppingList,
        setShoppingList,
        predictions,
        addToInventory,
        removeFromInventory,
        addToShoppingList,
        toggleShoppingItem,
        removeShoppingItem,
        generateShoppingListFromPredictions,
        addGreenPoints,
        recordWaste,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
