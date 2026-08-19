import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from "@/lib/api";
import { CATEGORIES, PRICING_TIERS, STATUSES } from "@/lib/constants";

const EMPTY = {
  name: "",
  tagline: "",
  category: "Productivity",
  logo_url: "",
  website: "",
  description: "",
  rating: 4.5,
  reviews_count: 0,
  installs: "",
  pricing: "Freemium",
  status: "Available",
  verified: false,
  tags: [],
  features: [],
  compliance: [],
  vendor: "",
  annual_cost: 0,
  security_approved: false,
  approved_by: "",
  managed_by: "",
};

export const AppFormModal = ({ open, onClose, editing, onSaved }) => {
  const [form, setForm] = useState(EMPTY);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing ? { ...EMPTY, ...editing } : EMPTY);
      setAiQuery(editing?.name || "");
    }
  }, [open, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setList = (k, v) => set(k, v.split(",").map((s) => s.trim()).filter(Boolean));

  const runAutofill = async () => {
    if (!aiQuery.trim()) return toast.error("Enter an app name or URL first");
    setAiLoading(true);
    try {
      const res = await api.post("/apps/ai-autofill", { query: aiQuery });
      setForm((f) => ({ ...f, ...res.data }));
      toast.success("AI auto-fill complete");
    } catch (err) {
      toast.error("AI auto-fill failed. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        rating: parseFloat(form.rating) || 0,
        reviews_count: parseInt(form.reviews_count) || 0,
        annual_cost: parseFloat(form.annual_cost) || 0,
      };
      if (editing) {
        await api.put(`/apps/${editing.id}`, payload);
        toast.success("App updated");
      } else {
        await api.post("/apps", payload);
        toast.success("App created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error("Failed to save app");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-testid="app-form-modal"
        className="max-w-2xl rounded-2xl max-h-[92vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {editing ? "Edit Application" : "Add Application"}
          </DialogTitle>
        </DialogHeader>

        {/* AI Auto-fill */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-2">
            <Sparkles className="h-4 w-4" /> AI Auto-Fill Generator
          </div>
          <div className="flex gap-2">
            <Input
              data-testid="ai-autofill-input"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g. Airtable or airtable.com"
              className="h-10 rounded-lg bg-white"
            />
            <Button
              type="button"
              data-testid="ai-autofill-button"
              onClick={runAutofill}
              disabled={aiLoading}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Generate</span>
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Enter an app name or URL and let AI populate the details below.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name *">
              <Input
                data-testid="app-form-name-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                className="rounded-lg"
              />
            </Field>
            <Field label="Tagline">
              <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="rounded-lg" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger data-testid="app-form-category-select" className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Pricing">
              <Select value={form.pricing} onValueChange={(v) => set("pricing", v)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_TIERS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo URL">
              <Input value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} className="rounded-lg" />
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} className="rounded-lg" />
            </Field>
          </div>

          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="rounded-lg"
            />
          </Field>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Rating">
              <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set("rating", e.target.value)} className="rounded-lg" />
            </Field>
            <Field label="Reviews">
              <Input type="number" value={form.reviews_count} onChange={(e) => set("reviews_count", e.target.value)} className="rounded-lg" />
            </Field>
            <Field label="Installs">
              <Input value={form.installs} onChange={(e) => set("installs", e.target.value)} placeholder="1M+" className="rounded-lg" />
            </Field>
          </div>

          {/* Governance & Ownership */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
            <div className="text-sm font-semibold text-slate-700">Governance & Ownership</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Owned by (Vendor)">
                <Input
                  data-testid="app-form-vendor-input"
                  value={form.vendor}
                  onChange={(e) => set("vendor", e.target.value)}
                  placeholder="e.g. Salesforce, Inc."
                  className="rounded-lg bg-white"
                />
              </Field>
              <Field label="Annual Cost (USD)">
                <Input
                  type="number"
                  data-testid="app-form-cost-input"
                  value={form.annual_cost}
                  onChange={(e) => set("annual_cost", e.target.value)}
                  placeholder="0 for usage-based"
                  className="rounded-lg bg-white"
                />
              </Field>
              <Field label="Managed by (Internal Owner)">
                <Input
                  data-testid="app-form-managedby-input"
                  value={form.managed_by}
                  onChange={(e) => set("managed_by", e.target.value)}
                  placeholder="e.g. IT Operations"
                  className="rounded-lg bg-white"
                />
              </Field>
              <Field label="Approved by">
                <Input
                  data-testid="app-form-approvedby-input"
                  value={form.approved_by}
                  onChange={(e) => set("approved_by", e.target.value)}
                  placeholder="e.g. Security & IT"
                  className="rounded-lg bg-white"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-800">Security / IT Approved</div>
                <div className="text-xs text-slate-500">Cleared by Security & IT for organizational use</div>
              </div>
              <Switch
                data-testid="app-form-security-switch"
                checked={form.security_approved}
                onCheckedChange={(v) => set("security_approved", v)}
              />
            </div>
          </div>

          <Field label="Tags (comma separated)">
            <Input value={(form.tags || []).join(", ")} onChange={(e) => setList("tags", e.target.value)} className="rounded-lg" />
          </Field>
          <Field label="Features (comma separated)">
            <Textarea value={(form.features || []).join(", ")} onChange={(e) => setList("features", e.target.value)} rows={2} className="rounded-lg" />
          </Field>
          <Field label="Compliance (comma separated)">
            <Input value={(form.compliance || []).join(", ")} onChange={(e) => setList("compliance", e.target.value)} className="rounded-lg" />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button
              type="submit"
              disabled={saving}
              data-testid="app-form-submit-button"
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : editing ? "Update App" : "Create App"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
    <div className="mt-1.5">{children}</div>
  </div>
);
