"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MessageSquare, CornerDownRight, Loader2 } from "lucide-react";

interface ApiComment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  replies?: ApiComment[];
}

interface CommentSectionProps {
  postSlug: string;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CommentItem({
  comment,
  postSlug,
  depth = 0,
  onReplySubmitted,
}: {
  comment: ApiComment;
  postSlug: string;
  depth?: number;
  onReplySubmitted: () => void;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className={depth > 0 ? "ml-6 border-l border-deep-claret-border pl-5" : ""}>
      <div className="rounded-md border border-deep-claret-border bg-void-black-raised/50 p-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="font-medium text-text-primary">{comment.author_name}</span>
          <span aria-hidden="true">·</span>
          <span>{formatTimestamp(comment.created_at)}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
          {comment.body}
        </p>
        {depth === 0 && (
          <button
            onClick={() => setReplying((r) => !r)}
            className="mt-3 flex items-center gap-1 text-xs text-ocean-blue-bright transition-colors hover:text-ocean-blue"
          >
            <CornerDownRight size={12} />
            Reply
          </button>
        )}

        {replying && (
          <div className="mt-3">
            <CommentForm
              postSlug={postSlug}
              parentId={comment.id}
              compact
              onSubmitted={() => {
                setReplying(false);
                onReplySubmitted();
              }}
            />
          </div>
        )}
      </div>

      {comment.replies?.map((reply) => (
        <div key={reply.id} className="mt-4">
          <CommentItem
            comment={reply}
            postSlug={postSlug}
            depth={depth + 1}
            onReplySubmitted={onReplySubmitted}
          />
        </div>
      ))}
    </div>
  );
}

function CommentForm({
  postSlug,
  parentId,
  compact = false,
  onSubmitted,
}: {
  postSlug: string;
  parentId?: string;
  compact?: boolean;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !draft.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug,
          parentId,
          authorName: name,
          body: draft,
          company,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("idle");
      setConfirmation(data.message ?? "Thanks — your comment is awaiting moderation.");
      setName("");
      setDraft("");
      onSubmitted();
    } catch {
      setStatus("error");
      setErrorMessage("Could not reach the server. Check your connection and try again.");
    }
  }

  if (confirmation) {
    return (
      <p className="rounded-md border border-ocean-blue/40 bg-ocean-blue/10 px-4 py-3 text-sm text-ocean-blue-bright">
        {confirmation}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "" : "mt-6"}>
      <div className={`flex flex-col gap-3 ${compact ? "" : "sm:flex-row"}`}>
        <label htmlFor={`name-${parentId ?? "top"}`} className="sr-only">
          Name
        </label>
        <input
          id={`name-${parentId ?? "top"}`}
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          maxLength={80}
          className={`rounded-md border border-deep-claret-border bg-void-black-raised/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-ocean-blue focus:outline-none ${
            compact ? "w-full sm:w-48" : "sm:w-48"
          }`}
          disabled={status === "loading"}
        />
      </div>

      <label htmlFor={`body-${parentId ?? "top"}`} className="sr-only">
        {parentId ? "Add a reply" : "Add to the discussion"}
      </label>
      <textarea
        id={`body-${parentId ?? "top"}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={compact ? 2 : 3}
        maxLength={2000}
        placeholder={parentId ? "Write a reply..." : "Add to the discussion..."}
        className="mt-3 w-full resize-none rounded-md border border-deep-claret-border bg-void-black-raised/50 p-4 text-sm text-text-primary placeholder:text-text-muted focus:border-ocean-blue focus:outline-none"
        disabled={status === "loading"}
      />

      {/* Honeypot: hidden from real users, bots fill it in. */}
      <input
        type="text"
        name="company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
      )}

      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={!name.trim() || !draft.trim() || status === "loading"}
          className="flex items-center gap-2 rounded-md bg-ocean-blue px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-ocean-blue-deep disabled:opacity-40"
        >
          {status === "loading" && <Loader2 size={14} className="animate-spin" />}
          {parentId ? "Post reply" : "Post comment"}
        </button>
      </div>
    </form>
  );
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setLoadState("loading");
      try {
        const res = await fetch(`/api/comments?slug=${encodeURIComponent(postSlug)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadState("error");
          return;
        }
        setComments(data.comments ?? []);
        setLoadState("loaded");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    }

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [postSlug, refreshKey]);

  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

  return (
    <section className="mx-auto max-w-prose px-6 pb-24" aria-labelledby="comments-heading">
      <div className="flex items-center gap-2 border-b border-deep-claret-border pb-4">
        <MessageSquare size={18} className="text-ocean-blue-bright" />
        <h2 id="comments-heading" className="font-sans text-lg font-semibold text-text-primary">
          Discussion {loadState === "loaded" ? `(${totalCount})` : ""}
        </h2>
      </div>

      <CommentForm
        postSlug={postSlug}
        onSubmitted={() => setRefreshKey((k) => k + 1)}
      />

      <div className="mt-8 flex flex-col gap-4">
        {loadState === "loading" && (
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 size={14} className="animate-spin" />
            Loading comments...
          </p>
        )}

        {loadState === "error" && (
          <p className="text-sm text-red-400">
            Couldn't load comments right now. Try refreshing the page.
          </p>
        )}

        {loadState === "loaded" && comments.length === 0 && (
          <p className="text-sm text-text-muted">
            No comments yet — be the first to start the discussion.
          </p>
        )}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postSlug={postSlug}
            onReplySubmitted={() => setRefreshKey((k) => k + 1)}
          />
        ))}
      </div>
    </section>
  );
}
