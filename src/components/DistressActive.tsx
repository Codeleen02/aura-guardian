// import { motion } from "framer-motion";
// import { Radio, MapPin, Mic, MicOff } from "lucide-react";

// interface DistressActiveProps {
//   isActive: boolean;
//   onStop: () => void;
//   isRecording?: boolean;
// }

// const DistressActive = ({ isActive, onStop, isRecording }: DistressActiveProps) => {
//   if (!isActive) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="rounded-2xl border border-danger/40 bg-danger/10 p-6"
//     >
//       <div className="flex items-center gap-3 mb-4">
//         <motion.div
//           animate={{ scale: [1, 1.3, 1] }}
//           transition={{ duration: 1, repeat: Infinity }}
//           className="h-3 w-3 rounded-full bg-danger"
//         />
//         <h3 className="font-display text-lg font-bold text-danger">DISTRESS PROTOCOL ACTIVE</h3>
//       </div>

//       <div className="space-y-3 text-sm text-foreground">
//         <div className="flex items-center gap-3">
//           <MapPin className="h-4 w-4 text-danger" />
//           <span>GPS location shared with emergency contacts</span>
//         </div>
//         <div className="flex items-center gap-3">
//           {isRecording ? (
//             <>
//               <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>
//                 <Mic className="h-4 w-4 text-danger" />
//               </motion.div>
//               <span>Audio recording active — capturing evidence</span>
//             </>
//           ) : (
//             <>
//               <MicOff className="h-4 w-4 text-muted-foreground" />
//               <span>Microphone unavailable</span>
//             </>
//           )}
//         </div>
//         <div className="flex items-center gap-3">
//           <Radio className="h-4 w-4 text-danger" />
//           <span>Emergency SMS/Call broadcast sent</span>
//         </div>
//       </div>

//       <button
//         onClick={onStop}
//         className="mt-5 w-full rounded-xl border border-foreground/20 py-3 font-display font-semibold text-foreground transition-colors hover:bg-foreground/5"
//       >
//         Deactivate Protocol
//       </button>
//     </motion.div>
//   );
// };

// export default DistressActive;
import { ShieldAlert, Square, MapPin } from "lucide-react";

interface DistressActiveProps {
  isActive: boolean;
  onStop: () => void;
  isRecording: boolean;
  latitude: number;  // Added this
  longitude: number; // Added this
}

const DistressActive = ({ isActive, onStop, isRecording, latitude, longitude }: DistressActiveProps) => {
  if (!isActive) return null;

  return (
    <div className="rounded-3xl bg-destructive/10 border-2 border-destructive p-8 text-center animate-pulse">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/20 mx-auto">
        <ShieldAlert className="h-12 w-12 text-destructive" />
      </div>
      
      <h2 className="text-2xl font-black text-destructive mb-2 uppercase tracking-tighter">Distress Active</h2>
      <p className="text-sm text-muted-foreground mb-6">Recording evidence and streaming location...</p>

      {/* NEW: Showing the live coords in the UI */}
      <div className="flex items-center justify-center gap-2 mb-8 text-[10px] font-mono bg-destructive/5 py-2 rounded-lg text-destructive">
        <MapPin size={12} />
        <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
      </div>

      <button
        onClick={onStop}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-destructive p-5 font-bold text-white shadow-lg shadow-destructive/30 active:scale-95 transition-transform"
      >
        <Square className="h-5 w-5 fill-current" />
        STOP EMERGENCY
      </button>
    </div>
  );
};

export default DistressActive;