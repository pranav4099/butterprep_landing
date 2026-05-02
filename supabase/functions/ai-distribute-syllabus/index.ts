// AI: Auto-distribute target marks across selected chapters.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  className: z.string().min(1),
  subject: z.string().min(1),
  maxMarks: z.number().int().positive(),
  chapters: z.array(z.object({
    chapterId: z.string(),
    chapterName: z.string(),
    priority: z.enum(["low","medium","high"]),
    included: z.boolean(),
  })).min(1),
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

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You distribute exam marks across syllabus chapters. Honor 'priority' (high>medium>low). The total MUST equal the target. Excluded chapters get 0." },
          { role: "user", content: `Class: ${parsed.data.className}\nSubject: ${parsed.data.subject}\nTarget total: ${parsed.data.maxMarks}\nChapters:\n${parsed.data.chapters.map(c => `- ${c.chapterName} (id=${c.chapterId}, priority=${c.priority}, included=${c.included})`).join("\n")}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "distribute_marks",
            description: "Returns a marks allocation per chapter.",
            parameters: {
              type: "object",
              properties: {
                allocations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      chapterId: { type: "string" },
                      targetMarks: { type: "integer", minimum: 0 },
                    },
                    required: ["chapterId","targetMarks"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["allocations"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "distribute_marks" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    if (!resp.ok) {
      const t = await resp.text();
      console.error("ai-distribute-syllabus", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return new Response(args ?? "{\"allocations\":[]}", {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
