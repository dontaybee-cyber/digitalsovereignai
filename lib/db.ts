import { sql } from "@vercel/postgres";

export { sql };

export interface Subscriber {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  source: string | null;
  unsubscribe_token: string;
  created_at: string;
}

export interface Dispatch {
  id: string;
  subject: string;
  body_text: string;
  status: "draft" | "sent";
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_slug: string;
  parent_id: string | null;
  author_name: string;
  author_email: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/**
 * Basic email shape check. Not exhaustive RFC 5322 validation — good
 * enough to catch typos and junk without rejecting real addresses.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
