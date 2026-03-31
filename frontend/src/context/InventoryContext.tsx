import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { Product, LOW_STOCK_THRESHOLD } from "@/types/inventory";
import { API_BASE_URL } from "@/lib/config";

export interface ActivityEntry {
  id: string;
  message: string;
  time: Date;
}

interface InventoryContextType {
  products: Product[];
  activities: ActivityEntry[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateStock: (nameOrId: string, newQuantity: number) => string;
  adjustStock: (nameOrId: string, delta: number) => string;
  deleteProduct: (id: string) => void;
  reloadFromBackend: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([
    { id: "a1", message: "System started", time: new Date() },
  ]);

  const addActivity = (message: string) => {
    setActivities((prev) => [{ id: crypto.randomUUID(), message, time: new Date() }, ...prev].slice(0, 20));
  };

  const reloadFromBackend = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      const data = await res.json();
      if (res.ok && data.status === "success" && Array.isArray(data.products)) {
        const mapped: Product[] = data.products.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          category: p.category || "Stationery",
          quantity: Number(p.quantity ?? 0),
        }));
        setProducts(mapped);
        addActivity("Loaded products from database");
      } else {
        console.error("Failed to load products", data);
      }
    } catch (err) {
      console.error("Error loading products", err);
    }
  }, []);

  useEffect(() => {
    void reloadFromBackend();
  }, [reloadFromBackend]);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...product, id: crypto.randomUUID() }]);
    addActivity(`Added "${product.name}" (${product.quantity} units)`);
  }, []);

  const findProduct = (nameOrId: string) => {
    const search = nameOrId.toLowerCase().trim();
    return (p: Product) => p.id === nameOrId || p.name.toLowerCase() === search;
  };

  const updateStock = useCallback((nameOrId: string, newQuantity: number): string => {
    const matcher = findProduct(nameOrId);
    let resultMsg = "Product not found. Please check the name and try again.";

    setProducts((prev) =>
      prev.map((p) => {
        if (matcher(p)) {
          resultMsg = `✅ ${p.name}: quantity set to ${newQuantity}`;
          return { ...p, quantity: Math.max(0, newQuantity) };
        }
        return p;
      })
    );

    if (!resultMsg.startsWith("Product")) addActivity(resultMsg);
    return resultMsg;
  }, []);

  const adjustStock = useCallback((nameOrId: string, delta: number): string => {
    const matcher = findProduct(nameOrId);
    let resultMsg = "Product not found. Please check the name and try again.";

    setProducts((prev) =>
      prev.map((p) => {
        if (matcher(p)) {
          const newQty = Math.max(0, p.quantity + delta);
          resultMsg = `✅ ${p.name}: ${p.quantity} → ${newQty}`;
          return { ...p, quantity: newQty };
        }
        return p;
      })
    );

    if (!resultMsg.startsWith("Product")) addActivity(resultMsg);
    return resultMsg;
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p) addActivity(`Removed "${p.name}"`);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  return (
    <InventoryContext.Provider value={{ products, activities, addProduct, updateStock, adjustStock, deleteProduct, reloadFromBackend }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
