const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter(
  prompt: string,
  model = "openai/gpt-oss-20b:free",
  options?: { temperature?: number; maxTokens?: number }
) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur OpenRouter: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}