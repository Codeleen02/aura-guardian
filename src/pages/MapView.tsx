import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation, Shield, AlertTriangle, Loader2, MapPin } from "lucide-react";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const FALLBACK_LOCATION: LatLngExpression = [40.7484, -73.9857];

// Generate mock zones relative to user location
function generateZones(center: [number, number]) {
  const [lat, lng] = center;
  return {
    safeZones: [
      { center: [lat + 0.004, lng + 0.008] as LatLngExpression, radius: 300, label: "Safe Zone — Well-lit area" },
      { center: [lat + 0.010, lng] as LatLngExpression, radius: 250, label: "Safe Zone — Police patrol" },
      { center: [lat - 0.006, lng - 0.003] as LatLngExpression, radius: 200, label: "Safe Zone — Park area" },
    ],
    dangerZones: [
      { center: [lat - 0.003, lng - 0.009] as LatLngExpression, radius: 200, label: "High Incident Area" },
      { center: [lat + 0.007, lng + 0.016] as LatLngExpression, radius: 180, label: "Caution Zone" },
    ],
    safeRoute: [
      [lat, lng],
      [lat + 0.002, lng + 0.002],
      [lat + 0.004, lng + 0.006],
      [lat + 0.004, lng + 0.008],
      [lat + 0.007, lng + 0.004],
      [lat + 0.010, lng],
    ] as LatLngExpression[],
    riskyRoute: [
      [lat, lng],
      [lat - 0.001, lng - 0.004],
      [lat - 0.003, lng - 0.009],
      [lat, lng - 0.012],
      [lat + 0.007, lng - 0.009],
      [lat + 0.010, lng],
    ] as LatLngExpression[],
  };
}

// Component to recenter map when location changes
const RecenterMap = ({ position }: { position: LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [map, position]);
  return null;
};

const UserLocationMarker = ({ position }: { position: LatLngExpression }) => {
  const userIcon = L.divIcon({
    html: `<div style="width:20px;height:20px;background:hsl(340,65%,65%);border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(219,112,147,0.6);"></div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <span className="font-semibold">You are here</span>
      </Popup>
    </Marker>
  );
};

const MapView = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSafeRoute, setShowSafeRoute] = useState(true);
  const [showRiskyRoute, setShowRiskyRoute] = useState(true);
  const [showZones, setShowZones] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        setGeoError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const center: LatLngExpression = userLocation ?? FALLBACK_LOCATION;
  const loc: [number, number] = userLocation ?? [40.7484, -73.9857];
  const { safeZones, dangerZones, safeRoute, riskyRoute } = useMemo(() => generateZones(loc), [loc[0], loc[1]]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Safe Navigation</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Locating you…" : geoError ? `Using fallback (${geoError})` : "Showing your live location"}
        </p>
      </div>

      {/* Map */}
      <div className="relative mx-5 overflow-hidden rounded-2xl border border-border" style={{ height: "55vh" }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <RecenterMap position={center} />
          <UserLocationMarker position={center} />

          {showZones &&
            safeZones.map((zone, i) => (
              <Circle
                key={`safe-${i}`}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{ color: "hsl(150, 60%, 45%)", fillColor: "hsl(150, 60%, 45%)", fillOpacity: 0.15, weight: 2 }}
              >
                <Popup>{zone.label}</Popup>
              </Circle>
            ))}

          {showZones &&
            dangerZones.map((zone, i) => (
              <Circle
                key={`danger-${i}`}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{ color: "hsl(0, 72%, 55%)", fillColor: "hsl(0, 72%, 55%)", fillOpacity: 0.2, weight: 2 }}
              >
                <Popup>{zone.label}</Popup>
              </Circle>
            ))}

          {showSafeRoute && (
            <Polyline positions={safeRoute} pathOptions={{ color: "hsl(150, 60%, 45%)", weight: 5, opacity: 0.8, dashArray: "10, 6" }} />
          )}
          {showRiskyRoute && (
            <Polyline positions={riskyRoute} pathOptions={{ color: "hsl(0, 72%, 55%)", weight: 4, opacity: 0.6, dashArray: "8, 8" }} />
          )}
        </MapContainer>
      </div>

      {/* Controls */}
      <div className="mx-5 mt-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSafeRoute(!showSafeRoute)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              showSafeRoute ? "border-safe/40 bg-safe/10 text-safe" : "border-border text-muted-foreground"
            }`}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-safe" />
            Safe Route
          </button>
          <button
            onClick={() => setShowRiskyRoute(!showRiskyRoute)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              showRiskyRoute ? "border-danger/40 bg-danger/10 text-danger" : "border-border text-muted-foreground"
            }`}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-danger" />
            Risky Route
          </button>
          <button
            onClick={() => setShowZones(!showZones)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              showZones ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            <Shield className="h-3 w-3" />
            Zones
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-safe/20 bg-safe/5 p-3">
            <div className="flex items-center gap-2 text-safe">
              <Navigation className="h-4 w-4" />
              <span className="text-xs font-semibold">Safe Route</span>
            </div>
            <p className="mt-1 text-lg font-display font-bold text-foreground">12 min</p>
            <p className="text-xs text-muted-foreground">Well-lit streets</p>
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