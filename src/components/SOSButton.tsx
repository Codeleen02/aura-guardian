import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface SOSButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const SOSButton = ({ onPress, disabled }: SOSButtonProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onPress}
      disabled={disabled}
      className="relative flex h-20 w-full items-center justify-center gap-3 rounded-2xl gradient-danger font-display text-xl font-bold text-danger-foreground shadow-lg transition-opacity disabled:opacity-40 glow-danger"
    >
      <AlertTriangle className="h-7 w-7" />
      SOS EMERGENCY
    </motion.button>
  );
};

export default SOSButton;
