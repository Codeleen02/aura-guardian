import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff } from "lucide-react";
import { useEffect } from "react";

interface FakeCallScreenProps {
  isVisible: boolean;
  callerName?: string;
  onAnswer: () => void;
  onDecline: () => void;
}

const FakeCallScreen = ({
  isVisible,
  callerName = "Mom",
  onAnswer,
  onDecline,
}: FakeCallScreenProps) => {
  useEffect(() => {
    if (isVisible && navigator.vibrate) {
      const interval = setInterval(() => navigator.vibrate([200, 100, 200]), 2000);
      return () => {
        clearInterval(interval);
        navigator.vibrate(0);
      };
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-background py-16"
        >
          <div className="flex flex-col items-center gap-3 pt-12">
            <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-primary">
              <span className="font-display text-3xl font-bold text-primary-foreground">
                {callerName[0]}
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">{callerName}</h2>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-muted-foreground"
            >
              Incoming call...
            </motion.p>
          </div>

          <div className="flex gap-16 pb-8">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onDecline}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-danger text-danger-foreground"
            >
              <PhoneOff className="h-7 w-7" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onAnswer}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-safe text-safe-foreground"
            >
              <Phone className="h-7 w-7" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FakeCallScreen;
