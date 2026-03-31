import { useState } from "react";
import { Product } from "@/types/inventory";
import { Mic, MicOff, Plus } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { motion } from "framer-motion";

interface AddProductFormProps {
  onAdd: (product: Omit<Product, "id">) => void;
}

export function AddProductForm({ onAdd }: AddProductFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !quantity) return;
    onAdd({ name, category, quantity: parseInt(quantity) });
    setName("");
    setCategory("");
    setQuantity("");
  };

  const applyTranscript = () => {
    if (transcript) {
      setName(transcript);
      resetTranscript();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
      setTimeout(applyTranscript, 300);
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              aria-label={isListening ? "Stop recording" : "Start recording"}
            >
              {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
          )}
        </div>

        {transcript && (
          <p className="rounded-md bg-accent/10 px-3 py-2 text-sm font-mono text-accent">
            🎙️ "{transcript}"
          </p>
        )}

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </form>
    </motion.div>
  );
}
