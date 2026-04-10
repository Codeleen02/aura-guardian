import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface CountdownOverlayProps {
  isVisible: boolean;
  onCancel: () => void;
  onExecute: () => void;
}

const COUNTDOWN_SECONDS = 5;
const CIRCUMFERENCE = 2 * Math.PI * 45;

const CountdownOverlay = ({ isVisible, onCancel, onExecute }: CountdownOverlayProps) => {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  const handleCancel = useCallback(() => {
    setSeconds(COUNTDOWN_SECONDS);
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    if (!isVisible) {
      setSeconds(COUNTDOWN_SECONDS);
      return;
    }

    if (seconds <= 0) {
      onExecute();
      return;
    }

    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [isVisible, seconds, onExecute]);

  const progress = (COUNTDOWN_SECONDS - seconds) / COUNTDOWN_SECONDS;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <p className="font-display text-xl font-semibold text-danger">
              DISTRESS DETECTED
            </p>

            {/* Countdown ring */}
            <div className="relative flex h-48 w-48 items-center justify-center">
              <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="hsl(var(--danger))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              <span className="font-display text-7xl font-bold text-danger">
                {seconds}
              </span>
            </div>

            <p className="max-w-xs text-center text-muted-foreground">
              Emergency protocol will activate automatically.
              Press below if you are safe.
            </p>

            {/* Cancel button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              className="flex h-24 w-72 items-center justify-center gap-3 rounded-2xl border-2 border-safe bg-safe/10 font-display text-xl font-bold text-safe transition-colors hover:bg-safe/20 active:bg-safe/30"
            >
              <X className="h-7 w-7" />
              I AM SAFE
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CountdownOverlay;
