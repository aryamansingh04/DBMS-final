import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, Package, ClipboardList, Mic } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/add-product", label: "Add Item", icon: PlusCircle },
  { to: "/products", label: "Products", icon: Package },
  { to: "/inventory", label: "Manage Stock", icon: ClipboardList },
  { to: "/voice", label: "Voice", icon: Mic },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">📦</span>
            <span className="hidden sm:inline">Inventory Manager</span>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-4 pb-2 sm:px-6">
          <div className="flex gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xs:inline sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
