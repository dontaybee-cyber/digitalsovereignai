// Central place for site-wide identity values. Pull from here instead of
// hardcoding the domain/brand name in individual components.
export const SITE_NAME = "Sovereign AI Journal";
export const SITE_URL = "https://journal.digitalsovereignai.com";
export const PARENT_SITE_NAME = "Digital Sovereign AI";
export const PARENT_SITE_URL = "https://digitalsovereignai.com";

// REQUIRED before sending any real newsletter email: US CAN-SPAM law (and
// most other countries' anti-spam laws) requires every commercial email
// to include a valid physical postal address. Replace this placeholder —
// a registered agent address or PO box is fine, it does not need to be
// your home address — before you send a real dispatch. lib/email.ts
// renders this directly into the footer of every email.
export const COMPANY_POSTAL_ADDRESS =
  "REPLACE ME: Digital Sovereign AI, [Street Address], [City, State ZIP]";
