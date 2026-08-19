import React from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, ShieldAlert, BadgeDollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryStyle, PRICING_STYLES, formatCost } from "@/lib/constants";
import { AppLogo } from "@/components/AppLogo";

export const AppCard = ({ app, index, onOpen }) => {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: (index % 12) * 0.04 }}
      onClick={() => onOpen(app)}
      data-testid={`app-card-${app.slug || app.id}`}
      className="group text-left bg-white border border-slate-200 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <AppLogo app={app} />
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${categoryStyle(
            app.category
          )}`}
        >
          {app.category}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <h3 className="text-base font-semibold text-slate-900 truncate">{app.name}</h3>
        {app.verified && <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />}
      </div>
      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{app.tagline}</p>

      <p className="text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed flex-1">
        {app.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(app.tags || []).slice(0, 3).map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="bg-slate-100 text-slate-600 font-medium rounded-md text-[11px]"
          >
            {t}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1 text-slate-500 font-medium">
          <BadgeDollarSign className="h-3.5 w-3.5 text-slate-400" />
          {formatCost(app.annual_cost)}
        </span>
        <span className="text-slate-300">·</span>
        {app.security_approved ? (
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> Approved
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-600 font-medium">
            <ShieldAlert className="h-3.5 w-3.5" /> Pending
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-slate-800">{app.rating}</span>
          <span className="text-xs text-slate-400">({app.reviews_count.toLocaleString()})</span>
        </div>
        <span className={`text-xs font-semibold ${PRICING_STYLES[app.pricing] || "text-slate-500"}`}>
          {app.pricing}
        </span>
      </div>
    </motion.button>
  );
};
