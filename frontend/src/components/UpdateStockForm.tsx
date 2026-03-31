import { useState } from "react";
import { Product } from "@/types/inventory";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface UpdateStockFormProps {
  products: Product[];
  onUpdate: (id: string, quantity: number) => void;
}

export function UpdateStockForm({ products, onUpdate }: UpdateStockFormProps) {
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !quantity) return;
    onUpdate(selectedId, parseInt(quantity));
    setSelectedId("");
    setQuantity("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">Update Stock</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (qty: {p.quantity})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="New quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" /> Update Stock
        </button>
      </form>
    </motion.div>
  );
}
