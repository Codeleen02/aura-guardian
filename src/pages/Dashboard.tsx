import { useState, useCallback, useEffect } from "react";
import { Phone } from "lucide-react";
import PrivacyToggle from "@/components/PrivacyToggle";
import ProtectionPulse from "@/components/ProtectionPulse";
import SOSButton from "@/components/SOSButton";
import CountdownOverlay from "@/components/CountdownOverlay";
import FakeCallScreen from "@/components/FakeCallScreen";
import DistressActive from "@/components/DistressActive";
import { useAuth } from "@/contexts/AuthContext";
import { createDistressLog, resolveDistressLog } from "@/lib/distress";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [distressActive, setDistressActive] = useState(false);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [contactName, setContactName] = useState<string | null>(null);

  // Fetch first emergency contact name for toast
  useEffect(() => {
    if (!user) return;
    supabase
      .from("emergency_contacts")
      .select("name")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setContactName(data[0].name);
      });
  }, [user]);

  const handleSOS = useCallback(() => {
    if (!isMonitoring) {
      toast.error("Privacy Mode is active. Enable monitoring to use SOS.");
      return;
    }
    setShowCountdown(true);
  }, [isMonitoring]);

  const handleCancelDistress = useCallback(() => {
    setShowCountdown(false);
  }, []);

  const handleExecuteDistress = useCallback(async () => {
    setShowCountdown(false);
    setDistressActive(true);

    // Start audio recording
    if (isMonitoring) {
      await startRecording();
    }

    if (user) {
      try {
        const log = await createDistressLog(user.id);
        setActiveLogId(log.id);

        // Show toast with contact name
        const name = contactName || "your emergency contacts";
        toast.success(`Emergency Alert Sent! Location shared with ${name} via SMS.`);
      } catch (err) {
        console.error("Failed to create distress log:", err);
        toast.error("Failed to send emergency alert.");
      }
    }
  }, [user, isMonitoring, startRecording, contactName]);

  const handleStopDistress = useCallback(async () => {
    setDistressActive(false);

    // Stop recording and upload evidence
    if (activeLogId && user) {
      try {
        await stopRecording(user.id, activeLogId);
        toast.success("Evidence recording saved securely.");
      } catch (err) {
        console.error("Failed to upload recording:", err);
      }
      try {
        await resolveDistressLog(activeLogId, "resolved");
      } catch (err) {
        console.error("Failed to resolve distress log:", err);
      }
      setActiveLogId(null);
    }
  }, [activeLogId, user, stopRecording]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gradient">Nova Shield</h1>
          <p className="text-sm text-muted-foreground">
            {user?.email ? `Welcome, ${user.email}` : "Your personal safety companion"}
          </p>
        </div>
        <button onClick={signOut} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-5 px-5">
        <PrivacyToggle isActive={isMonitoring} onToggle={setIsMonitoring} />
        <ProtectionPulse isActive={isMonitoring} />

        {distressActive ? (
          <DistressActive isActive onStop={handleStopDistress} isRecording={isRecording} />
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
