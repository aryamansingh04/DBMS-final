import { useState, useCallback } from "react";
import { Product } from "@/types/inventory";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AddProductForm } from "@/components/AddProductForm";
import { UpdateStockForm } from "@/components/UpdateStockForm";
import { ProductTable } from "@/components/ProductTable";
import { LowStockAlert } from "@/components/LowStockAlert";
import { StatsCards } from "@/components/StatsCards";
import { ToastNotification, Toast } from "@/components/ToastNotification";
import { Package } from "lucide-react";

const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Wireless Mouse", category: "Electronics", quantity: 45 },
  { id: "2", name: "USB-C Cable", category: "Accessories", quantity: 8 },
  { id: "3", name: "Desk Lamp", category: "Furniture", quantity: 3 },
  { id: "4", name: "Notebook A5", category: "Stationery", quantity: 120 },
];

function Dashboard() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleAdd = useCallback(
    (product: Omit<Product, "id">) => {
      setProducts((prev) => [...prev, { ...product, id: crypto.randomUUID() }]);
      showToast("success", `"${product.name}" added successfully`);
    },
    [showToast]
  );

  const handleUpdate = useCallback(
    (id: string, quantity: number) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, quantity } : p))
      );
      showToast("success", "Stock updated successfully");
    },
    [showToast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const product = products.find((p) => p.id === id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("success", `"${product?.name}" removed`);
    },
    [products, showToast]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Package className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Inventory</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <StatsCards products={products} />

        <LowStockAlert products={products} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <AddProductForm onAdd={handleAdd} />
            <UpdateStockForm products={products} onUpdate={handleUpdate} />
          </div>
          <div className="lg:col-span-2">
            <ProductTable products={products} onDelete={handleDelete} />
          </div>
        </div>
      </main>

      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function Index() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
