import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import Seo from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CATEGORIES } from "@/lib/categories";

type AdminPost = {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  published: boolean;
  published_at: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    meta_title: "",
    meta_description: "",
    category_slug: "start-here",
    read_minutes: 6,
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate("/auth");
        return;
      }
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id);
      const admin = (roleRows ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) loadPosts();
    });
  }, [navigate]);

  const loadPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("id,slug,title,category_slug,published,published_at")
      .order("published_at", { ascending: false });
    setPosts((data as AdminPost[]) ?? []);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("posts").insert({
      ...form,
      published: true,
      published_at: new Date().toISOString(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Post published" });
    setForm({ ...form, slug: "", title: "", excerpt: "", content: "", meta_title: "", meta_description: "" });
    loadPosts();
  };

  if (isAdmin === null) {
    return <SiteLayout><div className="container py-16">Loading…</div></SiteLayout>;
  }
  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container py-16 max-w-xl">
          <h1 className="font-serif text-3xl">Admin access required</h1>
          <p className="mt-3 text-muted-foreground">
            Your account is signed in but does not have the admin role. To grant admin access, run this SQL
            in the Cloud → Database editor (replace YOUR_USER_ID with your auth user id):
          </p>
          <pre className="mt-4 rounded bg-muted p-3 text-xs overflow-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');`}
          </pre>
          <Button className="mt-6" variant="secondary" onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))}>
            Sign out
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Seo title="Admin — Affiliate Compass" description="Editorial dashboard." canonicalPath="/admin" />
      <div className="container py-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h1 className="font-serif text-3xl tracking-tight">New post</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_slug} onValueChange={(v) => setForm({ ...form, category_slug: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Excerpt</Label><Textarea required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div><Label>Meta title</Label><Input required value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} /></div>
            <div><Label>Meta description</Label><Textarea required rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></div>
            <div><Label>Content (HTML)</Label><Textarea required rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <Button type="submit">Publish</Button>
          </form>
        </section>

        <section>
          <h2 className="font-serif text-2xl tracking-tight">Posts</h2>
          <ul className="mt-4 divide-y divide-border border border-border rounded-lg overflow-hidden">
            {posts.map((p) => (
              <li key={p.id} className="p-3 text-sm flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.category_slug} · {new Date(p.published_at).toLocaleDateString()}</p>
                </div>
                <a href={`/blog/${p.slug}`} className="text-primary text-xs hover:underline">View</a>
              </li>
            ))}
          </ul>
          <Button className="mt-6" variant="secondary" onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))}>
            Sign out
          </Button>
        </section>
      </div>
    </SiteLayout>
  );
};

export default Admin;
