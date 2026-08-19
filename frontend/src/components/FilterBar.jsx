import React from "react";
import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";

export const FilterBar = ({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  view,
  setView,
  categoryCounts,
  total,
}) => {
  const chips = ["All", ...CATEGORIES];
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            data-testid="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps, categories, or capabilities..."
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger
              data-testid="sort-select"
              className="w-[170px] h-11 bg-white border-slate-200 rounded-xl text-sm"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-400 mr-1" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="name">A – Z</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            <button
              data-testid="app-view-toggle-grid"
              onClick={() => setView("grid")}
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                view === "grid" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              data-testid="app-view-toggle-list"
              onClick={() => setView("list")}
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                view === "list" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = category === c;
          const count = c === "All" ? total : categoryCounts[c] || 0;
          return (
            <button
              key={c}
              data-testid={c === "All" ? "category-filter-all" : `category-filter-${c.toLowerCase().replace(/[^a-z]/g, "-")}`}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {c}
              <span className={`ml-1.5 ${active ? "text-slate-300" : "text-slate-400"}`}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
