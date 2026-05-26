import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ComplianceResponse } from '@/app/data';

export const dynamic = 'force-dynamic';

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    const openai = createOpenAIClient();

    if (!openai) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY server configuration.' },
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body.script !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON with a string "script".' },
        { status: 400 },
      );
    }

    const script: string = body.script.trim();

    if (!script) {
      return NextResponse.json(
        { error: 'Script must not be empty.' },
        { status: 400 },
      );
    }

    const systemPrompt = `
You are a strict cross-state alcohol advertising compliance engine.

You MUST apply the following rules exactly and deterministically, without exception:

NEVADA RULE:
- The script MUST explicitly contain the exact text "21+" (two characters: 2, 1, plus sign).
- If the script contains "21+" anywhere, Nevada is APPROVED.
- If the script does NOT contain "21+" anywhere, Nevada is REJECTED.

UTAH RULE:
- The script must NOT contain ANY of the following words (case-insensitive):
  "party", "beach", "club", "friends", "nightlife", "fun".
- If the script contains even ONE of those words (in any casing), Utah is REJECTED.
- If it contains NONE of those words and is otherwise purely descriptive, Utah is APPROVED.

Your job is ONLY to evaluate the provided script against these rules.

You MUST respond with a single valid JSON object that matches this TypeScript interface EXACTLY:

interface ComplianceResponse {
  utah: { status: 'APPROVED' | 'REJECTED'; explanation: string };
  nevada: { status: 'APPROVED' | 'REJECTED'; explanation: string };
}

Additional strict requirements:
- The "status" fields MUST be either "APPROVED" or "REJECTED" in ALL CAPS.
- The "explanation" fields MUST be concise English sentences that explicitly reference the rule(s) that triggered the decision.
- Do NOT include any extra fields.
- Do NOT wrap the JSON in backticks or a code block.
- Do NOT include comments.
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Evaluate the following ad script for compliance:\n\n${script}`,
        },
      ],
      temperature: 0,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';

    let parsed: ComplianceResponse;

    try {
      parsed = JSON.parse(raw) as ComplianceResponse;
    } catch (error) {
      console.error('Failed to parse model JSON:', error, raw);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON.' },
        { status: 502 },
      );
    }

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.utah ||
      !parsed.nevada ||
      (parsed.utah.status !== 'APPROVED' &&
        parsed.utah.status !== 'REJECTED') ||
      (parsed.nevada.status !== 'APPROVED' &&
        parsed.nevada.status !== 'REJECTED')
    ) {
      return NextResponse.json(
        { error: 'AI response did not match expected schema.' },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Unexpected error in /api/analyze:', error);
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 },
    );
  }
}

