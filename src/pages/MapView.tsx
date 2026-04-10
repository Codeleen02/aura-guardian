import { MapPin, Navigation } from "lucide-react";

const MapView = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Safe Navigation</h1>
        <p className="text-sm text-muted-foreground">Predictive routing with safety insights</p>
      </div>

      {/* Mock map area */}
      <div className="mx-5 flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-border bg-card">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <p className="mt-4 font-display text-lg font-semibold text-foreground">Map Coming Soon</p>
        <p className="mt-1 max-w-xs text-center text-sm text-muted-foreground">
          Safe route highlighting and real-time risk assessment will be available here.
        </p>
      </div>

      {/* Legend */}
      <div className="mx-5 mt-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-safe" />
          <span className="text-xs text-muted-foreground">Safe Route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-danger" />
          <span className="text-xs text-muted-foreground">High Risk</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
