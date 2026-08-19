import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PackageOpen, Star, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { FilterBar } from "@/components/FilterBar";
import { AppCard } from "@/components/AppCard";
import { AppDetailModal } from "@/components/AppDetailModal";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { AppFormModal } from "@/components/AppFormModal";
import { AppLogo } from "@/components/AppLogo";
import { categoryStyle, PRICING_STYLES } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const ListRow = ({ app, onOpen, index }) => (
  <motion.button
    type="button"
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: (index % 12) * 0.03 }}
    onClick={() => onOpen(app)}
    data-testid={`app-row-${app.slug || app.id}`}
    className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all"
  >
    <AppLogo app={app} className="h-11 w-11" />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-slate-900 truncate">{app.name}</span>
        {app.verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
      </div>
      <p className="text-xs text-slate-500 truncate">{app.tagline}</p>
    </div>
    <span className={`hidden md:inline text-[11px] font-semibold px-2.5 py-1 rounded-full border ${categoryStyle(app.category)}`}>
      {app.category}
    </span>
    <span className="hidden sm:flex items-center gap-1 text-sm">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <b className="text-slate-800">{app.rating}</b>
    </span>
    <span className={`text-xs font-semibold w-20 text-right ${PRICING_STYLES[app.pricing] || "text-slate-500"}`}>
      {app.pricing}
    </span>
  </motion.button>
);

export default function Dashboard() {
  const { isAdmin, ready } = useAuth();
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popularity");
  const [view, setView] = useState("grid");

  const [selected, setSelected] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([api.get("/apps"), api.get("/apps/stats")]);
      setApps(a.data);
      setStats(s.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categoryCounts = useMemo(() => {
    const c = {};
    apps.forEach((a) => (c[a.category] = (c[a.category] || 0) + 1));
    return c;
  }, [apps]);

  const filtered = useMemo(() => {
    let list = apps;
    if (category !== "All") list = list.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    const sorted = [...list];
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "recent") sorted.reverse();
    else sorted.sort((a, b) => b.reviews_count - a.reviews_count);
    return sorted;
  }, [apps, category, search, sort]);

  const openDetail = (app) => setSelected(app);

  const handleEdit = (app) => {
    setSelected(null);
    setEditing(app);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/apps/${deleteTarget.id}`);
      toast.success(`${deleteTarget.name} removed`);
      setSelected(null);
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Failed to delete app");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onLoginClick={() => setLoginOpen(true)} onAddClick={handleAdd} />

      {/* Hero band */}
      <div className="grid-bg border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Software Directory</span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display mt-2">
              Discover apps for your organization
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Browse, evaluate, and integrate the best SaaS &amp; software tools, categorized with logos,
              features, and compliance at a glance.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <StatsBar stats={stats} />

        <FilterBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          view={view}
          setView={setView}
          categoryCounts={categoryCounts}
          total={apps.length}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <b className="text-slate-800">{filtered.length}</b> application{filtered.length !== 1 ? "s" : ""}
            {category !== "All" && ` in ${category}`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-state">
            <PackageOpen className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4">No apps match your filters.</p>
          </div>
        ) : view === "grid" ? (
          <div
            data-testid="app-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filtered.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} onOpen={openDetail} />
            ))}
          </div>
        ) : (
          <div data-testid="app-list" className="space-y-3">
            {filtered.map((app, i) => (
              <ListRow key={app.id} app={app} index={i} onOpen={openDetail} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-slate-400 flex items-center justify-between">
          <span>AppHub — Enterprise Software Marketplace</span>
          <span>{apps.length} curated apps</span>
        </div>
      </footer>

      <AppDetailModal
        app={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={(app) => setDeleteTarget(app)}
      />
      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <AppFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
        onSaved={load}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent data-testid="delete-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the app from the marketplace catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-testid="confirm-delete-button"
              className="bg-rose-600 hover:bg-rose-700 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
