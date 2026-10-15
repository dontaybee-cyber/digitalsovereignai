import Link from "next/link";
import type { Post } from "@/lib/posts";

const CATEGORY_STYLES: Record<string, string> = {
  "Sovereign Tech": "bg-deep-claret/40 text-ocean-blue-bright border-deep-claret-border",
  "The Mission": "bg-deep-claret/40 text-text-primary border-deep-claret-border",
  "AI Ethics/Philosophy": "bg-deep-claret/40 text-text-primary border-deep-claret-border",
  "The Good, The Bad, The Artificial":
    "bg-deep-claret/40 text-text-primary border-deep-claret-border",
};

export default function ArticleCard({ post }: { post: Post }) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col justify-between rounded-lg border border-deep-claret-border/70 bg-void-black-raised/40 p-6 shadow-card transition-colors duration-150 hover:border-ocean-blue/50"
    >
      <div>
        <span
          className={`inline-block rounded-full border px-2.5 py-1 text-xs ${
            CATEGORY_STYLES[post.category]
          }`}
        >
          {post.category}
        </span>

        <h2 className="mt-4 font-sans text-xl font-semibold leading-snug tracking-tight text-text-primary transition-colors group-hover:text-ocean-blue-bright">
          {post.title}
        </h2>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted">
          {post.dek}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-text-muted">
        <span>{post.author}</span>
        <span aria-hidden="true">·</span>
        <span>{formattedDate}</span>
        <span aria-hidden="true">·</span>
        <span>{post.readTime}</span>
      </div>
    </Link>
  );
}
