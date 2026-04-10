
CREATE TABLE public.safety_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius INTEGER NOT NULL DEFAULT 200,
  zone_type TEXT NOT NULL DEFAULT 'safe',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.safety_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own zones" ON public.safety_zones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own zones" ON public.safety_zones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own zones" ON public.safety_zones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own zones" ON public.safety_zones FOR DELETE USING (auth.uid() = user_id);
