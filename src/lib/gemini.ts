import { GoogleGenerativeAI } from '@google/generative-ai';

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY nije postavljen u .env.local');
  return new GoogleGenerativeAI(apiKey);
};

export async function analyzeImageWithGemini(base64: string, mimeType: string, prompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' } },
    prompt,
  ]);

  return result.response.text();
}

export async function textWithGemini(prompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export function parseJsonResponse(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object/array from text
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Nije moguće parsirati JSON odgovor od AI-a');
  }
}
