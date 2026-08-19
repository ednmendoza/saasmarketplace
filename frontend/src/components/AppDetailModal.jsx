import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  CheckCircle2,
  Download,
  Lock,
  Pencil,
  Trash2,
  Users,
  Building2,
  BadgeDollarSign,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { categoryStyle, PRICING_STYLES, SCREENSHOTS, formatCost } from "@/lib/constants";
import { AppLogo } from "@/components/AppLogo";

export const AppDetailModal = ({ app, open, onClose, isAdmin, onEdit, onDelete }) => {
  if (!app) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-testid="app-detail-modal"
        className="max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl max-h-[92vh] overflow-y-auto"
      >
        <DialogTitle className="sr-only">{app.name} details</DialogTitle>

        {/* Hero */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="flex items-start gap-5">
            <AppLogo app={app} className="h-16 w-16" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-900 font-display">{app.name}</h2>
                {app.verified && <ShieldCheck className="h-5 w-5 text-blue-500" />}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryStyle(
                    app.category
                  )}`}
                >
                  {app.category}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{app.tagline}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <b className="text-slate-800">{app.rating}</b>
                  <span className="text-slate-400">({app.reviews_count.toLocaleString()})</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Users className="h-4 w-4" /> {app.installs} installs
                </span>
                <span className={`font-semibold ${PRICING_STYLES[app.pricing] || "text-slate-500"}`}>
                  {app.pricing}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Button
              data-testid="request-install-button"
              onClick={() => toast.success(`Install requested for ${app.name}`)}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              {app.status === "Integrated" ? "Launch App" : "Request Install"}
            </Button>
            {app.website && (
              <Button
                variant="outline"
                asChild
                className="rounded-xl border-slate-200"
              >
                <a href={app.website} target="_blank" rel="noreferrer" data-testid="app-website-link">
                  <ExternalLink className="h-4 w-4 mr-2" /> Visit Website
                </a>
              </Button>
            )}
            {isAdmin && (
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="icon"
                  data-testid="edit-app-button"
                  onClick={() => onEdit(app)}
                  className="rounded-xl border-slate-200"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  data-testid="delete-app-button"
                  onClick={() => onDelete(app)}
                  className="rounded-xl border-slate-200 text-rose-600 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Screenshots */}
          <div className="grid grid-cols-3 gap-3">
            {SCREENSHOTS.map((s, i) => (
              <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={s} alt={`screenshot ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-2">About</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{app.description}</p>
          </div>

          {/* Governance & Ownership */}
          <div data-testid="app-governance-section">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">
              Governance &amp; Ownership
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <Building2 className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Owned by</div>
                  <div className="text-sm font-medium text-slate-800" data-testid="detail-vendor">
                    {app.vendor || "—"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <BadgeDollarSign className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Annual Cost</div>
                  <div className="text-sm font-medium text-slate-800" data-testid="detail-cost">
                    {formatCost(app.annual_cost)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <UserCog className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Managed by</div>
                  <div className="text-sm font-medium text-slate-800" data-testid="detail-managedby">
                    {app.managed_by || "Unassigned"}
                  </div>
                </div>
              </div>
              <div
                className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                  app.security_approved
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-amber-200 bg-amber-50/60"
                }`}
              >
                {app.security_approved ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Security / IT
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      app.security_approved ? "text-emerald-700" : "text-amber-700"
                    }`}
                    data-testid="detail-security-status"
                  >
                    {app.security_approved
                      ? `Approved${app.approved_by ? ` · ${app.approved_by}` : ""}`
                      : "Pending review"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Key Features</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {(app.features || []).map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {app.tags?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {app.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-slate-100 text-slate-600 rounded-md">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {app.compliance?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">
                Security & Compliance
              </h3>
              <div className="flex flex-wrap gap-2">
                {app.compliance.map((c) => (
                  <span
                    key={c}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600"
                  >
                    <Lock className="h-3.5 w-3.5 text-slate-400" /> {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
