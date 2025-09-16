"use client";

import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "../../app/actions/auth";

type Mode = "sign-in" | "sign-up";

interface Props {
  mode?: Mode;
}

export function AuthForm({ mode: initialMode = "sign-in" }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    
    const formData = new FormData(event.currentTarget);
    
    try {
      if (mode === "sign-in") {
        const result = await signInWithEmail(formData);
        if (result?.error) {
          setStatus("error");
          setMessage(result.error);
        }
      } else {
        const result = await signUpWithEmail(formData);
        if (result?.error) {
          setStatus("error");
          setMessage(result.error);
        }
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Something went wrong");
    }
  }

  return (
    <div className="w-full max-w-sm" suppressHydrationWarning>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-black/10 dark:border-white/10 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-black/10 dark:border-white/10 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="••••••••"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50 w-full"
        >
          {mode === "sign-in" ? (status === "loading" ? "Signing in..." : "Sign in") : (status === "loading" ? "Creating..." : "Create account")}
        </button>
        {message && (
          <p className="text-sm text-foreground/70">{message}</p>
        )}
      </form>

      <div className="mt-3 text-xs text-foreground/60">
        {mode === "sign-in" ? (
          <button onClick={() => setMode("sign-up")} className="underline">
            Need an account? Create one
          </button>
        ) : (
          <button onClick={() => setMode("sign-in")} className="underline">
            Already have an account? Sign in
          </button>
        )}
      </div>
    </div>
  );
}


