import { Product, LOW_STOCK_THRESHOLD } from "@/types/inventory";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStockItems = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);

  if (lowStockItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-5"
    >
      <div className="mb-3 flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Low Stock Alert</h2>
      </div>
      <ul className="space-y-1.5">
        {lowStockItems.map((p) => (
          <li key={p.id} className="flex items-center justify-between text-sm">
            <span className="font-medium text-card-foreground">{p.name}</span>
            <span className="font-mono text-destructive">{p.quantity} left</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
