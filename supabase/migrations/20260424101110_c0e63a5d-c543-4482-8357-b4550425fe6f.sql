
-- 1) Add 'contact_messages' table for the new Contact form
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anonymous visitors) can submit a message
CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 120
  AND length(trim(email)) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(message)) BETWEEN 5 AND 5000
);

-- Only admins can read / update / delete
CREATE POLICY "Admins read contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update contact messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- 2) Restructure categories
-- The posts table references categories.slug via FK, so we update slugs first (FK is not ON UPDATE CASCADE per audit, but let's check & rename safely).
-- Drop FK temporarily to allow slug rename
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_category_slug_fkey;

-- Rename existing categories
UPDATE public.categories
SET slug = 'offers-earnings',
    name = 'Offers & Earnings',
    description = 'How to evaluate offers, understand EPC and payout models, choose networks, and judge real earning potential without falling for hype.'
WHERE slug = 'offer-selection';

UPDATE public.categories
SET slug = 'funnels-conversion',
    name = 'Funnels & Conversion',
    description = 'Landing pages, funnels, traffic alignment, trust signals, and the conversion mechanics that turn clicks into customers.',
    sort_order = 4
WHERE slug = 'conversion';

UPDATE public.categories
SET slug = 'seo-compliance',
    name = 'Trust, SEO & Compliance',
    description = 'Editorial trust, SEO for monetized sites, affiliate disclosures, ad-friendly content, and the standards that keep a site approved and indexed long term.',
    sort_order = 5
WHERE slug = 'compliance-seo';

-- Move the single Traffic post into the new Funnels & Conversion category
UPDATE public.posts
SET category_slug = 'funnels-conversion'
WHERE category_slug = 'traffic-funnels';

-- Update posts that referenced the renamed slugs
UPDATE public.posts SET category_slug = 'offers-earnings' WHERE category_slug = 'offer-selection';
UPDATE public.posts SET category_slug = 'funnels-conversion' WHERE category_slug = 'conversion';
UPDATE public.posts SET category_slug = 'seo-compliance' WHERE category_slug = 'compliance-seo';

-- Now delete the standalone Traffic category
DELETE FROM public.categories WHERE slug = 'traffic-funnels';

-- Re-sequence sort_order for cleanliness
UPDATE public.categories SET sort_order = 1 WHERE slug = 'start-here';
UPDATE public.categories SET sort_order = 2 WHERE slug = 'offers-earnings';
UPDATE public.categories SET sort_order = 3 WHERE slug = 'tracking';
UPDATE public.categories SET sort_order = 4 WHERE slug = 'funnels-conversion';
UPDATE public.categories SET sort_order = 5 WHERE slug = 'seo-compliance';
UPDATE public.categories SET sort_order = 6 WHERE slug = 'tools-resources';

-- Restore FK
ALTER TABLE public.posts
  ADD CONSTRAINT posts_category_slug_fkey
  FOREIGN KEY (category_slug)
  REFERENCES public.categories(slug)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- 3) Remove the UTM-Tools post (per content decision) and clean up the two tools "Coming Soon" drafts that the user no longer wants in the launch plan
DELETE FROM public.posts WHERE slug = 'how-to-set-up-utms-with-your-tracking-tool';
DELETE FROM public.posts WHERE slug IN (
  'best-landing-page-builders-for-monetized-sites',
  'best-seo-tools-for-monetized-blogs'
);
