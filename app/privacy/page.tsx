import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects and uses your information.`,
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-prose px-6 py-14">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-text-primary">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-text-muted">Last updated: October 2026</p>

        <div className="prose-journal mt-8">
          <p>
            This page explains what information {SITE_NAME} collects when you
            use this site, why, and what you can do about it. We collect the
            minimum needed to run the newsletter and comment sections below
            — nothing is sold, and nothing is shared beyond what's described
            here.
          </p>

          <h2>What we collect</h2>
          <p>
            <strong>Newsletter signups:</strong> your email address, and the
            date you subscribed. That's it — no name, no tracking pixel tied
            to your identity beyond standard email delivery stats.
          </p>
          <p>
            <strong>Comments:</strong> the name you type in, the comment
            text, and — only if you choose to provide one — an email address
            used solely so we can follow up with you about your comment. We
            do not publish your email address, and it is never shown to
            other visitors.
          </p>
          <p>
            <strong>Standard server logs:</strong> like most websites, our
            hosting provider automatically logs basic technical data (IP
            address, browser type, pages requested) for security and
            reliability. We don't use this for tracking or advertising.
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>Email addresses are used to send the Sovereign Dispatch newsletter you signed up for, and nothing else.</li>
            <li>Comments are reviewed before they appear publicly, to keep discussion on-topic and spam-free.</li>
            <li>We do not sell, rent, or trade your information to third parties.</li>
          </ul>

          <h2>Where it's stored</h2>
          <p>
            Subscriber and comment data is stored in a managed Postgres
            database (Vercel Postgres / Neon). The site itself is hosted on
            Vercel. Both providers process data on our behalf under their
            own security and privacy commitments; neither uses your data for
            their own purposes.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>Every newsletter email includes an unsubscribe link. You can also email us directly to be removed.</li>
            <li>To request that a comment or subscription be deleted, contact us using the details below.</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            This site does not use advertising or cross-site tracking
            cookies. Any cookies in use are strictly functional (for
            example, remembering your place in a form).
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy, or a request to access or delete
            your data? Reach out through{" "}
            <Link
              href="/"
              className="text-ocean-blue-bright underline decoration-ocean-blue/40 underline-offset-2 hover:text-ocean-blue"
            >
              the main site
            </Link>
            .
          </p>

          <blockquote>
            This policy is a plain-language summary, not a substitute for
            legal advice. If you expect visitors from the EU/UK (GDPR) or
            California (CCPA/CPRA), have this reviewed by a lawyer before
            launch to confirm it covers your specific obligations.
          </blockquote>
        </div>
      </main>
    </>
  );
}
