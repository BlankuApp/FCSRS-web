import { NextRequest, NextResponse } from 'next/server';
import { AIProvider } from '@/lib/types';
import { getProviderDisplayName } from '@/lib/ai-providers';

const CARD_FORMAT_PROMPT = `
# Output Format (STRICT JSON)
You must return a JSON object with a "cards" array. Each card must be one of two types:

1. QA with Hint (qa_hint):
{
  "card_type": "qa_hint",
  "question": "The question text (can include markdown formatting, no big headings)",
  "answer": "The answer text (should include markdown formatting)",
  "hint": "" // Optional hint text (can include markdown formatting)
}

2. Multiple Choice (multiple_choice):
{
  "card_type": "multiple_choice",
  "question": "The question text (can include markdown formatting, no big headings)",
  "choices": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 0,
  "explanation": "Explanation of why the correct answer is right and others are wrong (optional, can include markdown formatting)"
}

Return ONLY valid JSON in this format:
{
  "cards": [...]
}`;

interface ProviderRequest {
  deckPrompt: string;
  topicName: string;
  provider: AIProvider;
  model: string;
  apiKey: string;
}

async function callOpenAI(systemPrompt: string, userMessage: string, model: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData.error?.message || 'OpenAI API error';
    if (response.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

async function callAnthropic(systemPrompt: string, userMessage: string, model: string, apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData.error?.message || 'Anthropic API error';
    if (response.status === 401) {
      throw new Error('Invalid Anthropic API key. Please check your API key and try again.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  const content = data.content?.[0];
  if (content?.type === 'text') {
    return content.text;
  }
  throw new Error('No text response from Anthropic');
}

async function callGoogle(systemPrompt: string, userMessage: string, model: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${userMessage}` },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData.error?.message || 'Google AI API error';
    if (response.status === 400 && message.includes('API key')) {
      throw new Error('Invalid Google AI API key. Please check your API key and try again.');
    }
    if (response.status === 403) {
      throw new Error('Invalid Google AI API key. Please check your API key and try again.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('No response from Google AI');
  }
  return content;
}

async function callXAI(systemPrompt: string, userMessage: string, model: string, apiKey: string) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData.error?.message || 'xAI API error';
    if (response.status === 401) {
      throw new Error('Invalid xAI API key. Please check your API key and try again.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProviderRequest = await request.json();
    const { deckPrompt, topicName, provider, model, apiKey } = body;

    if (!deckPrompt || !topicName) {
      return NextResponse.json(
        { error: 'deckPrompt and topicName are required' },
        { status: 400 }
      );
    }

    if (!provider || !model || !apiKey) {
      return NextResponse.json(
        { error: 'provider, model, and apiKey are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `${deckPrompt}\n${CARD_FORMAT_PROMPT}`;
    const userMessage = `Generate flashcards for this topic based on the instructions.\n\n#Topic: \n${topicName}`;

    let content: string | undefined;
    const providerName = getProviderDisplayName(provider);

    try {
      switch (provider) {
        case 'openai':
          content = await callOpenAI(systemPrompt, userMessage, model, apiKey);
          break;
        case 'anthropic':
          content = await callAnthropic(systemPrompt, userMessage, model, apiKey);
          break;
        case 'google':
          content = await callGoogle(systemPrompt, userMessage, model, apiKey);
          break;
        case 'xai':
          content = await callXAI(systemPrompt, userMessage, model, apiKey);
          break;
        default:
          return NextResponse.json(
            { error: `Unsupported provider: ${provider}` },
            { status: 400 }
          );
      }
    } catch (providerError: any) {
      return NextResponse.json(
        { error: providerError.message || `${providerName} API error` },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: `No response from ${providerName}` },
        { status: 500 }
      );
    }

    // Parse JSON from content (handle markdown code blocks if present)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    const parsed = JSON.parse(jsonContent);

    if (!parsed.cards || !Array.isArray(parsed.cards)) {
      return NextResponse.json(
        { error: `Invalid response format from ${providerName}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ cards: parsed.cards });
  } catch (error: any) {
    console.error('Generate cards error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate cards' },
      { status: 500 }
    );
  }
}
