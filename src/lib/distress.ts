import { supabase } from "@/integrations/supabase/client";

export const createDistressLog = async (userId: string, lat?: number, lng?: number) => {
  const { data, error } = await supabase
    .from("distress_logs")
    .insert([
      {
        user_id: userId,
        latitude: lat,
        longitude: lng,
        status: "active",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const resolveDistressLog = async (logId: string, status: string) => {
  const { data, error } = await supabase
    .from("distress_logs")
    .update({ status: status })
    .eq("id", logId);

  if (error) throw error;
  return data;
};

