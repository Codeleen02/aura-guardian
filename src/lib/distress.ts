import { supabase } from "@/integrations/supabase/client";

export const createDistressLog = async (userId: string) => {
  let latitude: number | null = null;
  let longitude: number | null = null;

  // Try to get GPS
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
    );
    latitude = pos.coords.latitude;
    longitude = pos.coords.longitude;
  } catch {
    // GPS unavailable
  }

  const { data, error } = await supabase.from("distress_logs").insert({
    user_id: userId,
    latitude,
    longitude,
    status: "active",
  }).select().single();

  if (error) throw error;
  return data;
};

export const resolveDistressLog = async (logId: string, status: "resolved" | "false_alarm") => {
  const { error } = await supabase
    .from("distress_logs")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", logId);
  if (error) throw error;
};
