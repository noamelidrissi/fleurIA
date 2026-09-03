"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlateFrame, PlateCaption } from "@/components/plate";
import { ArrowUpRight } from "@/components/icons";
import { plates, catalogNotes } from "@/lib/species";

type ChatMessage = { author: "assistant" | "visitor"; body: string };

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      author: "assistant",
      body: "Bonjour. Décrivez l’émotion, l’occasion ou une espèce ; je vous orienterai dans le cabinet de l’atelier.",
    },
  ]);

  const sendCatalogMessage = (message: string) => {
    const reply =
      catalogNotes[message] ??
      "Je retiens cette intention. Pour un résultat juste, l’atelier vous proposera ensuite les espèces disponibles et leur saisonnalité exacte.";
    setMessages((current) => [...current, { author: "visitor", body: message }, { author: "assistant", body: reply }]);
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
    if (!message) return;
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
              <button type="button" onClick={() => sendCatalogMessage(`Parlez-moi de l’espèce ${plate.common}.`)}>
                Parler de cette espèce <ArrowUpRight />
              </button>
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
                <button type="button" key={prompt} onClick={() => sendCatalogMessage(prompt)}>
                  {prompt} <ArrowUpRight />
                </button>
              ))}
            </div>
          </div>
          <div className="chat-window">
            <div className="chat-topline">
              <span className="presence-dot" aria-hidden="true" />
              <span>assistant catalogue</span>
              <span className="chat-status">En ligne</span>
            </div>
            <div className="messages" aria-live="polite">
              {messages.map((message, index) => (
                <div className={`message message-${message.author}`} key={`${message.author}-${index}`}>
                  <span>{message.author === "assistant" ? "fleurIA" : "vous"}</span>
                  <p>{message.body}</p>
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={submitChat}>
              <label className="sr-only" htmlFor="catalogue-question">Votre message</label>
              <input
                id="catalogue-question"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ex. Je veux dire merci, sans rose rouge…"
              />
              <button type="submit" aria-label="Envoyer la question"><ArrowUpRight /></button>
            </form>
            <p className="demo-disclaimer">Réponses de démonstration : catalogue et disponibilités à connecter.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
