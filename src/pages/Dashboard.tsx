import { useState, useCallback, useEffect, useRef } from "react";
import { Phone, LogOut, Mic, MicOff, ShieldCheck, ShieldAlert } from "lucide-react";
import PrivacyToggle from "@/components/PrivacyToggle";
import ProtectionPulse from "@/components/ProtectionPulse";
import SOSButton from "@/components/SOSButton";
import CountdownOverlay from "@/components/CountdownOverlay";
import FakeCallScreen from "@/components/FakeCallScreen";
import DistressActive from "@/components/DistressActive";
import { useAuth } from "@/contexts/AuthContext";
import { createDistressLog, resolveDistressLog } from "@/lib/distress";
import { findNearestPolice } from "@/lib/police"; 
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [distressActive, setDistressActive] = useState(false);
  const [showEvidenceSummary, setShowEvidenceSummary] = useState(false);
  
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [finalLogId, setFinalLogId] = useState<string | null>(null);
  const [nearestPolice, setNearestPolice] = useState<any>(null);
  const [currentPos, setCurrentPos] = useState({ lat: 19.2813, lng: 72.8557 });
  
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasOpenedTabsRef = useRef(false);

  // --- 1. VOICE TRIGGER ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !isMonitoring || distressActive) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      const triggers = ["help me", "emergency", "danger", "bachao"];
      
      if (triggers.some(word => transcript.includes(word))) {
        if (!showCountdown && !distressActive) {
          toast.warning("Distress Intent Detected!");
          setShowCountdown(true);
        }
      }
    };

    try { recognition.start(); } catch (e) { console.warn("Mic active"); }
    return () => recognition.stop();
  }, [isMonitoring, distressActive, showCountdown]);

  // --- 2. LOGISTICS ---
  const processLog = async (lat: number, lng: number) => {
    if (!user) return;
    setCurrentPos({ lat, lng });

    try {
      const log = await createDistressLog(user.id, lat, lng);
      if (log && !activeLogId) setActiveLogId(log.id);
    } catch (err) { console.error("Sync Error:", err); }
  };

  const trackLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => processLog(pos.coords.latitude, pos.coords.longitude),
        () => processLog(19.2813, 72.8557),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
  }, [user, activeLogId]);

  // --- 3. EMERGENCY EXECUTION ---
  const handleExecuteDistress = useCallback(async () => {
    setShowCountdown(false);
    setDistressActive(true);
    hasOpenedTabsRef.current = false;

    findNearestPolice(currentPos.lat, currentPos.lng).then((police) => {
      if (police) {
        setNearestPolice(police);
        toast.info(`Nearest Station: ${police.name}`);
      }
    });

   // B. External Alerts (WhatsApp/Maps)
    if (!hasOpenedTabsRef.current) {
      // Direct Clean Links
      const mapUrl = `https://www.google.com/maps?q=${currentPos.lat},${currentPos.lng}`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent("🚨 SOS! I need help. My live location: " + mapUrl)}`;
      
      window.open(waUrl, '_blank');
      window.open(mapUrl, '_blank');
      hasOpenedTabsRef.current = true;
    }

    if (isMonitoring) {
      try { await startRecording(); } catch (err) { console.warn("Audio skipped"); }
    }

    trackLocation();
    trackingIntervalRef.current = setInterval(trackLocation, 5000);
  }, [isMonitoring, startRecording, trackLocation, currentPos]);

  const handleStopDistress = useCallback(async () => {
    setDistressActive(false);
    setNearestPolice(null);
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);

    if (activeLogId && user) {
      try {
        await stopRecording(user.id, activeLogId);
        await resolveDistressLog(activeLogId, "resolved");
        setFinalLogId(activeLogId);
        setShowEvidenceSummary(true);
      } catch (err) { console.error("Resolution Error:", err); }
      setActiveLogId(null);
    }
  }, [activeLogId, user, stopRecording]);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">SHEild AI</h1>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              {isMonitoring ? "System Live" : "Standby"}
            </span>
          </div>
        </div>
        <button onClick={signOut} className="p-2.5 rounded-xl bg-card border text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* MAIN */}
      <main className="space-y-6 px-6">
        <PrivacyToggle isActive={isMonitoring} onToggle={setIsMonitoring} />
        
        {distressActive && (
          <section className="p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-primary animate-bounce" />
              <div>
                <p className="text-sm font-bold">{nearestPolice ? nearestPolice.name : "Analyzing Jurisdiction..."}</p>
                <p className="text-[10px] text-muted-foreground font-mono">Lat: {currentPos.lat.toFixed(4)} | Lng: {currentPos.lng.toFixed(4)}</p>
              </div>
            </div>
          </section>
        )}

        <ProtectionPulse isActive={isMonitoring} />

        {distressActive ? (
          <DistressActive 
            isActive={true}
            onStop={handleStopDistress} 
            isRecording={isRecording} 
            latitude={currentPos?.lat || 19.2813}
            longitude={currentPos?.lng || 72.8557} 
          />
        ) : (
          <>
            <SOSButton onPress={() => setShowCountdown(true)} disabled={!isMonitoring} />
            <button 
              onClick={() => setShowFakeCall(true)} 
              className="flex w-full items-center justify-center gap-3 rounded-2xl border bg-card p-5 font-bold shadow-sm"
            >
              <Phone className="h-5 w-5 text-primary" />
              De-escalation Call
            </button>
          </>
        )}
      </main>

      {/* OVERLAYS */}
      <CountdownOverlay isVisible={showCountdown} onCancel={() => setShowCountdown(false)} onExecute={handleExecuteDistress} />
      <FakeCallScreen isVisible={showFakeCall} onAnswer={() => setShowFakeCall(false)} onDecline={() => setShowFakeCall(false)} />

      {/* MODAL */}
      {showEvidenceSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-sm rounded-3xl bg-card p-8 border shadow-2xl">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-center text-2xl font-bold mb-2">Safe & Secured</h2>
            <p className="text-center text-sm text-muted-foreground mb-8">Incident ID: #{finalLogId?.slice(0, 8)}</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-muted p-4 rounded-2xl text-center"><p className="text-xs font-bold text-green-500">GPS SAVED</p></div>
              <div className="bg-muted p-4 rounded-2xl text-center"><p className="text-xs font-bold text-green-500">AUDIO SYNCED</p></div>
            </div>
            <button onClick={() => setShowEvidenceSummary(false)} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold">Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;