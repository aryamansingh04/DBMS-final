import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CheckCircle } from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";

const CATEGORIES = ["Electronics", "Accessories", "Furniture", "Stationery", "Food & Drinks", "Clothing", "Other"];

const inputClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

export default function AddProduct() {
  const { reloadFromBackend } = useInventory();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || !quantity) return;
    setIsSubmitting(true);
    try {
      const command = `add ${parseInt(quantity, 10)} ${name.trim()}`;
      const res = await fetch(`${API_BASE_URL}/voice-command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();

      if (!res.ok || data.status === "error") {
        console.error("Backend add failed", data);
      }

      await reloadFromBackend();

      setSuccess(true);
      setName("");
      setCategory("");
      setQuantity("");
      setDescription("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error calling backend for add", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Item</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in the details to add a product to your inventory.</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-success"
          >
            <CheckCircle className="h-5 w-5" />
            Item added successfully! You can add another or view your inventory.
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-card-foreground">Product Name</label>
          <input type="text" placeholder="e.g. Wireless Mouse" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-card-foreground">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} required>
            <option value="">Choose a category...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-card-foreground">Quantity</label>
          <input type="number" placeholder="e.g. 50" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0" className={inputClass} required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-card-foreground">Description (optional)</label>
          <textarea placeholder="Short description of the product" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          <PlusCircle className="h-5 w-5" />
          {isSubmitting ? "Adding..." : "Add Item"}
        </button>
      </motion.form>

      <button
        onClick={() => navigate("/products")}
        className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        View All Products →
      </button>
    </div>
  );
}
