import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PARENT_SITE_NAME, PARENT_SITE_URL } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-deep-claret-border/60 bg-void-black/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-sans text-lg font-semibold tracking-tight text-text-primary transition-colors hover:text-ocean-blue-bright"
        >
          Sovereign AI{" "}
          <span className="text-text-muted font-normal">Journal</span>
        </Link>

        <a
          href={PARENT_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-ocean-blue-bright"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to {PARENT_SITE_NAME}
        </a>
      </div>
    </header>
  );
}
