// AI: Generate a complete question paper as structured JSON.
// Uses gemini-3-flash-preview — fast enough to fit in the 150s edge timeout while staying high-quality.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  details: z.object({
    examName: z.string(),
    className: z.string(),
    subject: z.string(),
    academicYear: z.string(),
    date: z.string(),
    duration: z.string(),
    maxMarks: z.number().int().positive(),
    language: z.string(),
    institutionName: z.string(),
    template: z.string(),
  }),
  pattern: z.array(z.object({
    sectionLabel: z.string(),
    questionType: z.string(),
    count: z.number().int().positive(),
    marksEach: z.number().int().positive(),
    rule: z.string(),
  })),
  syllabus: z.array(z.object({
    chapterName: z.string(),
    targetMarks: z.number().int().min(0),
    priority: z.string(),
    included: z.boolean(),
  })),
  preferences: z.object({
    source: z.string(),
    difficulty: z.object({ easy: z.number(), medium: z.number(), hard: z.number() }),
    styles: z.array(z.string()),
    avoid: z.array(z.string()),
    answerKey: z.object({
      generateKey: z.boolean(),
      stepMarking: z.boolean(),
      rubric: z.boolean(),
      commonMistakes: z.boolean(),
    }),
  }),
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
    const { details, pattern, syllabus, preferences } = parsed.data;

    const includedChapters = syllabus.filter(c => c.included);
    const systemPrompt = `You are a senior exam paper author for Indian schools (NCERT/CBSE/Karnataka).
Generate question papers that are syllabus-accurate, age-appropriate, and exam-ready.
Honor the target marks per section EXACTLY. Honor difficulty distribution. Stay strictly within the included chapters.
For MCQs: provide exactly 4 options and a correctAnswer.
For case-study: provide a passage in 'text' and put 3 sub-questions in 'subparts'.
Keep wording clear for school students. Use Indian context where natural.`;

    const userPrompt = `Build a paper:
EXAM: ${details.examName} | ${details.className} | ${details.subject} | ${details.academicYear}
DURATION: ${details.duration} | TOTAL MARKS: ${details.maxMarks} | LANGUAGE: ${details.language}
INSTITUTION: ${details.institutionName} | TEMPLATE: ${details.template}

PATTERN (sum must equal ${details.maxMarks}):
${pattern.map(p => `Section ${p.sectionLabel}: ${p.count} × ${p.questionType} (${p.marksEach}m each, ${p.count*p.marksEach} total) — ${p.rule}`).join("\n")}

CHAPTER WEIGHTAGE (only include these):
${includedChapters.map(c => `- ${c.chapterName}: ${c.targetMarks}m (priority: ${c.priority})`).join("\n")}

DIFFICULTY MIX: Easy ${preferences.difficulty.easy}% / Medium ${preferences.difficulty.medium}% / Hard ${preferences.difficulty.hard}%
QUESTION STYLES: ${preferences.styles.join(", ")}
AVOID: ${preferences.avoid.join(", ")}
ANSWER KEY: ${preferences.answerKey.generateKey ? "yes" : "no"} | step-marking: ${preferences.answerKey.stepMarking} | common-mistakes: ${preferences.answerKey.commonMistakes}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "build_paper",
            description: "Returns the complete generated question paper.",
            parameters: {
              type: "object",
              properties: {
                instructions: { type: "string" },
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sectionLabel: { type: "string" },
                      title: { type: "string" },
                      instruction: { type: "string" },
                      questionType: { type: "string" },
                      questions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            text: { type: "string" },
                            marks: { type: "integer", minimum: 1 },
                            options: { type: "array", items: { type: "string" } },
                            correctAnswer: { type: "string" },
                            expectedAnswer: { type: "string" },
                            chapter: { type: "string" },
                            topic: { type: "string" },
                            difficulty: { type: "string", enum: ["easy","medium","hard"] },
                            bloomLevel: { type: "string", enum: ["remember","understand","apply","analyze","evaluate","create"] },
                            commonMistakes: { type: "array", items: { type: "string" } },
                            subparts: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  label: { type: "string" },
                                  text: { type: "string" },
                                  marks: { type: "integer", minimum: 1 },
                                },
                                required: ["label","text","marks"],
                                additionalProperties: false,
                              },
                            },
                          },
                          required: ["text","marks","chapter","difficulty"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["sectionLabel","title","questionType","questions"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["sections","instructions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "build_paper" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    if (!resp.ok) {
      const t = await resp.text();
      console.error("ai-generate-paper", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return new Response(args ?? "{\"sections\":[],\"instructions\":\"\"}", {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
