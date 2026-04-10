import { useState, useCallback } from "react";
import { Phone } from "lucide-react";
import PrivacyToggle from "@/components/PrivacyToggle";
import ProtectionPulse from "@/components/ProtectionPulse";
import SOSButton from "@/components/SOSButton";
import CountdownOverlay from "@/components/CountdownOverlay";
import FakeCallScreen from "@/components/FakeCallScreen";
import DistressActive from "@/components/DistressActive";

const Dashboard = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [distressActive, setDistressActive] = useState(false);

  const handleSOS = useCallback(() => {
    setShowCountdown(true);
  }, []);

  const handleCancelDistress = useCallback(() => {
    setShowCountdown(false);
  }, []);

  const handleExecuteDistress = useCallback(() => {
    setShowCountdown(false);
    setDistressActive(true);
    // In real app: write to Supabase, share GPS, start recording
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-display text-2xl font-bold text-gradient">Nova Shield</h1>
        <p className="text-sm text-muted-foreground">Your personal safety companion</p>
      </div>

      <div className="space-y-5 px-5">
        <PrivacyToggle isActive={isMonitoring} onToggle={setIsMonitoring} />
        <ProtectionPulse isActive={isMonitoring} />

        {distressActive ? (
          <DistressActive isActive onStop={() => setDistressActive(false)} />
        ) : (
          <SOSButton onPress={handleSOS} disabled={!isMonitoring} />
        )}

        {/* Fake Call */}
        <button
          onClick={() => setShowFakeCall(true)}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card p-5 font-display font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Phone className="h-5 w-5 text-primary" />
          Fake Call
        </button>
      </div>

      {/* Overlays */}
      <CountdownOverlay
        isVisible={showCountdown}
        onCancel={handleCancelDistress}
        onExecute={handleExecuteDistress}
      />
      <FakeCallScreen
        isVisible={showFakeCall}
        onAnswer={() => setShowFakeCall(false)}
        onDecline={() => setShowFakeCall(false)}
      />
    </div>
  );
};

export default Dashboard;
