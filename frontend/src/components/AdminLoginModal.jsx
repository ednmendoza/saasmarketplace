import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const AdminLoginModal = ({ open, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@marketplace.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in as admin");
      onClose();
      setPassword("");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl" data-testid="admin-login-modal">
        <DialogHeader>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-display">Admin Sign In</DialogTitle>
          <p className="text-sm text-slate-500">Sign in to manage the app catalog.</p>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
            <Input
              data-testid="login-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-11 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
            <Input
              data-testid="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              className="mt-1.5 h-11 rounded-xl"
              required
            />
          </div>
          {error && <p className="text-sm text-rose-600" data-testid="login-error">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            data-testid="login-submit-button"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-xs text-center text-slate-400">
            Demo: admin@marketplace.com / admin123
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
