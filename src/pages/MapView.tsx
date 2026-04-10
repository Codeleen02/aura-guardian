import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation, Shield, AlertTriangle } from "lucide-react";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Mock data: center on NYC
const USER_LOCATION: LatLngExpression = [40.7484, -73.9857]; // Empire State

const SAFE_ZONES = [
  { center: [40.7527, -73.9772] as LatLngExpression, radius: 300, label: "Grand Central Safe Zone" },
  { center: [40.7580, -73.9855] as LatLngExpression, radius: 250, label: "Times Square Patrol Area" },
  { center: [40.7425, -73.9889] as LatLngExpression, radius: 200, label: "Madison Square Park" },
];

const DANGER_ZONES = [
  { center: [40.7450, -73.9950] as LatLngExpression, radius: 200, label: "High Incident Area - W 30th" },
  { center: [40.7550, -73.9700] as LatLngExpression, radius: 180, label: "Caution Zone - E 45th" },
];

const SAFE_ROUTE: LatLngExpression[] = [
  [40.7484, -73.9857],
  [40.7500, -73.9840],
  [40.7520, -73.9800],
  [40.7527, -73.9772],
  [40.7550, -73.9810],
  [40.7580, -73.9855],
];

const RISKY_ROUTE: LatLngExpression[] = [
  [40.7484, -73.9857],
  [40.7470, -73.9900],
  [40.7450, -73.9950],
  [40.7480, -73.9980],
  [40.7550, -73.9950],
  [40.7580, -73.9855],
];

const UserLocationMarker = () => {
  const userIcon = L.divIcon({
    html: `<div style="width:20px;height:20px;background:hsl(340,65%,65%);border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(219,112,147,0.6);"></div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <Marker position={USER_LOCATION} icon={userIcon}>
      <Popup>
        <span className="font-semibold">You are here</span>
      </Popup>
    </Marker>
  );
};

const MapView = () => {
  const [showSafeRoute, setShowSafeRoute] = useState(true);
  const [showRiskyRoute, setShowRiskyRoute] = useState(true);
  const [showZones, setShowZones] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Safe Navigation</h1>
        <p className="text-sm text-muted-foreground">Predictive routing with safety insights</p>
      </div>

      {/* Map */}
      <div className="mx-5 overflow-hidden rounded-2xl border border-border" style={{ height: "55vh" }}>
        <MapContainer
          center={USER_LOCATION}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <UserLocationMarker />

          {/* Safe zones */}
          {showZones &&
            SAFE_ZONES.map((zone, i) => (
              <Circle
                key={`safe-${i}`}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{
                  color: "hsl(150, 60%, 45%)",
                  fillColor: "hsl(150, 60%, 45%)",
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              >
                <Popup>{zone.label}</Popup>
              </Circle>
            ))}

          {/* Danger zones */}
          {showZones &&
            DANGER_ZONES.map((zone, i) => (
              <Circle
                key={`danger-${i}`}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{
                  color: "hsl(0, 72%, 55%)",
                  fillColor: "hsl(0, 72%, 55%)",
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              >
                <Popup>{zone.label}</Popup>
              </Circle>
            ))}

          {/* Safe route */}
          {showSafeRoute && (
            <Polyline
              positions={SAFE_ROUTE}
              pathOptions={{
                color: "hsl(150, 60%, 45%)",
                weight: 5,
                opacity: 0.8,
                dashArray: "10, 6",
              }}
            />
          )}

          {/* Risky route */}
          {showRiskyRoute && (
            <Polyline
              positions={RISKY_ROUTE}
              pathOptions={{
                color: "hsl(0, 72%, 55%)",
                weight: 4,
                opacity: 0.6,
                dashArray: "8, 8",
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Controls */}
      <div className="mx-5 mt-4 space-y-3">
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSafeRoute(!showSafeRoute)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              showSafeRoute
                ? "border-safe/40 bg-safe/10 text-safe"
                : "border-border text-muted-foreground"
            }`}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-safe" />
            Safe Route
          </button>
          <button
            onClick={() => setShowRiskyRoute(!showRiskyRoute)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              showRiskyRoute
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-border text-muted-foreground"
            }`}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-danger" />
            Risky Route
          </button>
          <button
            onClick={() => setShowZones(!showZones)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              showZones
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            <Shield className="h-3 w-3" />
            Zones
          </button>
        </div>

        {/* Route info cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-safe/20 bg-safe/5 p-3">
            <div className="flex items-center gap-2 text-safe">
              <Navigation className="h-4 w-4" />
              <span className="text-xs font-semibold">Safe Route</span>
            </div>
            <p className="mt-1 text-lg font-display font-bold text-foreground">12 min</p>
            <p className="text-xs text-muted-foreground">Via Grand Central</p>
          </div>
          <div className="rounded-xl border border-danger/20 bg-danger/5 p-3">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold">Risky Route</span>
            </div>
            <p className="mt-1 text-lg font-display font-bold text-foreground">8 min</p>
            <p className="text-xs text-muted-foreground">Passes 2 risk zones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
