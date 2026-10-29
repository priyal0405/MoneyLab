// Money Lab: RBI Policy Explainer backend (Cloudflare Worker).
//
// The browser sends { text, language } here; this Worker adds the secret
// ANTHROPIC_API_KEY and asks Claude for a plain-language explanation, so the
// key never reaches the browser.
//
// Single file with no imports, so it can be pasted straight into Cloudflare's
// web editor (no Node/npm needed). That's why it calls the API with fetch
// instead of the Anthropic SDK.
//
// Settings (Cloudflare → your Worker → Settings → Variables and Secrets):
//   ANTHROPIC_API_KEY  (Secret)  your key from console.anthropic.com
//   ALLOWED_ORIGIN     (Text, optional)  e.g. https://moneylab.in to only allow your site

const MODEL = "claude-opus-5-5";
const MAX_INPUT_CHARS = 4000;

const SYSTEM_PROMPT = `You explain Reserve Bank of India (RBI) monetary policy news to young, first-time investors in India (school and college students, people with their first job). They are smart but new to finance.

The user pastes a headline, news snippet or RBI announcement. Explain what it means for an ordinary person's loans, savings and everyday prices.

Guidelines:
- Use short sentences and everyday words. Explain any jargon you can't avoid (repo rate, CRR, basis points, inflation, liquidity, "stance").
- Use Indian context and ₹ examples (home/car/education loans, EMIs, FDs, savings accounts, groceries, fuel).
- Be accurate. RBI decisions take months to fully reach loan and deposit rates, and banks decide their own rates. Say so where it matters, rather than overstating effects.
- Only use facts that are in the pasted text plus general, well-established knowledge of how RBI policy works. Don't invent numbers, dates or decisions that aren't in the text. If the text is vague, say what is unclear.
- This is education, not advice. Never tell the reader to buy, sell or invest in anything specific.
- If the text is not about RBI, interest rates, inflation or Indian banking/money policy, set is_relevant to false and use summary to politely say what kind of text works; keep the other fields short.
- For each impact, "direction" is the likely short-term effect on that thing for a typical person: "up", "down", "same" or "unclear".
  - loans: the interest rate / EMI on loans
  - savings: the interest earned on FDs and savings
  - prices: everyday prices (inflation)`;

const LANGUAGE_RULES = {
  en: "Write every text field in simple English.",
  hi: "Write every text field in simple, conversational Hindi (Devanagari script), the way a friendly teacher would speak. Keep common terms like EMI, FD, repo rate in English in brackets where it helps, e.g. रेपो रेट (repo rate). Keep the direction values in English exactly as specified."
};

const impact = {
  type: "object",
  properties: {
    direction: { type: "string", enum: ["up", "down", "same", "unclear"] },
    explanation: { type: "string", description: "2-3 short sentences with a ₹ example where useful." }
  },
  required: ["direction", "explanation"],
  additionalProperties: false
};

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    is_relevant: { type: "boolean" },
    summary: { type: "string", description: "One or two sentences: what happened, in plain words." },
    why: { type: "string", description: "2-4 sentences: why RBI likely did this (or what is driving it)." },
    loans: impact,
    savings: impact,
    prices: impact,
    key_terms: {
      type: "array",
      description: "Up to 4 jargon words from the text, explained simply.",
      items: {
        type: "object",
        properties: { term: { type: "string" }, meaning: { type: "string" } },
        required: ["term", "meaning"],
        additionalProperties: false
      }
    },
    takeaway: { type: "string", description: "One sentence: the single thing a young person should remember. Not investment advice." }
  },
  required: ["is_relevant", "summary", "why", "loans", "savings", "prices", "key_terms", "takeaway"],
  additionalProperties: false
};

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    const reply = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return reply({ error: "Send a POST request." }, 405);
    if (!env.ANTHROPIC_API_KEY) return reply({ error: "The server has no API key set up yet." }, 500);

    let text, language;
    try {
      ({ text, language } = await request.json());
    } catch {
      return reply({ error: "Couldn't read the request." }, 400);
    }
    text = String(text || "").trim();
    language = language === "hi" ? "hi" : "en";
    if (text.length < 10) return reply({ error: "Please paste a longer headline or paragraph." }, 400);
    if (text.length > MAX_INPUT_CHARS) return reply({ error: `Please keep it under ${MAX_INPUT_CHARS} characters.` }, 400);

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2026-10-21",
        // If Claude declines a request, the API retries it on a fallback model.
        "anthropic-beta": "server-side-fallback-2026-07-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 16000,
        fallbacks: "default",
        output_config: {
          effort: "low",
          format: { type: "json_schema", schema: OUTPUT_SCHEMA }
        },
        system: SYSTEM_PROMPT + "\n\n" + LANGUAGE_RULES[language],
        messages: [{ role: "user", content: `Explain this:\n\n<news>\n${text}\n</news>` }]
      })
    });

    if (!apiRes.ok) {
      const detail = await apiRes.text();
      console.log("Anthropic API error", apiRes.status, detail);
      const busy = apiRes.status === 429 || apiRes.status === 529;
      return reply({ error: busy ? "The AI is busy right now. Try again in a minute." : "The AI couldn't answer this time. Please try again." }, 502);
    }

    const message = await apiRes.json();
    if (message.stop_reason === "refusal") {
      return reply({ error: "The AI couldn't explain this text. Try a different headline." }, 422);
    }
    if (message.stop_reason === "max_tokens") {
      return reply({ error: "The answer got cut off. Try a shorter text." }, 502);
    }

    const textBlock = (message.content || []).find((b) => b.type === "text");
    try {
      return reply({ result: JSON.parse(textBlock.text) });
    } catch {
      return reply({ error: "The AI's answer came back in the wrong format. Please try again." }, 502);
    }
  }
};
