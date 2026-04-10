import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation, Shield, AlertTriangle, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const FALLBACK_LOCATION: LatLngExpression = [40.7484, -73.9857];

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
      <Popup><span className="font-semibold">You are here</span></Popup>
    </Marker>
  );
};

interface SafetyZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  zone_type: string;
}

const MapView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", zone_type: "safe", radius: 200 });

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

  const { data: zones = [] } = useQuery({
    queryKey: ["safety_zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_zones")
        .select("id, name, latitude, longitude, radius, zone_type")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as SafetyZone[];
    },
    enabled: !!user,
  });

  const addZoneMutation = useMutation({
    mutationFn: async () => {
      const loc = userLocation ?? [40.7484, -73.9857];
      const { error } = await supabase.from("safety_zones").insert({
        user_id: user!.id,
        name: newZone.name.trim(),
        latitude: loc[0],
        longitude: loc[1],
        radius: newZone.radius,
        zone_type: newZone.zone_type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety_zones"] });
      setNewZone({ name: "", zone_type: "safe", radius: 200 });
      setShowAddForm(false);
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("safety_zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["safety_zones"] }),
  });

  const center: LatLngExpression = userLocation ?? FALLBACK_LOCATION;
  const safeZones = zones.filter(z => z.zone_type === "safe");
  const dangerZones = zones.filter(z => z.zone_type === "danger");

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Safe Navigation</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Locating you…" : geoError ? `Using fallback (${geoError})` : "Showing your live location"}
        </p>
      </div>

      <div className="relative mx-5 overflow-hidden rounded-2xl border border-border" style={{ height: "50vh" }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <RecenterMap position={center} />
          <UserLocationMarker position={center} />

          {showZones && safeZones.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.latitude, zone.longitude]}
              radius={zone.radius}
              pathOptions={{ color: "hsl(150, 60%, 45%)", fillColor: "hsl(150, 60%, 45%)", fillOpacity: 0.15, weight: 2 }}
            >
              <Popup>
                <div>
                  <p className="font-semibold">{zone.name}</p>
                  <button onClick={() => deleteZoneMutation.mutate(zone.id)} className="mt-1 text-xs text-red-500 underline">Remove</button>
                </div>
              </Popup>
            </Circle>
          ))}

          {showZones && dangerZones.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.latitude, zone.longitude]}
              radius={zone.radius}
              pathOptions={{ color: "hsl(0, 72%, 55%)", fillColor: "hsl(0, 72%, 55%)", fillOpacity: 0.2, weight: 2 }}
            >
              <Popup>
                <div>
                  <p className="font-semibold">{zone.name}</p>
                  <button onClick={() => deleteZoneMutation.mutate(zone.id)} className="mt-1 text-xs text-red-500 underline">Remove</button>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>

      {/* Controls */}
      <div className="mx-5 mt-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              showZones ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            <Shield className="h-3 w-3" />
            Zones ({zones.length})
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Zone
          </button>
        </div>

        {showAddForm && (
          <div className="space-y-3 rounded-2xl border border-primary/30 bg-card p-4">
            <input
              value={newZone.name}
              onChange={e => setNewZone({ ...newZone, name: e.target.value })}
              placeholder="Zone name"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setNewZone({ ...newZone, zone_type: "safe" })}
                className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors ${
                  newZone.zone_type === "safe" ? "border-safe bg-safe/10 text-safe" : "border-border text-muted-foreground"
                }`}
              >
                Safe
              </button>
              <button
                onClick={() => setNewZone({ ...newZone, zone_type: "danger" })}
                className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors ${
                  newZone.zone_type === "danger" ? "border-danger bg-danger/10 text-danger" : "border-border text-muted-foreground"
                }`}
              >
                Danger
              </button>
            </div>
            <input
              type="number"
              value={newZone.radius}
              onChange={e => setNewZone({ ...newZone, radius: Number(e.target.value) })}
              placeholder="Radius (meters)"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddForm(false)} className="flex-1 rounded-xl border border-border py-3 font-display font-semibold text-muted-foreground">
                Cancel
              </button>
              <button
                onClick={() => addZoneMutation.mutate()}
                disabled={!newZone.name.trim()}
                className="flex-1 rounded-xl gradient-primary py-3 font-display font-semibold text-primary-foreground disabled:opacity-50"
              >
                Add at My Location
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-safe/20 bg-safe/5 p-3">
            <div className="flex items-center gap-2 text-safe">
              <Navigation className="h-4 w-4" />
              <span className="text-xs font-semibold">Safe Zones</span>
            </div>
            <p className="mt-1 text-lg font-display font-bold text-foreground">{safeZones.length}</p>
            <p className="text-xs text-muted-foreground">Marked safe areas</p>
          </div>
          <div className="rounded-xl border border-danger/20 bg-danger/5 p-3">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold">Danger Zones</span>
            </div>
            <p className="mt-1 text-lg font-display font-bold text-foreground">{dangerZones.length}</p>
            <p className="text-xs text-muted-foreground">Marked risk areas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
