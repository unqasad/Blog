-- Add status + scheduled_for columns
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

-- Backfill: anything currently published stays published
UPDATE public.posts SET status = 'published' WHERE published = true;
UPDATE public.posts SET status = 'draft' WHERE published = false AND status = 'draft';

-- Validation trigger to constrain status values (avoids CHECK constraint immutability issues)
CREATE OR REPLACE FUNCTION public.validate_post_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('draft', 'scheduled', 'published') THEN
    RAISE EXCEPTION 'Invalid post status: %, must be draft, scheduled, or published', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_validate_status ON public.posts;
CREATE TRIGGER posts_validate_status
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.validate_post_status();

-- Tighten the public read policy to require both published flag AND status=published
DROP POLICY IF EXISTS "Anyone reads published posts" ON public.posts;
CREATE POLICY "Anyone reads published posts"
ON public.posts
FOR SELECT
TO public
USING (published = true AND status = 'published');

CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON public.posts(scheduled_for);