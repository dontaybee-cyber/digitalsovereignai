export type Category =
  | "Sovereign Tech"
  | "The Mission"
  | "AI Ethics/Philosophy"
  | "The Good, The Bad, The Artificial";

export const CATEGORIES: Category[] = [
  "Sovereign Tech",
  "The Mission",
  "AI Ethics/Philosophy",
  "The Good, The Bad, The Artificial",
];

export interface TechnicalReference {
  id: string;
  label: string;
  kind: "code" | "diagram" | "breakdown";
  title: string;
  description: string;
  code?: string;
  language?: string;
}

export interface Post {
  slug: string;
  title: string;
  dek: string;
  category: Category;
  author: string;
  date: string;
  readTime: string;
  bodyHtml: string; // paragraphs, with {{ref:ID}} markers for technical triggers
  references: TechnicalReference[];
}

export const posts: Post[] = [
  {
    slug: "who-controls-the-weights",
    title: "Who Controls the Weights, Controls the Future",
    dek: "Model ownership is the new land ownership. Here's why decentralized custody of weights matters more than decentralized compute.",
    category: "Sovereign Tech",
    author: "M. Okafor",
    date: "2026-08-14",
    readTime: "7 min read",
    references: [
      {
        id: "shard-consensus",
        label: "sharded weight consensus",
        kind: "diagram",
        title: "Sharded Weight Consensus Flow",
        description:
          "How a model's parameter shards are distributed across independent nodes and reconciled without a single custodian ever holding the full weight set.",
      },
      {
        id: "verify-inference",
        label: "verifiable inference proof",
        kind: "code",
        title: "Verifiable Inference Proof (pseudocode)",
        description:
          "A simplified sketch of how a node proves it ran the declared model on the declared input, without revealing the weights themselves.",
        language: "python",
        code: `def verify_inference(commitment, input_hash, output, proof):
    # commitment: hash of the model weights, published on-chain
    # proof: zk-SNARK proof of correct execution
    expected = derive_expected_root(commitment, input_hash)
    return zk_verify(proof, expected, output)`,
      },
    ],
    bodyHtml: `
      <p>Every cycle of computing has a resource that determines who holds power. Mainframes: floor space. PCs: distribution. Cloud: capital. For AI, it isn't compute anymore &mdash; it's the weights themselves.</p>
      <p>A frontier model's weights are the actual embodiment of billions of dollars of training runs, curated data, and tuning decisions. Whoever custodies them unilaterally can revoke access, change behavior overnight, or simply disappear. That's not a hypothetical; we've watched it happen to entire developer ecosystems built on a single vendor's goodwill.</p>
      <p>The sovereign alternative isn't "run everything locally," which is a nice slogan but ignores the reality that most useful models won't fit on a laptop for years. The real alternative is {{ref:shard-consensus}}: splitting a model's parameters across independent, mutually distrustful custodians so no single party can unilaterally alter or withhold it.</p>
      <p>The obvious objection is trust: if I don't hold the full model, how do I know the inference I got back actually came from it, unaltered? This is where {{ref:verify-inference}} comes in &mdash; cryptographic proofs that let a node demonstrate it executed the committed model on your input, without ever exposing the weights to you or anyone else.</p>
      <h2>This isn't about ideology, it's about incentives</h2>
      <p>None of this requires believing centralized labs are malicious. It requires believing that concentrated control over a foundational technology is a structural risk, independent of the intentions of whoever currently holds it. Sovereignty is a hedge against a future custodian you haven't met yet.</p>
      <p>We'll spend the next several posts in this series walking through the actual mechanics &mdash; consensus overhead, latency tradeoffs, and where this genuinely doesn't work yet. This is engineering, not a manifesto.</p>
    `,
  },
  {
    slug: "why-we-built-this",
    title: "Why We Built This Instead of Just Talking About It",
    dek: "A short account of what the Sovereign AI mission actually is, and what it deliberately isn't.",
    category: "The Mission",
    author: "R. Vance",
    date: "2026-08-02",
    readTime: "5 min read",
    references: [],
    bodyHtml: `
      <p>There's no shortage of people willing to describe what decentralized AI should look like. There's a much shorter list of people willing to spend two years building the boring plumbing that makes it real.</p>
      <p>This community exists for the second group, and for the people who want to understand what they're building well enough to ask hard questions. We're not interested in tribal signaling about which lab is good or bad this week. We're interested in whether the systems we ship actually reduce single points of failure and control.</p>
      <p>That means we'll publish things that are unglamorous: benchmark writeups that don't flatter us, postmortems on approaches that didn't pan out, and long technical explainers that assume you're smart but not necessarily an ML researcher.</p>
      <h2>What "sovereign" means here</h2>
      <p>Not "no rules." Not "no companies." It means no party &mdash; including us &mdash; should be a mandatory chokepoint for whether your model runs tomorrow.</p>
    `,
  },
  {
    slug: "the-alignment-tax-nobody-mentions",
    title: "The Alignment Tax Nobody Mentions",
    dek: "Safety tuning has real, measurable costs on model behavior. Pretending otherwise doesn't help anyone build better systems.",
    category: "AI Ethics/Philosophy",
    author: "D. Ferreira",
    date: "2026-07-21",
    readTime: "9 min read",
    references: [
      {
        id: "rlhf-tradeoff",
        label: "reward model tradeoff curve",
        kind: "breakdown",
        title: "RLHF Reward-Helpfulness Tradeoff",
        description:
          "A conceptual breakdown of how aggressive reward shaping during RLHF tends to trade raw task performance for compliance, and why that curve isn't linear.",
      },
    ],
    bodyHtml: `
      <p>Ask most people building consumer AI products whether alignment tuning changes model capability, and you'll get a diplomatic non-answer. Ask the researchers actually running the ablations, and you'll get a much more interesting conversation.</p>
      <p>Every round of safety tuning shifts a model's behavior distribution. Sometimes that shift is exactly what you want &mdash; refusing genuinely dangerous requests. Sometimes it's collateral damage: a model that hedges on benign technical questions because hedging was rewarded during training. The {{ref:rlhf-tradeoff}} isn't a scandal, it's just a real engineering tradeoff that deserves to be discussed honestly instead of denied.</p>
      <h2>Why this matters for a sovereign ecosystem</h2>
      <p>If we're serious about communities running their own models with their own tuning choices, we need vocabulary for these tradeoffs that isn't borrowed from a PR department. Transparency about the tax is what lets a community decide, deliberately, how much of it they want to pay.</p>
      <p>We don't have a tidy answer here. We have a series of experiments coming, and we'll show you the ugly middle of the process, not just the conclusion.</p>
    `,
  },
  {
    slug: "a-week-of-open-weight-releases",
    title: "A Week of Open-Weight Releases: The Good, the Bad, the Artificial",
    dek: "Three releases, three very different sets of promises kept and broken. A field report.",
    category: "The Good, The Bad, The Artificial",
    author: "S. Okonkwo",
    date: "2026-08-28",
    readTime: "6 min read",
    references: [],
    bodyHtml: `
      <p>It was a strange week. Three labs shipped open-weight models within four days of each other, and the coverage treated all three as equivalent events. They weren't.</p>
      <p>One release shipped with a genuinely permissive license and full training data provenance. Another shipped weights with a license that quietly forbade competitive commercial use &mdash; open in name, closed in function. The third was, generously, a fine-tune wearing a new model's clothes.</p>
      <h2>The good</h2>
      <p>Full provenance releases are rare enough that they deserve real credit when they happen. It lets the community actually audit training data concerns instead of taking safety claims on faith.</p>
      <h2>The bad, and the artificial</h2>
      <p>"Open-weight" has become a marketing term untethered from what it used to mean. We'd rather a lab be honest about a restrictive license than call it open and hope nobody reads the fine print.</p>
    `,
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
