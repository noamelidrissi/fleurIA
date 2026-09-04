"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PlateFrame, PlateCaption } from "@/components/plate";
import { ArrowUpRight, ChatBubble } from "@/components/icons";
import { plates, catalogNotes, resolveCatalogueReply, matchSpecies, findSpecies, type SpeciesKey } from "@/lib/species";

type ChatMessage = {
  author: "assistant" | "visitor";
  body: string;
  pending?: boolean;
  species?: SpeciesKey | null;
};

export default function CataloguePage() {
  return (
    <Suspense fallback={null}>
      <CatalogueContent />
    </Suspense>
  );
}

function CatalogueContent() {
  const searchParams = useSearchParams();
  const handledHandoff = useRef(false);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      author: "assistant",
      body: "Bonjour. Décrivez l’émotion, l’occasion ou une espèce ; je vous orienterai dans le cabinet de l’atelier.",
    },
  ]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const node = messagesRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const sendCatalogMessage = async (message: string) => {
    if (isThinking) return;
    setIsThinking(true);
    const history = [...messages, { author: "visitor" as const, body: message }];
    setMessages((current) => [
      ...current,
      { author: "visitor", body: message },
      { author: "assistant", body: "", pending: true },
    ]);
    inputRef.current?.focus();

    const minDelay = new Promise((resolve) => setTimeout(resolve, 480));
    let reply: string;
    let species: SpeciesKey | null = null;
    try {
      const [response] = await Promise.all([
        fetch("/api/catalogue-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        }),
        minDelay,
      ]);
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = await response.json();
      reply = typeof data.reply === "string" ? data.reply : resolveCatalogueReply(message);
      species = findSpecies(data.species)?.key ?? null;
    } catch (error) {
      console.error("Catalogue chat request failed, using local fallback.", error);
      await minDelay;
      reply = resolveCatalogueReply(message);
      species = matchSpecies(message)?.key ?? null;
    }

    setMessages((current) =>
      current.map((entry, index) =>
        index === current.length - 1 && entry.pending ? { author: "assistant", body: reply, species } : entry
      )
    );
    setIsThinking(false);
  };

  useEffect(() => {
    const handoff = searchParams.get("message");
    if (handoff && !handledHandoff.current) {
      handledHandoff.current = true;
      sendCatalogMessage(handoff);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const submitChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || isThinking) return;
    sendCatalogMessage(message);
    setChatInput("");
  };

  return (
    <main>
      <section className="page-frame section-pad">
        <div className="page-intro">
          <h2>Six espèces<br />au cabinet.</h2>
          <p>Chaque planche documente une espèce disponible ce mois-ci. Les mentions de provenance sont des exemples de démonstration.</p>
        </div>
        <div className="plates-grid">
          {plates.map((plate) => (
            <article className={`plate-card ${plate.ground}`} key={plate.key}>
              <PlateFrame src={plate.photo} alt={`${plate.common}, ${plate.latin}`} width={600} height={600} />
              <PlateCaption latin={plate.latin} common={`${plate.common} · ${plate.note}`} accession={plate.accession} />
              <div className="plate-card-actions">
                <button
                  type="button"
                  disabled={isThinking}
                  onClick={() => sendCatalogMessage(`Parlez-moi de l’espèce ${plate.common}.`)}
                >
                  Parler de cette espèce <ArrowUpRight />
                </button>
                <Link href={`/composer?espece=${plate.key}`}>Composer avec cette espèce <ArrowUpRight /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="catalogue-conversation" aria-labelledby="catalogue-title">
        <div className="page-frame conversation-grid">
          <div className="conversation-copy">
            <h2 id="catalogue-title">Parlez-nous<br />d&apos;une émotion.</h2>
            <p>Une couleur à oublier, une espèce à retrouver, une occasion qui ne ressemble à aucune autre : commencez là.</p>
            <div className="prompt-list" aria-label="Suggestions de question">
              {Object.keys(catalogNotes).map((prompt) => (
                <button type="button" key={prompt} disabled={isThinking} onClick={() => sendCatalogMessage(prompt)}>
                  {prompt} <ArrowUpRight />
                </button>
              ))}
            </div>
          </div>
          <div className="chat-window">
            <div className="chat-topline">
              <ChatBubble />
              <span className="chat-title">Discutez avec l&apos;assistant fleurIA</span>
              <span className="chat-status"><span className="presence-dot" aria-hidden="true" />{isThinking ? "Rédige une réponse…" : "En ligne"}</span>
            </div>
            <div className="messages" aria-live="polite" ref={messagesRef}>
              {messages.map((message, index) => {
                const recommended = message.species ? findSpecies(message.species) : null;
                return (
                  <div className={`message message-${message.author}`} key={`${message.author}-${index}`}>
                    <span>{message.author === "assistant" ? "fleurIA" : "vous"}</span>
                    {message.pending ? (
                      <p className="typing-dots">
                        <span className="sr-only">fleurIA rédige une réponse…</span>
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                      </p>
                    ) : (
                      <>
                        <p>{message.body}</p>
                        {recommended && (
                          <Link className="message-cta" href={`/composer?espece=${recommended.key}`}>
                            Composer avec {recommended.common.toLowerCase()} <ArrowUpRight />
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <label className="chat-form-label" htmlFor="catalogue-question">Écrivez votre message ici</label>
            <form className="chat-form" onSubmit={submitChat}>
              <input
                id="catalogue-question"
                ref={inputRef}
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ex. Je veux dire merci, sans rose rouge…"
              />
              <button type="submit" aria-label="Envoyer la question" disabled={isThinking}><ArrowUpRight /></button>
            </form>
            <p className="demo-disclaimer">Réponses de démonstration : catalogue et disponibilités à connecter.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
