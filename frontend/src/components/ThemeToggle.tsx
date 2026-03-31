import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className="rounded-lg border border-border bg-card p-2.5 text-foreground transition-colors hover:bg-secondary"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </motion.button>
  );
}
