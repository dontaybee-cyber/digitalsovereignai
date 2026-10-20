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
    slug: "local-ai-boilerplate",
    title: "Building a Local AI Boilerplate That Stays on One Machine",
    dek: "How we took a Docker-based local AI stack (Ollama, SearXNG, Open WebUI) from a working draft to a hardened, single-device boilerplate, step by step.",
    category: "Sovereign Tech",
    author: "Dontay Beemon",
    date: "2026-10-19",
    readTime: "5 min read",
    references: [
      {
        id: "project-layout",
        label: "the project layout",
        kind: "code",
        title: "Starting project layout",
        description: "The folder structure we started from. Your own copy may have grown since.",
        language: "text",
        code: `sovereign-ai/
├── .gitignore
├── docker-compose.yml
├── setup.sh
├── system-prompt.txt
└── searxng/
    └── settings.yml`,
      },
      {
        id: "verify-commands",
        label: "a short set of checks",
        kind: "code",
        title: "First-run checks",
        description: "Confirm prerequisites, run setup, then check each service on its own before using the chat interface.",
        language: "bash",
        code: `docker --version
docker compose version
chmod +x setup.sh
./setup.sh
docker compose ps
docker exec sovereign_ollama ollama list
docker compose logs searxng
docker compose logs -f`,
      },
    ],
    bodyHtml: `
      <p>We set out to build a boilerplate for an AI assistant that lives entirely on one machine: no accounts, no API keys, no cloud service required. This post covers what the stack is, every change we made to harden it, and where the project stands now that it has moved into testing.</p>

      <h2>What the stack is</h2>
      <p>Three services run together under Docker Compose. <strong>Ollama</strong> runs the language model (we used llama3.1). <strong>Open WebUI</strong> is the chat interface. <strong>SearXNG</strong> is a self-hosted meta-search engine that gives the assistant optional access to live web results. Everything is bound to localhost, so nothing is exposed to your network by default.</p>
      <p>A setup script handles first-run work, and a system prompt file defines how the assistant behaves.</p>

      <h2>How local is local?</h2>
      <p>After the one-time downloads of the container images and the model, the core stack is designed to need nothing from the outside. The one exception is SearXNG, which is optional. When you use it, it queries public search engines on your behalf, so those searches do leave the machine. Leave it out and the assistant runs fully self-contained.</p>

      <h2>Get the project</h2>
      <p>The current version of the boilerplate is available as a single zip. It matches the steps described below and is still in testing.</p>
      <p><a class="download-link" href="/downloads/sovereign-ai-boilerplate.zip" download>Download sovereign-ai-boilerplate.zip</a></p>
      <p>Before you run it, read through the compose file and the system prompt so you know exactly what it does on your machine.</p>

      <h2>The steps we took</h2>
      <ol>
        <li><strong>Defined the goal.</strong> One device or server, fully self-contained, with no accounts or outside services needed for normal use.</li>
        <li><strong>Audited the original boilerplate.</strong> We reviewed the compose file, the SearXNG settings, the system prompt, and the setup script under one rule: upgrades and efficiency fixes only, with no loss of functionality.</li>
        <li><strong>Added health checks.</strong> Open WebUI now waits until Ollama and SearXNG report healthy, instead of starting as soon as their containers exist.</li>
        <li><strong>Turned telemetry off.</strong> The stack sets ANONYMIZED_TELEMETRY=False and DO_NOT_TRACK=1 so nothing phones home by default.</li>
        <li><strong>Hardened all three containers.</strong> Ollama and Open WebUI now drop all Linux capabilities and enable no-new-privileges, matching what SearXNG already had.</li>
        <li><strong>Removed the obsolete version key</strong> from the compose file, which modern Docker Compose ignores with a warning.</li>
        <li><strong>Made the setup script safer.</strong> It now stops on errors, checks that Docker is installed, avoids overwriting an existing SearXNG key when re-run, and times out instead of waiting forever for Ollama to start.</li>
        <li><strong>Added SearXNG timeouts and retries</strong> so one slow search engine cannot stall a query indefinitely.</li>
        <li><strong>Kept image tags on latest, with a marked line for pinning.</strong> That is fine for a first run. Pin exact versions when you want reproducible builds.</li>
        <li><strong>Added a session secret, then took it back out.</strong> We first generated a WEBUI_SECRET_KEY in an .env file. It was only a locally generated string for signing session cookies, but it was unnecessary: Open WebUI creates its own key and stores it in its persistent data folder. We reverted, so there is no .env file and no manual key handling.</li>
        <li><strong>Moved the project into a real folder in VS Code.</strong> We set up {{ref:project-layout}} and added the Docker and YAML extensions for container status and config validation.</li>
        <li><strong>Added a .gitignore.</strong> It keeps the data folder (chat history, uploads, local accounts) and any .env files out of version control.</li>
        <li><strong>Ran setup and checked each service on its own.</strong> Before any end-to-end use, we ran {{ref:verify-commands}} to confirm all three containers were healthy and the model was installed.</li>
        <li><strong>Removed the remaining third-party dependencies.</strong> After the IDE pass, the only outside service the stack can use is the optional SearXNG.</li>
        <li><strong>Gave the assistant an onboarding routine.</strong> The system prompt now has it begin by asking the user to give it a name, then asking what it is supposed to learn.</li>
        <li><strong>Moved to testing.</strong> The next test is a question that needs a live web search, run with the container logs open so the full path from SearXNG to Open WebUI to Ollama can be watched.</li>
      </ol>

      <h2>Where it stands</h2>
      <p>The boilerplate is in testing, so treat the claims above as design intent until the results are in. We will report what the logs show.</p>
      <p>Two housekeeping notes for anyone building from this: keep the data folder out of git, since it holds your chat history, and consider pinning image versions once you have a configuration you trust.</p>
    `,
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
