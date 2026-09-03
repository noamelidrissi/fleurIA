import { NextResponse } from "next/server";
import { chatWithMistral, hasMistralKey, type ChatMessage } from "@/lib/mistral";
import { plates, resolveCatalogueReply, matchSpecies, type SpeciesKey } from "@/lib/species";

export const runtime = "nodejs";

type IncomingMessage = { author: "assistant" | "visitor"; body: string };
type ChatApiResult = { reply: string; species: SpeciesKey | null; source: "mistral" | "fallback" };

const SPECIES_KEYS = plates.map((plate) => plate.key);

function buildSystemPrompt(): string {
  const roster = plates
    .map((plate) => `- clé "${plate.key}" : ${plate.common} (${plate.latin}) — ${plate.note} ${plate.talk}`)
    .join("\n");

  return `Tu es l'assistant catalogue de fleurIA, un atelier floral haut de gamme organisé comme un cabinet de curiosités botaniques. Tu réponds toujours en français, dans un ton précis, poétique et jamais mièvre.

Le cabinet propose exactement ces six espèces ce mois-ci, aucune autre :
${roster}

Ton rôle : mener une conversation courte et naturelle pour comprendre l'intention du visiteur (occasion, palette ou ambiance recherchée, saison, budget si mentionné), puis recommander UNE seule de ces six espèces avec une phrase de justification concrète reliée à ce qu'il/elle a dit. Si tu n'as pas encore assez d'indices, pose une seule question claire plutôt que de deviner au hasard — dans ce cas ne recommande rien encore. N'invente jamais d'espèce hors de cette liste, ne promets jamais de disponibilité, de prix ou de livraison réels — reste dans le registre d'une démonstration illustrative, comme le reste du site.

Réponds UNIQUEMENT avec un objet JSON de cette forme exacte, sans texte autour :
{"reply": "ta réponse en 2 à 4 phrases maximum, sans listes ni markdown, comme à l'oral dans une boutique", "recommendedSpecies": "une des clés ci-dessus, ou null si tu n'as pas encore assez d'indices pour recommander"}`;
}

function parseMistralJson(content: string): { reply: string; species: SpeciesKey | null } | null {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed.reply !== "string") return null;
    const key = typeof parsed.recommendedSpecies === "string" ? parsed.recommendedSpecies : null;
    const species = key && (SPECIES_KEYS as string[]).includes(key) ? (key as SpeciesKey) : null;
    return { reply: parsed.reply, species };
  } catch {
    return null;
  }
}

function localFallback(lastVisitorMessage: IncomingMessage | undefined, note?: string): ChatApiResult {
  if (!lastVisitorMessage) {
    return {
      reply: note ?? "Dites-moi l’occasion ou l’espèce qui vous intéresse, je vous oriente dans le cabinet.",
      species: null,
      source: "fallback",
    };
  }
  const matched = matchSpecies(lastVisitorMessage.body);
  return {
    reply: note ?? resolveCatalogueReply(lastVisitorMessage.body),
    species: matched?.key ?? null,
    source: "fallback",
  };
}

export async function POST(request: Request) {
  let body: { messages?: IncomingMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  const lastVisitorMessage = [...history].reverse().find((entry) => entry.author === "visitor");

  if (!hasMistralKey()) {
    return NextResponse.json(
      localFallback(
        lastVisitorMessage,
        lastVisitorMessage
          ? undefined
          : "Je n’ai pas encore de clé Mistral configurée pour cette démonstration — dites-moi tout de même l’occasion ou la palette qui vous inspire."
      )
    );
  }

  const mistralMessages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    ...history.map((entry) => ({
      role: entry.author === "assistant" ? ("assistant" as const) : ("user" as const),
      content: entry.body,
    })),
  ];

  try {
    const raw = await chatWithMistral(mistralMessages, { json: true });
    const parsed = parseMistralJson(raw);
    if (!parsed) throw new Error(`Mistral returned non-JSON content: ${raw.slice(0, 200)}`);
    const result: ChatApiResult = { reply: parsed.reply, species: parsed.species, source: "mistral" };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Mistral chat failed, falling back to local reply.", error);
    return NextResponse.json(localFallback(lastVisitorMessage));
  }
}
