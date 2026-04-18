"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { AuthSession } from "@/types/auth";
import { Mail, Lock, ArrowLeft } from "lucide-react";

export default function AdminLogin({ initialSession }: { initialSession?: AuthSession | null }) {
  const { signIn, loading, session, isAdmin } = useAuth(initialSession);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, loading, router, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
    }
    setSubmitting(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-md bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors";

  if (!loading && session && isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            <span className="text-primary font-mono text-xl font-bold opacity-70">&lt;</span>
            <span className="text-foreground font-bold text-xl tracking-tight">ONUR</span>
            <span className="text-primary font-mono text-xl font-bold opacity-70">/&gt;</span>
          </div>
          <h1 className="text-2xl font-bold">Admin Girişi</h1>
          <p className="text-muted-foreground text-sm mt-2">Yönetim paneline erişmek için giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-lg border border-border bg-card/60">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">E-posta</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Şifre</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mx-auto"
        >
          <ArrowLeft size={14} /> Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}
