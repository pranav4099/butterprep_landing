// AI: Suggest a section pattern for a given class/subject/marks/duration.
// Returns rows of { sectionLabel, questionType, count, marksEach, rule }.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  className: z.string().min(1),
  subject: z.string().min(1),
  maxMarks: z.number().int().positive(),
  duration: z.string().min(1),
  examName: z.string().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { className, subject, maxMarks, duration, examName } = parsed.data;

    const systemPrompt = `You are an exam architect for Indian schools (NCERT/CBSE/Karnataka board).
You design balanced question paper section patterns. Respect total marks exactly.
Use these question types only: mcq, true-false, fill-blank, match, short-answer, long-answer, case-study.
Keep section labels as A, B, C… in order.`;

    const userPrompt = `Design a section pattern for:
- Class: ${className}
- Subject: ${subject}
- Total marks: ${maxMarks}
- Duration: ${duration}
- Exam: ${examName ?? "Standard exam"}

Return 3-6 sections that sum exactly to ${maxMarks} marks.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_pattern",
            description: "Returns the suggested section pattern.",
            parameters: {
              type: "object",
              properties: {
                rows: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sectionLabel: { type: "string" },
                      questionType: { type: "string", enum: ["mcq","true-false","fill-blank","match","short-answer","long-answer","case-study"] },
                      count: { type: "integer", minimum: 1 },
                      marksEach: { type: "integer", minimum: 1 },
                      rule: { type: "string" },
                    },
                    required: ["sectionLabel","questionType","count","marksEach","rule"],
                    additionalProperties: false,
                  },
                },
                rationale: { type: "string" },
              },
              required: ["rows","rationale"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_pattern" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a minute." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Lovable AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const out = args ? JSON.parse(args) : { rows: [], rationale: "" };

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-suggest-pattern error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
