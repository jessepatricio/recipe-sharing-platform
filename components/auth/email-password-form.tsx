"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

interface Props {
  mode: "sign-in" | "sign-up";
}

export function EmailPasswordForm({ mode }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatus("success");
        setMessage("Signed in successfully.");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        });
        if (error) throw error;
        setStatus("success");
        setMessage("Account created. Check your email to confirm.");
      }
      // Optional: refresh to show session-based UI
      if (mode === "sign-in") window.location.assign("/");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3" suppressHydrationWarning>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-black/10 dark:border-white/10 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-black/10 dark:border-white/10 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="••••••••"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {mode === "sign-in" ? (status === "loading" ? "Signing in..." : "Sign in") : (status === "loading" ? "Creating..." : "Create account")}
      </button>
      {message && (
        <p className="text-sm text-foreground/70">{message}</p>
      )}
    </form>
  );
}


