import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import Seo from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CATEGORIES } from "@/lib/categories";
import { Sparkles, Loader2, Mail, MailOpen, Trash2 } from "lucide-react";

type PostStatus = "draft" | "scheduled" | "published";

type AdminPost = {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  status: PostStatus;
  published: boolean;
  published_at: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};

const statusVariant: Record<PostStatus, "secondary" | "outline" | "default"> = {
  draft: "secondary",
  outline: "outline",
  published: "default",
} as unknown as Record<PostStatus, "secondary" | "outline" | "default">;

const STATUS_VARIANT: Record<PostStatus, "secondary" | "outline" | "default"> = {
  draft: "secondary",
  scheduled: "outline",
  published: "default",
};

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [filter, setFilter] = useState<"all" | PostStatus>("all");
  const [generating, setGenerating] = useState(false);
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
      .select("id,slug,title,category_slug,status,published,published_at")
      .order("published_at", { ascending: false })
      .limit(200);
    setPosts((data as AdminPost[]) ?? []);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("posts").insert({
      ...form,
      published: true,
      status: "published",
      published_at: new Date().toISOString(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Post published" });
    setForm({
      ...form,
      slug: "",
      title: "",
      excerpt: "",
      content: "",
      meta_title: "",
      meta_description: "",
    });
    loadPosts();
  };

  const publishPost = async (id: string) => {
    const { error } = await supabase
      .from("posts")
      .update({
        status: "published",
        published: true,
        published_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Published" });
    loadPosts();
  };

  const unpublishPost = async (id: string) => {
    const { error } = await supabase
      .from("posts")
      .update({ status: "draft", published: false })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Moved to drafts" });
    loadPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    loadPosts();
  };

  const generateDraft = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-writer", {
        body: { source: "manual" },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) {
        throw new Error((data as { error: string }).error);
      }
      toast({ title: "Draft generated", description: "New AI draft saved for review." });
      loadPosts();
    } catch (e) {
      toast({
        title: "Generation failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  if (isAdmin === null) {
    return (
      <SiteLayout>
        <div className="container py-16">Loading…</div>
      </SiteLayout>
    );
  }
  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container py-16 max-w-xl">
          <h1 className="font-serif text-3xl">Admin access required</h1>
          <p className="mt-3 text-muted-foreground">
            Your account is signed in but does not have the admin role. To grant admin access,
            run this SQL in the Cloud → Database editor (replace YOUR_USER_ID with your auth
            user id):
          </p>
          <pre className="mt-4 rounded bg-muted p-3 text-xs overflow-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');`}
          </pre>
          <Button
            className="mt-6"
            variant="secondary"
            onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))}
          >
            Sign out
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Seo
        title="Admin — Affiliate Compass"
        description="Editorial dashboard."
        canonicalPath="/admin"
      />
      <div className="container py-12 grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="font-serif text-3xl tracking-tight">New post</h1>
            <Button
              type="button"
              onClick={generateDraft}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generating ? "Generating…" : "Generate AI draft"}
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            The AI writer runs automatically twice a day and saves drafts here for review.
            You can also write a post manually below.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category_slug}
                onValueChange={(v) => setForm({ ...form, category_slug: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea
                required
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>
            <div>
              <Label>Meta title</Label>
              <Input
                required
                value={form.meta_title}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              />
            </div>
            <div>
              <Label>Meta description</Label>
              <Textarea
                required
                rows={2}
                value={form.meta_description}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              />
            </div>
            <div>
              <Label>Content (HTML)</Label>
              <Textarea
                required
                rows={12}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <Button type="submit">Publish</Button>
          </form>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-serif text-2xl tracking-tight">Posts</h2>
            <div className="flex gap-1 text-xs">
              {(["all", "draft", "scheduled", "published"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-3 py-1.5 rounded-md border transition ${
                    filter === k
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-4 divide-y divide-border border border-border rounded-lg overflow-hidden">
            {filtered.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">No posts in this view.</li>
            )}
            {filtered.map((p) => (
              <li key={p.id} className="p-3 text-sm flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[p.status]} className="capitalize">
                      {p.status}
                    </Badge>
                    <p className="font-medium truncate">{p.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.category_slug} · {new Date(p.published_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.status === "published" ? (
                    <>
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-xs hover:underline"
                      >
                        View
                      </a>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unpublishPost(p.id)}
                      >
                        Unpublish
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => publishPost(p.id)}>
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deletePost(p.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Button
            className="mt-6"
            variant="secondary"
            onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))}
          >
            Sign out
          </Button>
        </section>
      </div>
    </SiteLayout>
  );
};

export default Admin;
