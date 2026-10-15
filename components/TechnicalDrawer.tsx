"use client";

import { useEffect, useRef } from "react";
import { X, Code2, GitBranch, Layers } from "lucide-react";
import type { TechnicalReference } from "@/lib/posts";

interface TechnicalDrawerProps {
  reference: TechnicalReference | null;
  onClose: () => void;
}

const KIND_ICON: Record<TechnicalReference["kind"], typeof Code2> = {
  code: Code2,
  diagram: GitBranch,
  breakdown: Layers,
};

export default function TechnicalDrawer({
  reference,
  onClose,
}: TechnicalDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = reference !== null;

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !reference) return null;

  const Icon = KIND_ICON[reference.kind];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={reference.title}>
      {/* Backdrop over Void Black canvas */}
      <button
        aria-label="Close technical panel"
        onClick={onClose}
        className="absolute inset-0 bg-void-black/70 backdrop-blur-[2px] animate-fade-in"
      />

      {/* Slide-over panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md animate-slide-in overflow-y-auto border-l border-deep-claret-border bg-void-black-raised shadow-drawer sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-deep-claret-border px-6 py-5">
          <div className="flex items-center gap-2 text-ocean-blue-bright">
            <Icon size={16} />
            <span className="text-xs uppercase tracking-wide text-text-muted">
              {reference.kind === "code"
                ? "Code preview"
                : reference.kind === "diagram"
                ? "Diagram"
                : "Technical breakdown"}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-deep-claret/30 hover:text-text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6">
          <h3 className="font-sans text-lg font-semibold text-text-primary">
            {reference.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {reference.description}
          </p>

          {reference.kind === "code" && reference.code && (
            <div className="mt-6 overflow-hidden rounded-md border border-deep-claret-border">
              <div className="flex items-center justify-between border-b border-deep-claret-border bg-void-black px-4 py-2 text-xs text-text-muted">
                <span>{reference.language ?? "code"}</span>
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-deep-claret-border" />
                  <span className="h-2.5 w-2.5 rounded-full bg-deep-claret-border" />
                  <span className="h-2.5 w-2.5 rounded-full bg-deep-claret-border" />
                </span>
              </div>
              {/* Syntax highlighting placeholder — wire up Shiki / Prism here */}
              <pre className="overflow-x-auto bg-void-black px-4 py-4 text-sm leading-relaxed text-text-primary">
                <code className="font-mono">{reference.code}</code>
              </pre>
            </div>
          )}

          {reference.kind === "diagram" && (
            <div className="mt-6 flex h-56 items-center justify-center rounded-md border border-dashed border-deep-claret-border bg-void-black text-sm text-text-muted">
              {/* Diagram placeholder — wire up Mermaid / custom SVG renderer here */}
              Diagram placeholder: {reference.title}
            </div>
          )}

          {reference.kind === "breakdown" && (
            <div className="mt-6 rounded-md border border-deep-claret-border bg-void-black px-4 py-4 text-sm leading-relaxed text-text-muted">
              {/* Extended breakdown placeholder — replace with structured content */}
              Extended technical breakdown content goes here. This panel can
              hold nested sections, comparison tables, or additional
              references without disrupting the main article flow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
