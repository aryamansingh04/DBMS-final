import { useState, useMemo } from "react";
import { Search, Package } from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import { LOW_STOCK_THRESHOLD } from "@/types/inventory";
import { motion } from "framer-motion";

export default function Products() {
  const { products } = useInventory();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category))).sort()], [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (filterCat !== "All") list = list.filter((p) => p.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return list;
  }, [products, search, filterCat]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((p) => {
      const arr = map.get(p.category) || [];
      arr.push(p);
      map.set(p.category, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse your products by category.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Grouped Cards */}
      {grouped.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No products found.</p>
        </div>
      ) : (
        grouped.map(([category, items], ci) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.05 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="border-b border-border bg-muted/40 px-5 py-3">
              <h2 className="font-semibold text-card-foreground">{category}</h2>
              <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="divide-y divide-border">
              {items.map((p) => {
                const isLow = p.quantity <= LOW_STOCK_THRESHOLD;
                return (
                  <div key={p.id} className={`flex items-center justify-between px-5 py-3 ${isLow ? "bg-destructive/5" : ""}`}>
                    <div className="min-w-0">
                      <p className="font-medium text-card-foreground truncate">{p.name}</p>
                      {p.description && <p className="text-xs text-muted-foreground truncate">{p.description}</p>}
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isLow ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                        }`}
                      >
                        {p.quantity} in stock
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
