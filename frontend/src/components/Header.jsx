import React from "react";
import { Boxes, Plus, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export const Header = ({ onLoginClick, onAddClick }) => {
  const { isAdmin, logout, user } = useAuth();
  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 leading-none">AppHub</div>
            <div className="text-[11px] text-slate-400 leading-none mt-0.5">Enterprise Marketplace</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <span
                data-testid="admin-mode-toggle"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin Mode
              </span>
              <Button
                data-testid="add-app-button"
                onClick={onAddClick}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add App
              </Button>
              <Button
                variant="ghost"
                size="icon"
                data-testid="logout-button"
                onClick={logout}
                className="rounded-xl text-slate-500"
                title={`Sign out (${user?.email})`}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              data-testid="admin-login-button"
              onClick={onLoginClick}
              className="rounded-xl border-slate-200"
            >
              <LogIn className="h-4 w-4 mr-1.5" /> Admin Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
