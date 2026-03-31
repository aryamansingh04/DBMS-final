import { useState, useCallback, useRef } from "react";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: (minDurationMs?: number) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const manuallyStoppedRef = useRef<boolean>(false);

  const isSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback((minDurationMs = 0) => {
    if (!isSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    manuallyStoppedRef.current = false;

    recognition.onresult = (event: any) => {
      const result = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(result);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    if (minDurationMs > 0) {
      window.setTimeout(() => {
        if (!manuallyStoppedRef.current) {
          recognitionRef.current?.stop();
        }
      }, minDurationMs);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    manuallyStoppedRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => setTranscript(""), []);

  return { isListening, transcript, startListening, stopListening, resetTranscript, isSupported };
}
