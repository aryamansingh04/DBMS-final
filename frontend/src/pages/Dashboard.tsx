import { Link } from "react-router-dom";
import { Package, AlertTriangle, Clock, PlusCircle, List, Mic } from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import { LOW_STOCK_THRESHOLD } from "@/types/inventory";
import { motion } from "framer-motion";

const card = "rounded-xl border border-border bg-card p-5 sm:p-6";
const fadeUp = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

export default function Dashboard() {
  const { products, activities } = useInventory();
  const lowStock = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, accent: "bg-primary/10 text-primary" },
    { label: "Low Stock Items", value: lowStock.length, icon: AlertTriangle, accent: "bg-destructive/10 text-destructive" },
    { label: "Recent Activity", value: activities.length, icon: Clock, accent: "bg-accent/10 text-accent" },
  ];

  const shortcuts = [
    { to: "/add-product", label: "Add New Item", icon: PlusCircle, desc: "Add a new product to your inventory" },
    { to: "/products", label: "View Products", icon: List, desc: "Browse all products by category" },
    { to: "/voice", label: "Voice Command", icon: Mic, desc: "Update stock using your voice" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Welcome to Inventory Manager 👋</h1>
        <p className="mt-1 text-muted-foreground">Here's a quick look at your inventory today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} {...fadeUp(i + 1)} className={card}>
            <div className={`inline-flex rounded-lg p-2.5 ${s.accent}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold text-card-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <motion.div {...fadeUp(4)} className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-semibold">Low Stock Alert</h2>
          </div>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-card-foreground">{p.name}</span>
                <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                  {p.quantity} left
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Shortcuts */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {shortcuts.map((s, i) => (
            <motion.div key={s.to} {...fadeUp(i + 5)}>
              <Link
                to={s.to}
                className={`${card} flex items-center gap-4 transition-all hover:border-primary/40 hover:shadow-md group`}
              >
                <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div {...fadeUp(8)} className={card}>
        <h2 className="mb-3 text-lg font-semibold text-card-foreground">Recent Activity</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <ul className="space-y-2">
            {activities.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-start gap-2 text-sm">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-card-foreground">{a.message}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
