import React from "react";
import { motion } from "framer-motion";
import { Layers, Plug, Grid3x3, Star } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, testid, accent, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    data-testid={testid}
    className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4"
  >
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900 font-display leading-none">{value}</div>
      <div className="text-xs font-medium text-slate-500 mt-1.5 uppercase tracking-wide">{label}</div>
    </div>
  </motion.div>
);

export const StatsBar = ({ stats }) => {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Layers}
        label="Total Apps"
        value={stats.total_apps}
        testid="stats-overview-total-apps"
        accent="bg-blue-50 text-blue-600"
        delay={0}
      />
      <StatCard
        icon={Plug}
        label="Active Integrations"
        value={stats.active_integrations}
        testid="stats-overview-active-integrations"
        accent="bg-emerald-50 text-emerald-600"
        delay={0.05}
      />
      <StatCard
        icon={Grid3x3}
        label="Categories"
        value={stats.categories_count}
        testid="stats-overview-categories"
        accent="bg-purple-50 text-purple-600"
        delay={0.1}
      />
      <StatCard
        icon={Star}
        label="Avg Rating"
        value={stats.avg_rating}
        testid="stats-overview-avg-rating"
        accent="bg-amber-50 text-amber-600"
        delay={0.15}
      />
    </div>
  );
};
