import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface ProtectionPulseProps {
  isActive: boolean;
}

const ProtectionPulse = ({ isActive }: ProtectionPulseProps) => {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative">
        {isActive && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-safe/20"
              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-safe/10"
              animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </>
        )}
        <motion.div
          className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full ${
            isActive ? "bg-safe/20 animate-pulse-glow" : "bg-muted/50"
          }`}
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield
            className={`h-14 w-14 ${isActive ? "text-safe" : "text-muted-foreground"}`}
          />
        </motion.div>
      </div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {isActive ? "Live Protection Active" : "Protection Paused"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isActive ? "All systems operational" : "Enable monitoring to activate protection"}
        </p>
      </div>
    </div>
  );
};

export default ProtectionPulse;
