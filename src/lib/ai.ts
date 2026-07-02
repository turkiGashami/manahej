import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabasePublicClient } from './supabase/server';
import { localizedName } from './taxonomy';
import { localizedContributorName, localizedTitle } from './utils';
import type { CurriculumWithRefs } from '@/types/database';

// Default to the latest, most capable model; overridable without code changes.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

export const isAiConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

export type AskResult = {
  configured: boolean;
  ok: boolean;
  refused: boolean;
  answer: string;
  items: CurriculumWithRefs[];
};

const SELECT_WITH_REFS = `
  *,
  stage:stages!inner(slug,name_ar,name_en),
  subject:subjects!inner(slug,name_ar,name_en),
  language:languages!inner(code,name_ar,name_en,direction),
  contributor:contributors!inner(name_ar,name_en,type)
`;

const SYSTEM = `You are a helpful librarian assistant for "Manahej", a free library of Islamic (Sharia) curricula. Your ONLY job is to help the visitor find suitable curricula FROM THE PROVIDED CATALOG.

Hard rules — never break these:
1. Recommend ONLY items that appear in the provided catalog. Never invent titles or slugs. Every slug you return must be copied verbatim from the catalog.
2. You are NOT a mufti or a scholar. Do NOT issue religious rulings, fatwas, or answer "is X permissible / halal / haram / what is the ruling on…" questions. If the user asks for a ruling or a religious opinion, set "refused" to true and, in "answer", politely explain that this platform only helps find curricula and they should consult a qualified scholar (اهل العلم) for rulings. You may still suggest relevant curricula on the topic if any exist.
3. Answer in the SAME language as the user's question (Arabic or English). Keep "answer" concise (2–4 sentences): briefly say what you recommend and why. Do not restate the whole catalog.
4. If nothing in the catalog fits, set refused to false, return an empty slugs list, and say so honestly in "answer".

Always respond by calling the "recommend_curricula" tool.`;

const RECOMMEND_TOOL: Anthropic.Tool = {
  name: 'recommend_curricula',
  description: 'Return curriculum recommendations chosen from the provided catalog.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      refused: {
        type: 'boolean',
        description: 'True if the question asked for a religious ruling/fatwa rather than finding curricula.',
      },
      answer: {
        type: 'string',
        description: "Short reply in the user's language explaining the recommendations or the refusal.",
      },
      slugs: {
        type: 'array',
        items: { type: 'string' },
        description: 'Slugs of recommended curricula, copied verbatim from the catalog. Most relevant first. May be empty.',
      },
    },
    required: ['refused', 'answer', 'slugs'],
  },
};

const EMPTY = (configured: boolean, answer = ''): AskResult => ({
  configured,
  ok: false,
  refused: false,
  answer,
  items: [],
});

export async function askLibrary(question: string, locale: string): Promise<AskResult> {
  if (!isAiConfigured) return EMPTY(false);
  const q = question.trim().slice(0, 500);
  if (!q) return EMPTY(true);

  const supabase = getSupabasePublicClient();
  if (!supabase) return EMPTY(true);

  // Build a compact catalog of published curricula for the model to choose from.
  const { data: catalogRows, error } = await supabase
    .from('curricula')
    .select(SELECT_WITH_REFS)
    .eq('status', 'published')
    .limit(300);
  if (error) {
    console.error('askLibrary catalog error:', error.message);
    return EMPTY(true);
  }

  const catalog = (catalogRows ?? []) as unknown as CurriculumWithRefs[];
  if (catalog.length === 0) {
    return { configured: true, ok: true, refused: false, answer: '', items: [] };
  }

  const catalogText = catalog
    .map((c) => {
      const parts = [
        `slug: ${c.slug}`,
        `title: ${localizedTitle(c, locale)}`,
        c.stage ? `stage: ${localizedName(c.stage, locale)}` : '',
        c.subject ? `subject: ${localizedName(c.subject, locale)}` : '',
        c.contributor ? `author: ${localizedContributorName(c.contributor, locale)}` : '',
        c.description ? `desc: ${c.description.slice(0, 160)}` : '',
      ].filter(Boolean);
      return `- ${parts.join(' | ')}`;
    })
    .join('\n');

  let parsed: { refused: boolean; answer: string; slugs: string[] };
  try {
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      tools: [RECOMMEND_TOOL],
      tool_choice: { type: 'tool', name: 'recommend_curricula' },
      messages: [
        {
          role: 'user',
          content: `User question (${locale}): ${q}\n\nCATALOG (choose only from these):\n${catalogText}`,
        },
      ],
    });

    const toolUse = resp.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );
    if (!toolUse) return EMPTY(true);
    parsed = toolUse.input as typeof parsed;
  } catch (e) {
    console.error('askLibrary model error:', e instanceof Error ? e.message : e);
    return EMPTY(true);
  }

  // Map returned slugs back to real curricula, preserving the model's order and
  // dropping anything not actually in the catalog (guards against hallucination).
  const bySlug = new Map(catalog.map((c) => [c.slug, c]));
  const items = (parsed.slugs || [])
    .map((s) => bySlug.get(s))
    .filter((c): c is CurriculumWithRefs => Boolean(c))
    .slice(0, 8);

  return {
    configured: true,
    ok: true,
    refused: Boolean(parsed.refused),
    answer: String(parsed.answer || ''),
    items,
  };
}
