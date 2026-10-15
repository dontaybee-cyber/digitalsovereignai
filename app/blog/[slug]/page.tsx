"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ArticleBody from "@/components/ArticleBody";
import TechnicalDrawer from "@/components/TechnicalDrawer";
import CommentSection from "@/components/CommentSection";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { getPostBySlug, type TechnicalReference } from "@/lib/posts";

export default function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  const [activeReference, setActiveReference] =
    useState<TechnicalReference | null>(null);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Header />
      <main>
        <article className="mx-auto max-w-prose px-6 pt-12 pb-16">
          <span className="inline-block rounded-full border border-deep-claret-border bg-deep-claret/40 px-2.5 py-1 text-xs text-text-primary">
            {post.category}
          </span>

          <h1 className="mt-5 font-sans text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-display-md">
            {post.title}
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-text-muted">
            {post.dek}
          </p>

          <div className="mt-6 flex items-center gap-2 border-b border-deep-claret-border pb-6 text-sm text-text-muted">
            <span className="text-text-primary">{post.author}</span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime}</span>
          </div>

          <div className="mt-8">
            <ArticleBody
              bodyHtml={post.bodyHtml}
              references={post.references}
              onTriggerClick={setActiveReference}
            />
          </div>
        </article>

        <CommentSection postSlug={post.slug} />
        <Newsletter />
        <Footer />
      </main>

      <TechnicalDrawer
        reference={activeReference}
        onClose={() => setActiveReference(null)}
      />
    </>
  );
}
