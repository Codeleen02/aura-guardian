import { Shield, ShieldOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";

interface PrivacyToggleProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

const PrivacyToggle = ({ isActive, onToggle }: PrivacyToggleProps) => {
  return (
    <motion.div
      layout
      className={`relative rounded-2xl border p-6 transition-colors duration-500 ${
        isActive
          ? "border-safe/30 bg-safe/5"
          : "border-muted bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={isActive ? "active" : "paused"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isActive ? "bg-safe/20 text-safe" : "bg-muted text-muted-foreground"
              }`}
            >
              {isActive ? <Shield className="h-6 w-6" /> : <ShieldOff className="h-6 w-6" />}
            </motion.div>
          </AnimatePresence>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {isActive ? "Home Shield Active" : "Privacy Mode"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isActive
                ? "AI monitoring is active and protecting you"
                : "Monitoring Paused (Private Mode)"}
            </p>
          </div>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-safe data-[state=unchecked]:bg-muted"
        />
      </div>
    </motion.div>
  );
};

export default PrivacyToggle;
