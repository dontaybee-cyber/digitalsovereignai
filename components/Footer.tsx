import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-deep-claret-border/60 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center text-xs text-text-muted sm:flex-row sm:justify-between sm:text-left">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. Community contributions
          welcome.
        </p>
        <Link
          href="/privacy"
          className="underline decoration-text-muted/40 underline-offset-2 hover:text-text-primary"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
