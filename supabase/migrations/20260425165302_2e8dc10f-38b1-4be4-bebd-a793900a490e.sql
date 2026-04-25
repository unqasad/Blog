-- Extensions for scheduling + HTTP
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============ generation_log ============
CREATE TABLE IF NOT EXISTS public.generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'cron', -- 'cron' | 'manual'
  status TEXT NOT NULL,                -- 'drafted' | 'skipped' | 'error'
  category_slug TEXT,
  primary_keyword TEXT,
  chosen_title TEXT,
  article_angle TEXT,
  candidates JSONB NOT NULL DEFAULT '[]'::jsonb,
  post_id UUID,
  post_slug TEXT,
  skip_reason TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_generation_log_created_at
  ON public.generation_log (created_at DESC);

ALTER TABLE public.generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read generation log"
  ON public.generation_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage generation log"
  ON public.generation_log
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ affiliate_links ============
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tool_slug TEXT NOT NULL UNIQUE,
  tool_name TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  homepage_url TEXT,
  category TEXT, -- e.g. 'tracking', 'landing-pages', 'email', 'seo'
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read affiliate links"
  ON public.affiliate_links
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage affiliate links"
  ON public.affiliate_links
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============ Schedule auto-writer every 12 hours ============
-- Unschedule any prior job with the same name to keep this idempotent
DO $$
BEGIN
  PERFORM cron.unschedule('auto-writer-every-12h');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'auto-writer-every-12h',
  '0 */12 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kqygbpsyopprrzkuxrri.supabase.co/functions/v1/auto-writer',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeWdicHN5b3BwcnJ6a3V4cnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzMwODYsImV4cCI6MjA5MjUwOTA4Nn0.VtMYUfkUjuL11dRDS0D9MUGKAf_rsj7lHjj1rZ8nve0'
    ),
    body := jsonb_build_object('source', 'cron', 'time', now())
  ) AS request_id;
  $$
);