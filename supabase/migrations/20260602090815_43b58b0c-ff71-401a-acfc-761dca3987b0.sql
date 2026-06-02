-- Restrict EXECUTE on SECURITY DEFINER functions to only the roles that need them.
-- Trigger functions don't need EXECUTE for invoking users.
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_post_status() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies executed by signed-in users, so authenticated must keep EXECUTE.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;