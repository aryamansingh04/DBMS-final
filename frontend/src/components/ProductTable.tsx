import { Product, LOW_STOCK_THRESHOLD } from "@/types/inventory";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-card-foreground">Products</h2>
      </div>
      {products.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-muted-foreground">
          No products yet. Add one above!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Qty</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = p.quantity <= LOW_STOCK_THRESHOLD;
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-border last:border-0 transition-colors ${isLow ? "low-stock-row" : "hover:bg-muted/30"}`}
                  >
                    <td className="px-6 py-3 font-medium text-card-foreground">{p.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-6 py-3 text-right font-mono text-card-foreground">{p.quantity}</td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isLow
                            ? "bg-destructive/15 text-destructive"
                            : "bg-success/15 text-success"
                        }`}
                      >
                        {isLow ? "Low" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => onDelete(p.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
