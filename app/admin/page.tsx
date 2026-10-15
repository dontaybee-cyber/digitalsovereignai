"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Loader2,
  Download,
  Users,
  MessageSquare,
  Mail,
  ArrowRight,
} from "lucide-react";

interface PendingComment {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string | null;
  body: string;
  created_at: string;
}

export default function AdminPage() {
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function loadPending() {
    setLoadState("loading");
    try {
      const res = await fetch("/api/admin/comments");
      const data = await res.json();
      if (!res.ok) {
        setLoadState("error");
        return;
      }
      setComments(data.comments ?? []);
      setLoadState("loaded");
    } catch {
      setLoadState("error");
    }
  }

  async function loadSubscriberCount() {
    try {
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();
      if (res.ok) setSubscriberCount(data.count ?? 0);
    } catch {
      // non-fatal, leave count null
    }
  }

  useEffect(() => {
    loadPending();
    loadSubscriberCount();
  }, []);

  async function handleModerate(id: string, status: "approved" | "rejected") {
    setActioningId(id);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setActioningId(null);
    }
  }

  return (
    <main className="min-h-screen bg-void-black px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-sans text-2xl font-semibold tracking-tight text-text-primary">
              Moderation
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Sovereign AI Journal — admin panel.
            </p>
          </div>
          <Link
            href="/admin/dispatches"
            className="flex items-center gap-1.5 rounded-md border border-deep-claret-border px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:border-ocean-blue/50 hover:text-ocean-blue-bright"
          >
            <Mail size={14} />
            Dispatches
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-md border border-deep-claret-border bg-deep-claret/20 px-4 py-3 text-sm text-text-primary">
            <Users size={16} className="text-ocean-blue-bright" />
            {subscriberCount === null ? "—" : subscriberCount} subscribers
            <a
              href="/api/admin/subscribers?format=csv"
              className="ml-2 flex items-center gap-1 text-xs text-ocean-blue-bright underline decoration-ocean-blue/40 underline-offset-2 hover:text-ocean-blue"
            >
              <Download size={12} />
              Export CSV
            </a>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-deep-claret-border bg-deep-claret/20 px-4 py-3 text-sm text-text-primary">
            <MessageSquare size={16} className="text-ocean-blue-bright" />
            {comments.length} pending comment{comments.length === 1 ? "" : "s"}
          </div>
        </div>

        <h2 className="mt-10 font-sans text-lg font-semibold text-text-primary">
          Pending comments
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          {loadState === "loading" && (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Loader2 size={14} className="animate-spin" />
              Loading...
            </p>
          )}

          {loadState === "error" && (
            <p className="text-sm text-red-400">Could not load pending comments.</p>
          )}

          {loadState === "loaded" && comments.length === 0 && (
            <p className="text-sm text-text-muted">Nothing waiting on review.</p>
          )}

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-md border border-deep-claret-border bg-void-black-raised/50 p-4"
            >
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>
                  <span className="font-medium text-text-primary">{comment.author_name}</span>
                  {comment.author_email && <> · {comment.author_email}</>}
                  {" · on "}
                  <span className="text-ocean-blue-bright">{comment.post_slug}</span>
                </span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                {comment.body}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleModerate(comment.id, "approved")}
                  disabled={actioningId === comment.id}
                  className="flex items-center gap-1 rounded-md bg-ocean-blue px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-ocean-blue-deep disabled:opacity-50"
                >
                  <Check size={12} />
                  Approve
                </button>
                <button
                  onClick={() => handleModerate(comment.id, "rejected")}
                  disabled={actioningId === comment.id}
                  className="flex items-center gap-1 rounded-md border border-deep-claret-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
                >
                  <X size={12} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
