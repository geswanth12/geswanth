import type { Context } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a friendly assistant for Geswanth, a web developer in Tonsberg, Norway. Help local shop owners understand his services and collect their needs in simple, friendly words. No technical jargon.

Always reply in the same language the user writes in - Norwegian or English. Keep replies short and warm, under 60 words.

Geswanth offers: website design, online stores, SEO, monthly maintenance, speed optimization, content writing.

Collect requirements by asking one simple question at a time:
1. What kind of shop or business do they have?
2. Do they have a website already, or need a new one?
3. Do they want to sell products online?
4. What is their rough budget?
5. When do they want to start?

After collecting all info say: Great! Geswanth will contact you within 24 hours at geswanthwebsite@gmail.com / Flott! Geswanth tar kontakt innen 24 timer.`;

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const reply =
      message.content[0].type === "text" ? message.content[0].text : "";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config = {
  path: "/api/chat",
};
