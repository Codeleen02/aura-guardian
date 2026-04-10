import { MapPin, Volume2, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const Settings = () => {
  const [autoHome, setAutoHome] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="space-y-4 px-5">
        {/* Safe Zones */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Safe Zones</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-safe" />
              <div>
                <p className="font-medium text-foreground">Auto-pause at Home</p>
                <p className="text-xs text-muted-foreground">Monitoring pauses in safe zones</p>
              </div>
            </div>
            <Switch checked={autoHome} onCheckedChange={setAutoHome} />
          </div>
        </div>

        {/* Alert Preferences */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Alerts</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Sound Alerts</p>
                <p className="text-xs text-muted-foreground">Play alarm during distress</p>
              </div>
            </div>
            <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Countdown Timer</p>
              <p className="text-xs text-muted-foreground">5 seconds before protocol activation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
