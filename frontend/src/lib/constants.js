export const CATEGORIES = [
  "DevOps",
  "Analytics",
  "Productivity",
  "Security",
  "Design",
  "Communication",
  "CRM & Sales",
  "AI Tools",
  "Finance",
];

export const PRICING_TIERS = ["Free", "Freemium", "Paid", "Enterprise"];
export const STATUSES = ["Available", "Integrated"];

export const CATEGORY_STYLES = {
  DevOps: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Analytics: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Productivity: "bg-amber-50 text-amber-700 border-amber-200",
  Security: "bg-rose-50 text-rose-700 border-rose-200",
  Design: "bg-purple-50 text-purple-700 border-purple-200",
  Communication: "bg-blue-50 text-blue-700 border-blue-200",
  "CRM & Sales": "bg-orange-50 text-orange-700 border-orange-200",
  "AI Tools": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Finance: "bg-teal-50 text-teal-700 border-teal-200",
};

export const categoryStyle = (cat) =>
  CATEGORY_STYLES[cat] || "bg-slate-100 text-slate-700 border-slate-200";

export const PRICING_STYLES = {
  Free: "text-emerald-600",
  Freemium: "text-blue-600",
  Paid: "text-amber-600",
  Enterprise: "text-purple-600",
};

export const SCREENSHOTS = [
  "https://images.unsplash.com/photo-1786340436214-76fd497c650b?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
  "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
  "https://images.pexels.com/photos/5380618/pexels-photo-5380618.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

export const fallbackLogo = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=EFF6FF&color=2563EB&bold=true&size=128`;


export const formatCost = (amount) => {
  const n = Number(amount) || 0;
  if (n <= 0) return "Usage-based";
  if (n >= 1000) return `$${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k/yr`;
  return `$${n.toLocaleString()}/yr`;
};
