// AI: Single-question actions — improve | regenerate | translate | answer-key
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  action: z.enum(["improve","regenerate","translate","answer-key"]),
  className: z.string(),
  subject: z.string(),
  questionText: z.string(),
  questionType: z.string(),
  marks: z.number().int().positive(),
  chapter: z.string().optional(),
  difficulty: z.string().optional(),
  targetLanguage: z.string().optional(),
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

    const instructions: Record<string, string> = {
      "improve": `Rewrite the question to be clearer, age-appropriate, and exam-ready. Keep marks/type/chapter the same. Return the improved text and (if MCQ) options + correctAnswer.`,
      "regenerate": `Generate a fresh question on the same chapter (${p.chapter ?? "any"}) with the same marks (${p.marks}) and type (${p.questionType}). Return text and (if MCQ) options + correctAnswer.`,
      "translate": `Translate the question to ${p.targetLanguage ?? "Hindi"}. Keep meaning and difficulty.`,
      "answer-key": `Generate a model answer with step-marking and 1-2 common mistakes for this question.`,
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are an exam author for Indian school papers (${p.className} ${p.subject}).` },
          { role: "user", content: `${instructions[p.action]}\n\nORIGINAL: ${p.questionText}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "question_action_result",
            description: "Returns the rewritten question or answer key.",
            parameters: {
              type: "object",
              properties: {
                text: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correctAnswer: { type: "string" },
                expectedAnswer: { type: "string" },
                stepMarking: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { step: { type: "string" }, marks: { type: "number" } },
                    required: ["step","marks"],
                    additionalProperties: false,
                  },
                },
                commonMistakes: { type: "array", items: { type: "string" } },
              },
              required: ["text"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "question_action_result" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    if (!resp.ok) {
      const t = await resp.text();
      console.error("ai-question-action", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return new Response(args ?? "{\"text\":\"\"}", {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
