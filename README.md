# Sovereign AI Journal

A community and content hub for the Sovereign AI project — a dedicated
subdomain (`journal.digitalsovereignai.com`) distinct from the core
[digitalsovereignai.com](https://digitalsovereignai.com) consulting
platform. Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

Site identity (domain, brand names) is centralized in `lib/site.ts` — update
it there rather than hardcoding strings in components.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Design system

All color tokens live in `tailwind.config.ts`:

| Token                | Hex                  | Usage                                                        |
|----------------------|----------------------|---------------------------------------------------------------|
| `void-black`         | `#0B0B0E`            | Primary canvas / page background                              |
| `void-black-raised`  | `#111114`            | Slightly lifted panels (cards, drawer, comment cards)          |
| `deep-claret`        | `#4A121E`            | Secondary surfaces, category badges                            |
| `deep-claret-deep`   | `#581825`            | Darker claret variant                                           |
| `deep-claret-border` | `#5C2230`            | Borders, dividers, card outlines                                |
| `ocean-blue`         | `#0077B6`            | Primary CTA / interactive fill                                 |
| `ocean-blue-deep`    | `#0F52BA`            | Hover/active state for CTAs                                     |
| `ocean-blue-bright`  | `#2E9BD6`            | Inline technical links, active filter text                     |
| `text-primary`       | `#F3F4F6`             | Body copy, headings                                             |
| `text-muted`         | `#9CA3AF`             | Meta info, dates, author tags                                   |

Typography: `Inter` (UI/sans), `Source Serif 4` (long-form article body),
`JetBrains Mono` (code blocks) — configured in `app/layout.tsx` via
`next/font/google` and exposed as CSS variables consumed by
`tailwind.config.ts`.

## Structure

```
app/
  layout.tsx              Root layout, font + metadata setup
  page.tsx                 Home feed: hero, category filters, article grid
  blog/[slug]/page.tsx      Article reader with progressive disclosure drawer
  privacy/page.tsx           Privacy policy
  unsubscribed/page.tsx       Confirmation page after a one-click unsubscribe
  admin/page.tsx                Comment moderation + subscriber export (Basic Auth)
  admin/dispatches/page.tsx      Compose / send newsletter issues (Basic Auth)
  robots.ts                   robots.txt — disallows /admin, /api
  sitemap.ts                   Sitemap generated from lib/posts.ts
  globals.css                   Base styles, editorial prose classes, focus states
  api/
    newsletter/route.ts          POST — subscribe an email
    comments/route.ts             GET approved comments for a post, POST a new one
    unsubscribe/route.ts           GET — one-click unsubscribe via per-subscriber token
    admin/comments/route.ts        GET pending comments, PATCH to approve/reject
    admin/subscribers/route.ts      GET subscriber list / CSV export
    admin/dispatches/route.ts        GET history, POST a new draft/sent dispatch
    admin/dispatches/[id]/route.ts    PATCH (save/send) or DELETE a draft dispatch
components/
  Header.tsx              Nav: brand + "Back to Digital Sovereign AI" link
  Footer.tsx               Shared footer with Privacy Policy link
  Hero.tsx                  Compact hero statement
  CategoryFilter.tsx         Interactive taxonomy filter bar (client)
  ArticleCard.tsx              Feed grid card
  ArticleBody.tsx                Renders article HTML, wires inline tech triggers
  TechnicalDrawer.tsx              Slide-over panel for code/diagram/breakdown content
  CommentSection.tsx                 Threaded comments, backed by the comments API
  Newsletter.tsx                      "Sovereign Dispatch" email capture, backed by the newsletter API
lib/
  posts.ts                Mock content + types (swap for CMS/DB later)
  site.ts                  Domain + brand name constants + the CAN-SPAM postal address
  db.ts                     Postgres client (@vercel/postgres) + shared types
  email.ts                   Resend client, branded HTML email template, batched send logic
db/
  schema.sql               Postgres schema: subscribers, comments, dispatches
scripts/
  migrate.ts                Applies db/schema.sql to your database
middleware.ts              HTTP Basic Auth gate for /admin and /api/admin
```

## Progressive disclosure pattern

Article bodies are authored with `{{ref:some-id}}` markers inline in the
copy (see `lib/posts.ts`). `ArticleBody` swaps each marker for an inline
`.tech-trigger` button; clicking one opens `TechnicalDrawer` with the
matching `TechnicalReference` (code preview, diagram placeholder, or
extended breakdown) without navigating away from the article.

## Newsletter, comments, and sending — how data flows

- **Newsletter signup** (`components/Newsletter.tsx` → `POST /api/newsletter`):
  validates the email, inserts into `subscribers` (or re-activates a
  previously unsubscribed address), silently no-ops on bot submissions
  (honeypot field). Every subscriber gets a random `unsubscribe_token`
  at signup.
- **Comments** (`components/CommentSection.tsx` → `GET`/`POST /api/comments`):
  new comments are inserted with `status = 'pending'` and are **not**
  publicly visible until approved. The GET endpoint only ever returns
  `status = 'approved'` rows.
- **Sending a dispatch** (`/admin/dispatches`, password-protected): write a
  subject and body, then **save as draft** or **send now** — there's no
  scheduling or automatic sending; every dispatch goes out because someone
  with the admin password clicked Send. Sending calls Resend's batch API —
  one personalized email per subscriber (never a shared To/BCC list), each
  with that subscriber's own one-click unsubscribe link and your postal
  address in the footer, as CAN-SPAM requires.
- **Unsubscribing**: the link in every email hits `GET /api/unsubscribe`,
  which flips that subscriber's `status` to `unsubscribed` — no login, no
  confirmation click-through, as mailbox providers expect — then shows a
  plain confirmation page.
- **Moderation** (`/admin`): approve/reject pending comments, see your
  subscriber count, export the full list as CSV any time.

## Setting up Resend (required before sending anything real)

1. Create an account at [resend.com](https://resend.com).
2. **Verify a sending domain** — Domains → Add Domain → follow their DNS
   instructions (a few TXT/CNAME records with your DNS provider). You
   cannot send real email until this shows "Verified"; until then, Resend
   will only deliver to your own account's email for testing.
3. Create an **API key** under API Keys — set `RESEND_API_KEY` to it.
4. Set `DISPATCH_FROM_EMAIL` to an address at your verified domain, e.g.
   `"Sovereign AI Journal <dispatch@digitalsovereignai.com>"`.
5. **Free tier limits** (as of writing): 100 emails/day, 3,000/month. A
   send that exceeds this will partially fail — failed batches are logged
   server-side and simply don't count toward `recipient_count`, so check
   your Resend dashboard after a large send. Upgrade on Resend's pricing
   page once your list outgrows the free tier.

## CAN-SPAM / compliance — do this before your first real send

- **Postal address**: `lib/site.ts` has a `COMPANY_POSTAL_ADDRESS` constant
  with an obvious `REPLACE ME` placeholder. US law (and most countries'
  equivalents) requires a valid physical address in every commercial
  email. A PO box or registered agent address is fine — it does not need
  to be your home. **The project will still send emails with the
  placeholder in place; nothing blocks you technically, so this is on
  you to catch.**
- **Unsubscribe**: already handled — every dispatch includes a working
  one-click link, and unsubscribes take effect immediately (no queue,
  no delay).
- **Accurate subject lines / sender identity**: `DISPATCH_FROM_EMAIL`
  and whatever subject you type are what recipients see — no extra setup
  needed, just don't use misleading subject lines.
- If you expect EU/UK or California visitors, have the `/privacy` page
  and your consent flow (currently single opt-in) reviewed by a lawyer —
  see the note already on that page.

## Launch checklist

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create the database.** In your [Vercel](https://vercel.com) project
   dashboard: Storage → Create Database → Postgres (this provisions a
   Neon-backed Postgres instance and wires the env vars automatically).

3. **Set up Resend** — see the section above. You need a verified domain
   and an API key before step 5 will actually deliver anything.

4. **Pull env vars locally**
   ```bash
   npm i -g vercel   # if you don't have the CLI yet
   vercel link       # connect this folder to your Vercel project
   vercel env pull .env.local
   ```
   This fills in `POSTGRES_URL` and friends. Then add the rest yourself to
   `.env.local` (see `.env.example` for the full list):
   ```
   ADMIN_USERNAME=your-choice
   ADMIN_PASSWORD=a-long-random-password
   RESEND_API_KEY=re_...
   DISPATCH_FROM_EMAIL="Sovereign AI Journal <dispatch@digitalsovereignai.com>"
   ```
   Add the same vars in the Vercel dashboard under Settings → Environment
   Variables, so the deployed site has them too.

5. **Fill in your mailing address** in `lib/site.ts`
   (`COMPANY_POSTAL_ADDRESS`) — see the CAN-SPAM section above. Nothing
   stops you from skipping this technically, but don't.

6. **Run the migration** (creates the `subscribers`, `comments`, and
   `dispatches` tables)
   ```bash
   npm run db:migrate
   ```

7. **Verify locally**
   ```bash
   npm run dev
   ```
   Subscribe your own email on the homepage, post a test comment on an
   article, then visit `http://localhost:3000/admin` (you'll be prompted
   for the username/password you set above). Confirm the comment shows up
   pending and the subscriber count increments. Then go to
   `/admin/dispatches`, write a throwaway subject/body, and **send now** —
   confirm you receive it and that the unsubscribe link in the footer
   actually unsubscribes you.

8. **Deploy to Vercel** — push this repo to GitHub/GitLab/Bitbucket and
   import it in Vercel, or run `vercel --prod` from this folder.

9. **Point the domain.** In the Vercel project → Settings → Domains, add
   `journal.digitalsovereignai.com` (or whichever subdomain you prefer —
   change it in `lib/site.ts` first if different) and follow Vercel's
   instructions to add the CNAME record with your DNS provider.

10. **Have a lawyer glance at `/privacy`** before you start collecting
    real emails and comments, especially if you expect visitors from the
    EU/UK or California — the page is accurate but is a plain-language
    starting point, not legal advice.

## Still mock/placeholder, worth knowing before you publicize the site

- **Articles** (`lib/posts.ts`): four sample posts hardcoded in this file,
  as agreed for this launch. Add real posts by editing this file directly
  and redeploying — each post needs a unique `slug`. When you outgrow
  that, moving to MDX files or a headless CMS is the natural next step.
- **Syntax highlighting / diagrams** (`components/TechnicalDrawer.tsx`):
  code panels render as plain monospace text, and diagrams are a labeled
  placeholder box. Both work, neither is dressed up yet — add Shiki/Prism
  and a Mermaid or SVG renderer when you're ready.
- **Per-post SEO metadata**: all article pages currently share the site's
  default title/description/OG image. Add a `generateMetadata` export to
  `app/blog/[slug]/page.tsx` for per-article titles and social previews.
- **Editing a saved draft**: `/admin/dispatches` can create, send, and
  delete dispatches, but there's no "load a draft back into the composer"
  button yet — for now, delete and rewrite a draft you want to change.
  Worth adding once you're sending often.
- **No scheduling**: every dispatch goes out the moment someone clicks
  "Send now" in `/admin/dispatches` — there's no queue-for-later. If you
  want that down the road (a cron-based scheduled send is a natural
  extension of this setup), just ask.
- **Large-list send reliability**: `sendDispatch` in `lib/email.ts` sends
  in batches of 90 with no retry or backoff if Resend rate-limits a batch
  — it logs and moves on. Fine at the list sizes you'll launch with;
  worth hardening (retries, a real queue) once you're past a few hundred
  subscribers or sending very frequently.
