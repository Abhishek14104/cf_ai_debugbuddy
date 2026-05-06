An AI-powered debugging assistant built on Cloudflare's developer platform. Paste any error or stack trace and get an instant explanation, root cause analysis, and exact fix — with memory across your session to detect recurring patterns.

## Live Demo
**Frontend:** https://cf-ai-debugbuddy-frontend.pages.dev
**Backend:** https://cf-ai-debugbuddy.abhishek14104.workers.dev

## Architecture
[Cloudflare Pages] → [Cloudflare Worker] → [Workers AI - Llama 3.3]
↕
[Durable Objects - session memory]

- **Frontend:** Static HTML/CSS/JS hosted on Cloudflare Pages
- **Worker:** TypeScript HTTP API handling routing and AI calls
- **Workers AI:** Llama 3.3 70B for error analysis and fixes
- **Durable Objects:** Per-session chat history with pattern detection

## Features
- Paste any error or stack trace (C++, Python, Java, JavaScript, Rust, Go...)
- Get language detection, root cause explanation, and a working code fix
- Session memory — DebugBuddy remembers your errors and spots patterns
- New session button to reset context

## Running Locally

### Prerequisites
- Node.js v22+
- Cloudflare account

### Setup
```bash
git clone https://github.com/Abhishek14104/cf_ai_debugbuddy.git
cd cf_ai_debugbuddy
npm install
npx wrangler login
npm run dev
```

Then open `public/index.html` in your browser.
The Worker runs at `http://localhost:8787`.

### Deploy
```bash
npm run deploy
npx wrangler pages deploy public --project-name cf-ai-debugbuddy-frontend --branch main
```

## Project Structure
cf_ai_debugbuddy/
├── src/
│   └── index.ts          # Worker + Durable Object logic
├── public/
│   └── index.html        # Frontend (Cloudflare Pages)
├── wrangler.jsonc         # Cloudflare config
├── README.md
└── PROMPTS.md
