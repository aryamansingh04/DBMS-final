import { CheckCircle, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
              t.type === "success"
                ? "border-success/30 bg-card text-success"
                : "border-destructive/30 bg-card text-destructive"
            }`}
          >
            {t.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span className="text-sm font-medium">{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="ml-2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
