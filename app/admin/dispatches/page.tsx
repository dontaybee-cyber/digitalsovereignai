"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Send,
  Save,
  Trash2,
} from "lucide-react";

interface DispatchRow {
  id: string;
  subject: string;
  body_text: string;
  status: "draft" | "sent";
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
  updated_at: string;
}

function StatusBadge({ status }: { status: DispatchRow["status"] }) {
  const styles: Record<DispatchRow["status"], string> = {
    draft: "border-deep-claret-border text-text-muted",
    sent: "border-ocean-blue bg-ocean-blue/15 text-ocean-blue-bright",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}

function Composer({ onSaved }: { onSaved: () => void }) {
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [busy, setBusy] = useState<"idle" | "save" | "send">("idle");
  const [error, setError] = useState("");

  async function submit(action: "draft" | "send") {
    if (!subject.trim() || !bodyText.trim()) {
      setError("Subject and body are both required.");
      return;
    }
    if (action === "send") {
      const confirmed = window.confirm(
        "Send this to every active subscriber right now? This can't be undone."
      );
      if (!confirmed) return;
    }

    setBusy(action === "draft" ? "save" : "send");
    setError("");

    try {
      const res = await fetch("/api/admin/dispatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyText, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSubject("");
      setBodyText("");
      onSaved();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy("idle");
    }
  }

  return (
    <div className="rounded-md border border-deep-claret-border bg-void-black-raised/50 p-4">
      <label htmlFor="subject" className="sr-only">
        Subject
      </label>
      <input
        id="subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject line"
        className="w-full rounded-md border border-deep-claret-border bg-void-black px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-ocean-blue focus:outline-none"
      />

      <label htmlFor="body" className="sr-only">
        Body
      </label>
      <textarea
        id="body"
        value={bodyText}
        onChange={(e) => setBodyText(e.target.value)}
        rows={8}
        placeholder={"Write the dispatch. Blank lines start a new paragraph.\n\nPlain text in, styled HTML email out — no markdown needed."}
        className="mt-3 w-full resize-y rounded-md border border-deep-claret-border bg-void-black px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-ocean-blue focus:outline-none"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => submit("draft")}
          disabled={busy !== "idle"}
          className="flex items-center gap-1.5 rounded-md border border-deep-claret-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
        >
          {busy === "save" ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save draft
        </button>
        <button
          onClick={() => submit("send")}
          disabled={busy !== "idle"}
          className="flex items-center gap-1.5 rounded-md bg-ocean-blue px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-ocean-blue-deep disabled:opacity-50"
        >
          {busy === "send" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Send now
        </button>
      </div>
    </div>
  );
}

export default function DispatchesPage() {
  const [dispatches, setDispatches] = useState<DispatchRow[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function load() {
    setLoadState("loading");
    try {
      const res = await fetch("/api/admin/dispatches");
      const data = await res.json();
      if (!res.ok) {
        setLoadState("error");
        return;
      }
      setDispatches(data.dispatches ?? []);
      setLoadState("loaded");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteDraft(id: string) {
    if (!window.confirm("Delete this draft?")) return;
    setActioningId(id);
    try {
      await fetch(`/api/admin/dispatches/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setActioningId(null);
    }
  }

  return (
    <main className="min-h-screen bg-void-black px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary"
        >
          <ArrowLeft size={12} />
          Back to moderation
        </Link>

        <h1 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-text-primary">
          Dispatches
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Compose and send the Sovereign Dispatch newsletter.
        </p>

        <div className="mt-6">
          <Composer onSaved={load} />
        </div>

        <h2 className="mt-10 font-sans text-lg font-semibold text-text-primary">
          History
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          {loadState === "loading" && (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Loader2 size={14} className="animate-spin" />
              Loading...
            </p>
          )}

          {loadState === "error" && (
            <p className="text-sm text-red-400">Could not load dispatches.</p>
          )}

          {loadState === "loaded" && dispatches.length === 0 && (
            <p className="text-sm text-text-muted">No dispatches yet.</p>
          )}

          {dispatches.map((d) => (
            <div
              key={d.id}
              className="rounded-md border border-deep-claret-border bg-void-black-raised/50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={d.status} />
                {d.status === "draft" && (
                  <button
                    onClick={() => deleteDraft(d.id)}
                    disabled={actioningId === d.id}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </div>

              <p className="mt-2 font-medium text-text-primary">{d.subject}</p>
              <p className="mt-1 line-clamp-2 text-sm text-text-muted">{d.body_text}</p>

              <p className="mt-2 text-xs text-text-muted">
                {d.status === "sent" &&
                  `Sent ${new Date(d.sent_at!).toLocaleString()} to ${d.recipient_count} subscriber${d.recipient_count === 1 ? "" : "s"}`}
                {d.status === "draft" &&
                  `Last saved ${new Date(d.updated_at).toLocaleString()}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
