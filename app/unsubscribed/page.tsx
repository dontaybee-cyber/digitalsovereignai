import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UnsubscribedPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const failed = searchParams.status === "error";

  return (
    <>
      <Header />
      <main className="mx-auto max-w-prose px-6 py-20 text-center">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-text-primary">
          {failed ? "Something went wrong" : "You're unsubscribed"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          {failed
            ? "That unsubscribe link looks invalid or already used. If you're still receiving emails and want this fixed, reach out from the homepage."
            : "You won't receive any more Sovereign Dispatch emails. You can re-subscribe any time from the homepage."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-ocean-blue px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-ocean-blue-deep"
        >
          Back to the Journal
        </Link>
      </main>
      <Footer />
    </>
  );
}
