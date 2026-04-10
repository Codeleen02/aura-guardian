import { motion } from "framer-motion";
import { Radio, MapPin, Video } from "lucide-react";

interface DistressActiveProps {
  isActive: boolean;
  onStop: () => void;
}

const DistressActive = ({ isActive, onStop }: DistressActiveProps) => {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-danger/40 bg-danger/10 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="h-3 w-3 rounded-full bg-danger"
        />
        <h3 className="font-display text-lg font-bold text-danger">DISTRESS PROTOCOL ACTIVE</h3>
      </div>

      <div className="space-y-3 text-sm text-foreground">
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-danger" />
          <span>GPS location shared with emergency contacts</span>
        </div>
        <div className="flex items-center gap-3">
          <Video className="h-4 w-4 text-danger" />
          <span>Auto-recording active — uploading evidence</span>
        </div>
        <div className="flex items-center gap-3">
          <Radio className="h-4 w-4 text-danger" />
          <span>Emergency SMS/Call broadcast sent</span>
        </div>
      </div>

      <button
        onClick={onStop}
        className="mt-5 w-full rounded-xl border border-foreground/20 py-3 font-display font-semibold text-foreground transition-colors hover:bg-foreground/5"
      >
        Deactivate Protocol
      </button>
    </motion.div>
  );
};

export default DistressActive;
