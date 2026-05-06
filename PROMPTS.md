# AI Prompts Used During Development

All prompts used with AI assistants (Claude, Gemini) during the building of this project.

---

## 1. Project Planning

**Prompt:**
> I want to apply for Cloudflare's SWE internship. They require building an AI-powered app using Workers AI, Durable Objects for memory, and a chat interface. I am a native Android developer with C++ experience. What should I build that is unique, genuinely useful, and achievable in a weekend?

**What I used the response for:** Decided on DebugBuddy — an AI debugging assistant with session memory for pattern detection.

---

## 2. Cloudflare Workers AI Setup

**Prompt:**
> How do I add a Workers AI binding to wrangler.jsonc so I can call Llama 3.3 from inside a Cloudflare Worker written in TypeScript? Show me the exact config and the TypeScript code to call the model.

**What I used the response for:** Added the `"ai": { "binding": "AI" }` block to wrangler.jsonc and learned the `env.AI.run()` API.

---

## 3. Durable Objects for Session Memory

**Prompt:**
> I want each user session in my chat app to have its own isolated memory using Cloudflare Durable Objects. The Durable Object should store an array of chat messages and expose methods to get history, add messages, and clear history. Show me the TypeScript class for this.

**What I used the response for:** Built the `DebugSession` Durable Object class with `getHistory()`, `addMessages()`, and `clearHistory()` methods using `this.ctx.storage`.

---

## 4. Connecting Worker to Durable Object

**Prompt:**
> In my Cloudflare Worker, how do I get a Durable Object instance by a session ID string, call methods on it, and pass the full conversation history to Workers AI? The goal is to have stateful multi-turn conversations per user.

**What I used the response for:** Implemented `env.MY_DURABLE_OBJECT.getByName(sessionId)` and understood how RPC method calls work on Durable Object stubs.

---

## 5. CORS for Cross-Origin Requests

**Prompt:**
> My Cloudflare Worker is on workers.dev and my frontend is on pages.dev. When the frontend calls the Worker API it gets blocked by CORS. How do I add proper CORS headers to a Cloudflare Worker in TypeScript, including handling the OPTIONS preflight request?

**What I used the response for:** Added the `corsHeaders` object and the OPTIONS early return in the Worker fetch handler.

---

## 6. Frontend Markdown + Syntax Highlighting

**Prompt:**
> I have a plain HTML frontend with no framework. The AI responses contain markdown with code blocks. How do I render markdown properly and add syntax highlighting to code blocks using only CDN libraries? I want it to look like a professional chat app.

**What I used the response for:** Integrated `marked.js` for markdown parsing and `highlight.js` with the github-dark theme for code block highlighting. Also learned to call `hljs.highlightElement()` after injecting innerHTML.

---

## 7. Deploying Frontend to Cloudflare Pages

**Prompt:**
> I have a single index.html file I want to deploy to Cloudflare Pages using the wrangler CLI. My project already has a wrangler.jsonc for the Worker. How do I deploy just the public folder to Pages without it conflicting with the Worker config?

**What I used the response for:** Used `npx wrangler pages deploy public --project-name cf-ai-debugbuddy-frontend --branch main` and understood the `--branch` flag requirement.

---

## 8. System Prompt Design

**Prompt:**
> I am building an AI debugging assistant. Write a system prompt for Llama 3.3 that makes it: identify the programming language from the error, explain what went wrong and why, give an exact code fix, and detect recurring patterns across multiple errors in the same session.

**What I used the response for:** Wrote the system prompt used in `src/index.ts` for the DebugBuddy persona.