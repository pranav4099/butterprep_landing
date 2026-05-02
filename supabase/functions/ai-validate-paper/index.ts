// AI: Qualitative paper validation — wording clarity, syllabus match, duplicates, balance.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  className: z.string(),
  subject: z.string(),
  paperSummary: z.string(),
  includedChapters: z.array(z.string()),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const p = parsed.data;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You review school exam papers for wording clarity, syllabus match, duplicate questions, difficulty balance, and chapter coverage. Be concise and actionable." },
          { role: "user", content: `Class ${p.className} - ${p.subject}\nIncluded chapters: ${p.includedChapters.join(", ")}\n\nPAPER:\n${p.paperSummary}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "validate_paper",
            description: "Returns qualitative validation issues.",
            parameters: {
              type: "object",
              properties: {
                issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      severity: { type: "string", enum: ["error","warning","info"] },
                      message: { type: "string" },
                      affectedBlock: { type: "string" },
                      suggestedFix: { type: "string" },
                    },
                    required: ["severity","message"],
                    additionalProperties: false,
                  },
                },
                summary: {
                  type: "object",
                  properties: {
                    wordingClarity: { type: "string", enum: ["good","fair","poor"] },
                    syllabusMatch: { type: "string", enum: ["matched","partial","off-syllabus"] },
                    duplicateRisk: { type: "string", enum: ["low","medium","high"] },
                    difficultyBalance: { type: "string", enum: ["balanced","easy-skewed","hard-skewed"] },
                  },
                  required: ["wordingClarity","syllabusMatch","duplicateRisk","difficultyBalance"],
                  additionalProperties: false,
                },
              },
              required: ["issues","summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "validate_paper" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    if (!resp.ok) {
      const t = await resp.text();
      console.error("ai-validate-paper", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return new Response(args ?? "{\"issues\":[],\"summary\":{}}", {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
