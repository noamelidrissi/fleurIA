const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export type ChatRole = "system" | "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

export function hasMistralKey(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY);
}

export async function chatWithMistral(
  messages: ChatMessage[],
  options: { json?: boolean } = {}
): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is missing. Add it to .env.local (see .env.local.example).");
  }

  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages,
      temperature: 0.6,
      max_tokens: 260,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral request failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Mistral response did not include message content.");
  }
  return content.trim();
}
