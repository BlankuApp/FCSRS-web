import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { deckPrompt, topicName } = await request.json();

    if (!deckPrompt || !topicName) {
      return NextResponse.json(
        { error: 'deckPrompt and topicName are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `${deckPrompt}

# Output Format (STRICT JSON)
You must return a JSON object with a "cards" array. Each card must be one of two types:

1. QA with Hint (qa_hint):
{
  "card_type": "qa_hint",
  "question": "The question text (can include markdown formatting)",
  "answer": "The answer text (should include markdown formatting)",
  "hint": "A helpful hint"
}

2. Multiple Choice (multiple_choice):
{
  "card_type": "multiple_choice",
  "question": "The question text",
  "choices": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 0
}

Return ONLY valid JSON in this format:
{
  "cards": [...]
}`;

    const userMessage = `Topic: ${topicName}

Generate flashcards for this topic based on the instructions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'OpenAI API error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);
    
    if (!parsed.cards || !Array.isArray(parsed.cards)) {
      return NextResponse.json(
        { error: 'Invalid response format from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ cards: parsed.cards });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate cards' },
      { status: 500 }
    );
  }
}
