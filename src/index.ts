import { DurableObject } from "cloudflare:workers";

// Durable Object — stores chat history per session
export class DebugSession extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async getHistory(): Promise<{ role: string; content: string }[]> {
    const history = await this.ctx.storage.get<{ role: string; content: string }[]>("history");
    return history ?? [];
  }

  async addMessages(userMsg: string, assistantMsg: string): Promise<void> {
    const history = await this.getHistory();
    history.push({ role: "user", content: userMsg });
    history.push({ role: "assistant", content: assistantMsg });
    await this.ctx.storage.put("history", history);
  }

  async clearHistory(): Promise<void> {
    await this.ctx.storage.delete("history");
  }
}

// Main Worker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {

    // CORS headers so the frontend can talk to this
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // POST /debug — main endpoint
    if (request.method === "POST" && url.pathname === "/debug") {
      const body = await request.json<{ sessionId: string; message: string }>();
      const { sessionId, message } = body;

      if (!sessionId || !message) {
        return new Response(JSON.stringify({ error: "sessionId and message required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Get the Durable Object for this session
      const stub = env.MY_DURABLE_OBJECT.getByName(sessionId);
      const history = await stub.getHistory();

      // Build messages for the LLM
      const systemPrompt = {
        role: "system",
        content: `You are DebugBuddy, an expert programming assistant specialized in debugging errors and stack traces. 
When given an error:
1. Identify what language/framework it is
2. Explain clearly what went wrong and why
3. Give the exact fix with a code example
4. If you see a pattern across multiple errors in this session, point it out.
Be concise, practical, and direct.`,
      };

      const messages = [systemPrompt, ...history, { role: "user", content: message }];

      // Call Workers AI
      const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages,
      });

      const assistantMessage = aiResponse.response ?? "Sorry, I could not generate a response.";

      // Save to Durable Object
      await stub.addMessages(message, assistantMessage);

      return new Response(JSON.stringify({ response: assistantMessage }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // POST /clear — reset session history
    if (request.method === "POST" && url.pathname === "/clear") {
      const body = await request.json<{ sessionId: string }>();
      const stub = env.MY_DURABLE_OBJECT.getByName(body.sessionId);
      await stub.clearHistory();
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response("DebugBuddy API is running", { headers: corsHeaders });
  },
} satisfies ExportedHandler<Env>;