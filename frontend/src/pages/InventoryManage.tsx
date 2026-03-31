import { useEffect, useState } from "react";
import { RefreshCw, Mic, MicOff, CheckCircle, AlertCircle, Search, Trash2 } from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import { LOW_STOCK_THRESHOLD } from "@/types/inventory";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";

export default function InventoryManage() {
  const { products, updateStock, deleteProduct, reloadFromBackend } = useInventory();
  const [editQty, setEditQty] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [quickText, setQuickText] = useState("");
  const [search, setSearch] = useState("");
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!transcript) return;
    setQuickText(transcript);
  }, [transcript]);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRowUpdate = (id: string, name: string) => {
    const val = editQty[id];
    if (val === undefined || val === "") return;
    const result = updateStock(id, parseInt(val));
    showFeedback(result.startsWith("✅") ? "success" : "error", result);
    setEditQty((prev) => ({ ...prev, [id]: "" }));
  };

  const parseQuickUpdate = async (text: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/voice-command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: text }),
      });

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        showFeedback("error", data.message || "Command could not be processed. Please try again.");
        return;
      }

      let msg: string = data.message;

      if (data.action === "LOW_STOCK" && Array.isArray(data.items) && data.items.length > 0) {
        const details = data.items
          .map((item: { product_name: string; current_stock: number }) => `${item.product_name} → ${item.current_stock}`)
          .join(", ");
        msg = `${data.message}: ${details}`;
      }

      if (data.product_name && typeof data.new_quantity === "number") {
        updateStock(data.product_name, data.new_quantity);
      }

      await reloadFromBackend();

      showFeedback("success", msg);
    } catch (error) {
      showFeedback("error", "Network error talking to the inventory service. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    void parseQuickUpdate(quickText);
    setQuickText("");
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
      setTimeout(() => {
        if (transcript) {
          void parseQuickUpdate(transcript);
          resetTranscript();
        }
      }, 400);
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.status === "error") {
        showFeedback("error", data.message || "Could not delete product.");
        return;
      }
      deleteProduct(id);
      showFeedback("success", data.message || `Deleted "${name}"`);
    } catch (err) {
      showFeedback("error", "Network error while deleting product.");
    }
  };

  const filtered = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Stock</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update quantities for your products.</p>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-medium ${
              feedback.type === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Update */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h2 className="mb-3 font-semibold text-card-foreground">⚡ Quick Update</h2>
        <p className="mb-3 text-xs text-muted-foreground">Type or say something like: "Update Mouse to 20"</p>
        <form onSubmit={handleQuickSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder='e.g. "Update Keyboard to 30"'
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {isSupported && (
            <button
              type="button"
              onClick={toggleMic}
              className={`shrink-0 rounded-lg p-2.5 transition-all ${
                isListening
                  ? "mic-pulse bg-accent text-accent-foreground"
                  : "border border-input bg-background text-muted-foreground hover:text-foreground"
              }`}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
          )}
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Working..." : "Go"}
          </button>
        </form>
        {isListening && (
          <p className="mt-2 text-xs text-accent animate-pulse">🎙️ Listening...</p>
        )}
        {transcript && !isListening && (
          <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs font-mono text-muted-foreground">
            Heard: "{transcript}"
          </p>
        )}
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="px-5 py-3 text-center font-medium text-muted-foreground">Stock</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">New Qty</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const isLow = p.quantity <= LOW_STOCK_THRESHOLD;
                return (
                  <tr key={p.id} className={`border-b border-border last:border-0 ${isLow ? "bg-destructive/5" : "hover:bg-muted/30"}`}>
                    <td className="px-5 py-3 font-medium text-card-foreground">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${isLow ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <input
                        type="number"
                        min="0"
                        placeholder="qty"
                        value={editQty[p.id] || ""}
                        onChange={(e) => setEditQty((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-center text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleRowUpdate(p.id, p.name)}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <RefreshCw className="h-3 w-3" /> Update
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
