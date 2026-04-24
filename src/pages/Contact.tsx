import { useState } from "react";
import { z } from "zod";
import StaticPage from "@/components/StaticPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2 } from "lucide-react";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(120, "Name must be under 120 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be under 255 characters"),
  message: z
    .string()
    .trim()
    .min(5, "Message is too short")
    .max(5000, "Message must be under 5000 characters"),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Could not send your message",
        description:
          "Something went wrong on our side. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    setSuccess(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <StaticPage
      title="Contact"
      description="Get in touch with the Affiliate Compass editorial team for corrections, reader questions, or partnership inquiries."
      path="/contact"
    >
      <p className="lead text-lg leading-relaxed text-foreground">
        We read every message and prioritize corrections, thoughtful reader questions, and
        legitimate editorial inquiries. Use the form below to reach the editorial team
        privately — your details are stored securely and only the editorial team can see
        them.
      </p>

      <p>We typically respond to:</p>
      <ul>
        <li>Corrections or factual concerns about a published article</li>
        <li>Reader questions that may shape future articles</li>
        <li>Editorial and partnership inquiries from credible brands</li>
      </ul>
      <p>
        We do not accept paid guest posts, link insertions, or sponsored reviews that bypass
        our editorial standards.
      </p>

      <div className="not-prose mt-10">
        {success ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-serif text-lg">Message received</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Thanks for reaching out. We've stored your message and will reply directly
                to the email you provided when an editor reviews it.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSuccess(false)}
              >
                Send another message
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-soft space-y-5"
            noValidate
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Your name</Label>
                <Input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email address</Label>
                <Input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  maxLength={255}
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                rows={6}
                maxLength={5000}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Briefly tell us what you'd like to discuss."
                aria-invalid={!!errors.message}
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {form.message.trim().length} / 5000 characters
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
              <p className="text-xs text-muted-foreground max-w-md">
                By submitting, you agree your details will be stored privately so we can
                reply. We do not share or sell contact information.
              </p>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </StaticPage>
  );
};

export default Contact;
