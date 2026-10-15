"use client";

import { useMemo, type MouseEvent } from "react";
import type { TechnicalReference } from "@/lib/posts";

interface ArticleBodyProps {
  bodyHtml: string;
  references: TechnicalReference[];
  onTriggerClick: (reference: TechnicalReference) => void;
}

// Replaces {{ref:ID}} markers in the raw article HTML with inline
// <button data-ref-id="ID"> triggers, then renders the whole body in one
// pass so the buttons sit correctly inline within their paragraphs.
export default function ArticleBody({
  bodyHtml,
  references,
  onTriggerClick,
}: ArticleBodyProps) {
  const html = useMemo(() => {
    return bodyHtml.replace(/{{ref:([a-z0-9-]+)}}/gi, (_match, id: string) => {
      const reference = references.find((r) => r.id === id);
      if (!reference) return "";
      return `<button type="button" class="tech-trigger" data-ref-id="${reference.id}">${reference.label}</button>`;
    });
  }, [bodyHtml, references]);

  function handleActivate(refId: string | undefined) {
    if (!refId) return;
    const reference = references.find((r) => r.id === refId);
    if (reference) onTriggerClick(reference);
  }

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-ref-id]"
    );
    if (target) handleActivate(target.dataset.refId);
  }

  return (
    <div
      className="prose-journal"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
