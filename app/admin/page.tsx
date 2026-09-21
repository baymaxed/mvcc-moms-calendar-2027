"use client";

import { useState } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/adminAuth";
import { PlaydateForm } from "@/components/PlaydateForm";
import { ManagePlaydates } from "@/components/ManagePlaydates";
import { AnchorIcon } from "@/components/AnchorIcon";
import { describeAction } from "@/lib/confirmations";

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <AdminContent />
    </AdminAuthProvider>
  );
}

function AdminContent() {
  const { code, actorName, setActorName, logout } = useAdminAuth();
  const [tab, setTab] = useState<"add" | "manage">("add");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto pb-16">
      <header className="bloom-backdrop pt-10 pb-6 px-4 rounded-b-[32px] mb-5 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-teal font-bold text-xs uppercase tracking-wide mb-1.5">
            <AnchorIcon className="w-3.5 h-3.5" /> DGL Admin
          </p>
          <h1 className="font-serif font-semibold text-2xl text-pine tracking-tight">Manage Playdates</h1>
        </div>
        <button onClick={logout} className="text-xs font-bold text-teal/70 underline">
          Log out
        </button>
      </header>

      <div className="px-4">
        <label className="block mb-5">
          <span className="block text-xs font-bold text-ink/50 uppercase tracking-wide mb-1.5">
            Your name (used as host by default)
          </span>
          <input
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
            className="w-full rounded-xl border-2 border-sky/60 px-3.5 py-2.5 text-sm font-medium bg-white focus:outline-none focus:border-teal transition-colors"
            placeholder="Your name"
          />
        </label>

        <div className="flex rounded-full border-2 border-sky/60 p-1 mb-5 text-sm font-bold">
          <button
            onClick={() => setTab("add")}
            className={`flex-1 rounded-full py-2 transition-colors ${tab === "add" ? "bg-teal text-white" : "text-teal"}`}
          >
            Add playdate
          </button>
          <button
            onClick={() => setTab("manage")}
            className={`flex-1 rounded-full py-2 transition-colors ${tab === "manage" ? "bg-teal text-white" : "text-teal"}`}
          >
            Manage
          </button>
        </div>

        {confirmation && (
          <div className="bg-confirmedtint text-confirmed text-sm font-semibold rounded-2xl px-4 py-3 mb-4 flex justify-between gap-2 animate-pop-in">
            <span>{confirmation}</span>
            <button onClick={() => setConfirmation(null)} className="shrink-0 opacity-60">
              ×
            </button>
          </div>
        )}

        {tab === "add" ? (
          <div className="rounded-card p-4 bg-white shadow-sm">
            <PlaydateForm
              onSaved={(p, action) => {
                setConfirmation(describeAction(action, p));
                setTab("manage");
              }}
            />
          </div>
        ) : (
          <ManagePlaydates />
        )}

        <a
          href={`/api/export?code=${encodeURIComponent(code ?? "")}`}
          className="block text-center text-xs font-bold text-teal/70 underline mt-8"
        >
          Download full backup (CSV)
        </a>
      </div>
    </div>
  );
}
