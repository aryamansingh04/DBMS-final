import { Package, TrendingDown, Layers, BarChart3 } from "lucide-react";
import { Product, LOW_STOCK_THRESHOLD } from "@/types/inventory";
import { motion } from "framer-motion";

interface StatsCardsProps {
  products: Product[];
}

export function StatsCards({ products }: StatsCardsProps) {
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockCount = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD).length;
  const categories = new Set(products.map((p) => p.category)).size;

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, color: "text-primary" },
    { label: "Total Stock", value: totalStock, icon: BarChart3, color: "text-accent" },
    { label: "Low Stock", value: lowStockCount, icon: TrendingDown, color: "text-destructive" },
    { label: "Categories", value: categories, icon: Layers, color: "text-success" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <s.icon className={`h-5 w-5 ${s.color}`} />
          </div>
          <p className="mt-3 text-2xl font-bold text-card-foreground">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
