"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CODE_KEY = "mvcc_dgl_code";
const NAME_KEY = "mvcc_dgl_name";

interface AdminAuthState {
  code: string | null;
  actorName: string;
  setActorName: (name: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

// Remembers a device that has already entered the shared DGL code, purely
// as a convenience (skip re-typing it, prefill the host name). This is NOT
// authentication - every write API route re-validates the code server-side
// regardless of what's in localStorage.
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState<string | null>(null);
  const [actorName, setActorNameState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCode(localStorage.getItem(CODE_KEY));
    setActorNameState(localStorage.getItem(NAME_KEY) ?? "");
    setHydrated(true);
  }, []);

  function setActorName(name: string) {
    setActorNameState(name);
    localStorage.setItem(NAME_KEY, name);
  }

  function rememberCode(value: string) {
    setCode(value);
    localStorage.setItem(CODE_KEY, value);
  }

  function logout() {
    setCode(null);
    localStorage.removeItem(CODE_KEY);
  }

  if (!hydrated) return null;

  if (!code) {
    return <CodeEntry onVerified={rememberCode} />;
  }

  return (
    <AdminAuthContext.Provider value={{ code, actorName, setActorName, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}

function CodeEntry({ onVerified }: { onVerified: (code: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const data = await res.json();
      if (data.ok) {
        onVerified(value);
      } else {
        setError(data.error ?? "Incorrect code.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 pt-20 text-center">
      <div className="bloom-backdrop rounded-card py-10 px-6 mb-6">
        <h1 className="font-serif font-semibold text-2xl text-pine tracking-tight mb-2">DGL Access</h1>
        <p className="text-sm font-medium text-ink/60">
          Enter the group leader code to add or manage playdates.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Group leader code"
          className="w-full rounded-xl border-2 border-sky/60 px-4 py-3 text-center font-bold tracking-wide focus:outline-none focus:border-teal transition-colors"
          autoFocus
        />
        {error && <p className="text-sm font-semibold text-cancelled">{error}</p>}
        <button
          type="submit"
          disabled={checking || !value}
          className="w-full rounded-full bg-teal text-white py-3 font-bold disabled:opacity-40 active:scale-95 transition-transform"
        >
          {checking ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
