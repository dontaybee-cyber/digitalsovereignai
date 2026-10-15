"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Send, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "submitted" | "error";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot, kept empty by real users
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.includes("@")) {
      setStatus("error");
      setErrorMessage("Enter a valid email to subscribe.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("submitted");
    } catch {
      setStatus("error");
      setErrorMessage("Could not reach the server. Check your connection and try again.");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-lg border border-deep-claret-border bg-deep-claret/20 px-6 py-10 sm:px-12">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-text-primary">
            The Sovereign Dispatch
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            One email, every other week. Field notes, releases we're
            watching, and the arguments happening inside the community.
          </p>

          {status === "submitted" ? (
            <p className="mt-6 rounded-md border border-ocean-blue/40 bg-ocean-blue/10 px-4 py-3 text-sm text-ocean-blue-bright">
              You're subscribed. Watch your inbox for the next Dispatch.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              noValidate
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@domain.com"
                className="flex-1 rounded-md border border-deep-claret-border bg-void-black px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-ocean-blue focus:outline-none"
                aria-invalid={status === "error"}
                aria-describedby={
                  status === "error" ? "newsletter-error" : undefined
                }
                disabled={status === "loading"}
              />

              {/* Honeypot: hidden from real users via CSS, bots fill it in. */}
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

              <button
                type="submit"
                disabled={status === "loading"}
                className="flex items-center justify-center gap-2 rounded-md bg-ocean-blue px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-ocean-blue-deep disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    Subscribing
                    <Loader2 size={14} className="animate-spin" />
                  </>
                ) : (
                  <>
                    Subscribe
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <p id="newsletter-error" className="mt-3 text-xs text-red-400">
              {errorMessage}
            </p>
          )}

          <p className="mt-4 text-xs text-text-muted">
            No spam. Unsubscribe any time. See the{" "}
            <Link
              href="/privacy"
              className="underline decoration-text-muted/40 underline-offset-2 hover:text-text-primary"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
