import { useEffect, useState } from "react";
import { Mic, MicOff, CheckCircle, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";

export default function VoiceCommand() {
  const MIN_LISTEN_MS = 5000;
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lastCommand, setLastCommand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listenStartedAt, setListenStartedAt] = useState<number | null>(null);
  const [shouldProcessOnEnd, setShouldProcessOnEnd] = useState(false);

  const processCommand = async (text: string) => {
    setLastCommand(text);
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/voice-command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: text }),
      });

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        setResult({
          type: "error",
          message: data.message || "Command could not be processed. Please try again.",
        });
        return;
      }

      let message: string = data.message;

      if (data.action === "LOW_STOCK" && Array.isArray(data.items) && data.items.length > 0) {
        const details = data.items
          .map((item: { product_name: string; current_stock: number }) => `${item.product_name} → ${item.current_stock}`)
          .join(", ");
        message = `${data.message}: ${details}`;
      }

      setResult({
        type: "success",
        message,
      });
    } catch (error) {
      setResult({
        type: "error",
        message: "Network error talking to the inventory service. Is the backend running?",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      if (listenStartedAt && Date.now() - listenStartedAt < MIN_LISTEN_MS) {
        setResult({
          type: "error",
          message: "Please keep speaking. Listening stays active for at least 5 seconds.",
        });
        return;
      }

      stopListening();
    } else {
      resetTranscript();
      setResult(null);
      setLastCommand("");
      setListenStartedAt(Date.now());
      setShouldProcessOnEnd(true);
      startListening(MIN_LISTEN_MS);
    }
  };

  useEffect(() => {
    if (!shouldProcessOnEnd || isListening || isSubmitting) return;
    if (!transcript) {
      setShouldProcessOnEnd(false);
      return;
    }
    void processCommand(transcript);
    resetTranscript();
    setShouldProcessOnEnd(false);
  }, [isListening, isSubmitting, transcript, shouldProcessOnEnd, resetTranscript]);

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Voice Command</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tap the microphone and speak to update your stock.</p>
      </div>

      {!isSupported ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Voice input is not supported in this browser. Try Chrome or Edge.
        </div>
      ) : (
        <>
          {/* Mic Button */}
          <motion.button
            onClick={toggleMic}
            whileTap={{ scale: 0.95 }}
            className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full transition-all ${
              isListening || isSubmitting
                ? "mic-pulse bg-accent text-accent-foreground shadow-lg"
                : "border-2 border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
            }`}
            aria-label={isListening ? "Stop listening" : "Start voice command"}
            disabled={isSubmitting}
          >
            {isListening ? <Mic className="h-10 w-10" /> : <MicOff className="h-10 w-10" />}
          </motion.button>

          <p className={`text-sm font-medium ${isListening ? "text-accent animate-pulse" : "text-muted-foreground"}`}>
            {isListening
              ? "🎙️ Listening... speak now"
              : isSubmitting
              ? "Processing your command…"
              : "Tap to start"}
          </p>

          <p className="text-xs text-muted-foreground">
            Example: "Update Keyboard to 30"
          </p>

          {/* Recognized text */}
          <AnimatePresence>
            {(transcript || lastCommand) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-border bg-card p-4 text-left"
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">Recognized Command:</p>
                <p className="text-sm font-mono text-card-foreground">"{transcript || lastCommand}"</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium ${
                  result.type === "success"
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {result.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                {result.message}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
