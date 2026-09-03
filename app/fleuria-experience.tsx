"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Mood = "dawn" | "cosmos" | "blush";

type ChatMessage = {
  author: "assistant" | "visitor";
  body: string;
};

const moods: Record<Mood, { label: string; detail: string; colors: string[] }> = {
  dawn: {
    label: "Aube solaire",
    detail: "pivoines, dahlias et reflets safran",
    colors: ["#ffb97d", "#ff797c", "#ffd9a2", "#fc7267"],
  },
  cosmos: {
    label: "Nuit magnétique",
    detail: "iris, anémones et bleus minéraux",
    colors: ["#9da7ff", "#8b65ef", "#ede7ff", "#6470d9"],
  },
  blush: {
    label: "Lune rose",
    detail: "roses de jardin, cosmos et nuages poudrés",
    colors: ["#ffc0d9", "#fa82b0", "#ffe5ef", "#d8729a"],
  },
};

const catalogNotes: Record<string, string> = {
  "Quel bouquet pour une déclaration ?":
    "Pour une déclaration, j’ouvrirais la composition avec des roses de jardin, puis une fleur plus inattendue — une fritillaire, par exemple — afin d’éviter le déjà-vu.",
  "Je cherche des fleurs de saison":
    "Je peux filtrer la composition selon la saison et l’arrivage. Dites-moi la date et la palette qui vous attire : le catalogue réel prendra ensuite le relais.",
  "Comment fonctionne la livraison ?":
    "L’atelier coordonne chaque livraison selon l’adresse et le créneau souhaité. Cette réponse est une démonstration : les zones et créneaux réels seront connectés au service de livraison.",
};

function OrbitBloom({ mood, stems = 9 }: { mood: Mood; stems?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = moods[mood].colors;
    let frame = 0;
    let width = 0;
    let height = 0;
    let ratio = 1;
    const stars = Array.from({ length: 110 }, (_, index) => ({
      x: (index * 61.7) % 1,
      y: (index * 29.3) % 1,
      radius: 0.4 + ((index * 11) % 8) / 10,
      alpha: 0.18 + ((index * 13) % 7) / 18,
    }));

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(bounds.width, 1);
      height = Math.max(bounds.height, 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (timestamp: number) => {
      const time = reduceMotion ? 0 : timestamp / 1400;
      context.clearRect(0, 0, width, height);
      const field = context.createRadialGradient(width * 0.48, height * 0.45, 0, width * 0.5, height * 0.5, width * 0.65);
      field.addColorStop(0, "rgba(92, 73, 143, .30)");
      field.addColorStop(0.48, "rgba(18, 21, 54, .08)");
      field.addColorStop(1, "rgba(5, 7, 24, 0)");
      context.fillStyle = field;
      context.fillRect(0, 0, width, height);

      stars.forEach((star, index) => {
        const pulse = reduceMotion ? 1 : 0.65 + Math.sin(time * 1.4 + index) * 0.35;
        context.beginPath();
        context.fillStyle = `rgba(241, 238, 255, ${star.alpha * pulse})`;
        context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        context.fill();
      });

      const centerX = width * 0.5;
      const centerY = height * 0.52;
      const unit = Math.min(width, height) / 6.2;
      context.save();
      context.translate(centerX, centerY);
      context.lineWidth = 0.65;
      context.strokeStyle = "rgba(241, 234, 255, .24)";
      [1.15, 1.72, 2.35].forEach((radius, index) => {
        context.save();
        context.rotate(time * (index % 2 ? -0.11 : 0.08));
        context.beginPath();
        context.ellipse(0, 0, unit * radius, unit * radius * 0.37, 0, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      });

      for (let index = 0; index < stems; index += 1) {
        const angle = (Math.PI * 2 * index) / stems + time * 0.09;
        const petalLength = unit * (1.6 + (index % 3) * 0.12);
        context.save();
        context.rotate(angle);
        const petal = context.createRadialGradient(0, -petalLength * 0.32, 0, 0, -petalLength * 0.35, petalLength);
        petal.addColorStop(0, `${palette[index % palette.length]}e8`);
        petal.addColorStop(0.58, `${palette[(index + 1) % palette.length]}88`);
        petal.addColorStop(1, "rgba(104, 102, 194, 0)");
        context.fillStyle = petal;
        context.globalCompositeOperation = "screen";
        context.beginPath();
        context.ellipse(0, -petalLength * 0.62, unit * 0.33, petalLength * 0.88, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      context.globalCompositeOperation = "source-over";
      const core = context.createRadialGradient(0, 0, 1, 0, 0, unit * 1.02);
      core.addColorStop(0, "#fff8dd");
      core.addColorStop(0.16, palette[2]);
      core.addColorStop(0.48, palette[0]);
      core.addColorStop(1, "rgba(118, 96, 202, 0)");
      context.fillStyle = core;
      context.beginPath();
      context.arc(0, 0, unit * 1.02, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff4ce";
      context.beginPath();
      context.arc(0, 0, unit * 0.19, 0, Math.PI * 2);
      context.fill();
      context.restore();
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frame = requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [mood, stems]);

  return <canvas ref={canvasRef} className="orbit-bloom" aria-hidden="true" />;
}

function ArrowUpRight() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="icon" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 19 19 5M8 5h11v11" /></svg>;
}

function SparkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="icon" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2Z" /><path d="m19 15 .8 3.2L23 19l-3.2.8L19 23l-.8-3.2L15 19l3.2-.8L19 15Z" /></svg>;
}

export default function FleuriaExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mood, setMood] = useState<Mood>("cosmos");
  const [stemCount, setStemCount] = useState(9);
  const [luxuryWrap, setLuxuryWrap] = useState(true);
  const [delivery, setDelivery] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ author: "assistant", body: "Bonsoir. Décrivez l’émotion, l’occasion ou une fleur ; je vous orienterai dans le catalogue de l’atelier." }]);
  const [weddingSent, setWeddingSent] = useState(false);
  const [weddingGuests, setWeddingGuests] = useState(80);
  const estimate = useMemo(() => 74 + stemCount * (mood === "cosmos" ? 18 : mood === "dawn" ? 16 : 17) + (luxuryWrap ? 18 : 0) + (delivery ? 16 : 0), [delivery, luxuryWrap, mood, stemCount]);
  const weddingStartingPrice = useMemo(() => 1250 + Math.max(weddingGuests - 30, 0) * 22, [weddingGuests]);

  const sendCatalogMessage = (message: string) => {
    const reply = catalogNotes[message] ?? "Je retiens cette intention. Pour un résultat juste, l’atelier vous proposera ensuite les variétés disponibles et leur saisonnalité exacte.";
    setMessages((current) => [...current, { author: "visitor", body: message }, { author: "assistant", body: reply }]);
  };
  const submitChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message) return;
    sendCatalogMessage(message);
    setChatInput("");
  };
  const submitWedding = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWeddingSent(true);
  };

  return <main>
    <section className="hero-shell" id="accueil">
      <div className="top-rule" />
      <header className="site-header page-frame">
        <a className="wordmark" href="#accueil" aria-label="fleurIA, retour à l'accueil">fleur<span>IA</span></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}><span>{menuOpen ? "Fermer" : "Explorer"}</span><span className="menu-mark" aria-hidden="true" /></button>
        <nav id="main-navigation" className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Navigation principale">
          <a href="#catalogue" onClick={() => setMenuOpen(false)}>Catalogue</a><a href="#composer" onClick={() => setMenuOpen(false)}>Composer</a><a href="#mariage" onClick={() => setMenuOpen(false)}>Mariages</a><a className="nav-appointment" href="#mariage" onClick={() => setMenuOpen(false)}>Parler à l&apos;atelier <ArrowUpRight /></a>
        </nav>
      </header>
      <div className="hero page-frame">
        <div className="hero-copy">
          <p className="hero-overline">Atelier floral · Paris &amp; au-delà</p><h1>L&apos;art floral<br />en apesanteur.</h1><p className="hero-intro">Chaque composition commence par une orbite : un geste, une saison, une personne à toucher.</p>
          <div className="hero-actions"><a className="button button-light" href="#composer">Composer mon bouquet <ArrowUpRight /></a><a className="text-link" href="#mariage">Imaginer un mariage</a></div>
        </div>
        <div className="hero-orbit"><OrbitBloom mood={mood} stems={stemCount} /><span className="orbit-label orbit-label-top">Noyau<br />floral</span><span className="orbit-label orbit-label-bottom">Composition<br />en cours</span><span className="hero-coordinate">48° 51&apos; N · 2° 21&apos; E</span></div>
        <aside className="hero-note"><span className="line-spark"><SparkIcon /></span><p>Une sélection vivante de fleurs, de gestes et de couleurs pour les moments qui comptent.</p></aside>
      </div>
      <div className="hero-footer page-frame"><span>Faites défiler pour entrer dans l&apos;atelier</span><a href="#catalogue" aria-label="Découvrir les constellations du moment"><span className="scroll-orbit" aria-hidden="true" /></a><span>Édition de saison · démo interactive</span></div>
    </section>

    <section className="constellations page-frame section-pad" id="catalogue">
      <div className="section-heading split-heading"><div><p className="section-label">Les constellations du moment</p><h2>Choisir une<br />trajectoire.</h2></div><p className="section-copy">Des compositions de caractère, pensées comme des destinations sensibles. Les variétés affichées ici sont des inspirations de démonstration.</p></div>
      <div className="collection-list">
        <article className="collection collection-large collection-dawn"><span className="collection-orbit" aria-hidden="true" /><div className="collection-info"><p>Aube solaire</p><h3>Le jour<br />se lève.</h3><button type="button" onClick={() => sendCatalogMessage("Quel bouquet pour une déclaration ?")}>Parler de cette composition <ArrowUpRight /></button></div><span className="collection-detail">Pivoines · Dahlias<br />Élan doux</span></article>
        <article className="collection collection-tall collection-cosmos"><span className="collection-orbit" aria-hidden="true" /><div className="collection-info"><p>Nuit magnétique</p><h3>Un silence<br />électrique.</h3><button type="button" onClick={() => sendCatalogMessage("Je cherche des fleurs de saison")}>Entrer dans l&apos;orbite <ArrowUpRight /></button></div><span className="collection-detail">Iris · Anémones<br />Gravité bleue</span></article>
        <article className="collection collection-small collection-blush"><span className="collection-orbit" aria-hidden="true" /><div className="collection-info"><p>Lune rose</p><h3>Tout près<br />du cœur.</h3><button type="button" onClick={() => setMood("blush")}>Voir dans le générateur <ArrowUpRight /></button></div><span className="collection-detail">Roses · Cosmos<br />Tendresse franche</span></article>
      </div>
    </section>

    <section className="catalogue-conversation" aria-labelledby="catalogue-title"><div className="page-frame conversation-grid">
      <div className="conversation-copy"><p className="section-label">Le catalogue vous répond</p><h2 id="catalogue-title">Parlez-nous<br />d&apos;une émotion.</h2><p>Une couleur à oublier, une fleur à retrouver, une occasion qui ne ressemble à aucune autre : commencez là.</p><div className="prompt-list" aria-label="Suggestions de question">{Object.keys(catalogNotes).map((prompt) => <button type="button" key={prompt} onClick={() => sendCatalogMessage(prompt)}>{prompt} <ArrowUpRight /></button>)}</div></div>
      <div className="chat-window"><div className="chat-topline"><span className="presence-dot" aria-hidden="true" /><span>assistant catalogue</span><span className="chat-status">En ligne</span></div><div className="messages" aria-live="polite">{messages.map((message, index) => <div className={`message message-${message.author}`} key={`${message.author}-${index}`}><span>{message.author === "assistant" ? "fleurIA" : "vous"}</span><p>{message.body}</p></div>)}</div><form className="chat-form" onSubmit={submitChat}><label className="sr-only" htmlFor="catalogue-question">Votre message</label><input id="catalogue-question" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ex. Je veux dire merci, sans rose rouge…" /><button type="submit" aria-label="Envoyer la question"><ArrowUpRight /></button></form><p className="demo-disclaimer">Réponses de démonstration : catalogue et disponibilités à connecter.</p></div>
    </div></section>

    <section className="composer page-frame section-pad" id="composer" aria-labelledby="composer-title">
      <div className="section-heading composer-heading"><div><p className="section-label">Générateur de bouquet</p><h2 id="composer-title">L&apos;atelier<br />dans vos mains.</h2></div><p className="section-copy">Ajustez la matière, la couleur et le rythme. Votre bouquet se transforme avec vos choix ; l&apos;estimation reste illustrative.</p></div>
      <div className="composer-workbench">
        <div className="bouquet-preview"><OrbitBloom mood={mood} stems={stemCount} /><div className="preview-caption"><span>Ébauche n° 07</span><span>{moods[mood].label}</span></div></div>
        <div className="composer-controls"><fieldset><legend>Atmosphère</legend><div className="mood-options">{(Object.keys(moods) as Mood[]).map((option) => <button className={mood === option ? "mood-option is-selected" : "mood-option"} key={option} type="button" aria-pressed={mood === option} onClick={() => setMood(option)}><span className={`mood-swatch mood-${option}`} aria-hidden="true" /><span>{moods[option].label}</span><small>{moods[option].detail}</small></button>)}</div></fieldset><fieldset className="stem-field"><legend>Amplitude florale <output>{stemCount} tiges</output></legend><input type="range" min="5" max="18" value={stemCount} onChange={(event) => setStemCount(Number(event.target.value))} aria-label="Nombre de tiges" /><div className="range-labels"><span>Intime</span><span>Déployé</span></div></fieldset><div className="switches"><label className="switch-line"><span><strong>Enveloppe d&apos;atelier</strong><small>Papier texturé et ruban</small></span><input type="checkbox" checked={luxuryWrap} onChange={(event) => setLuxuryWrap(event.target.checked)} /><i aria-hidden="true" /></label><label className="switch-line"><span><strong>Livraison à heure orbitale</strong><small>Créneau à confirmer par l&apos;atelier</small></span><input type="checkbox" checked={delivery} onChange={(event) => setDelivery(event.target.checked)} /><i aria-hidden="true" /></label></div></div>
        <aside className="estimate-panel" aria-live="polite"><span>Estimation bouquet</span><strong>{estimate.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</strong><p>Base illustrative, à confirmer selon les fleurs de saison et le lieu de livraison.</p><button type="button" className="button button-violet" onClick={() => sendCatalogMessage(`Je souhaite réserver l’ébauche ${moods[mood].label}, ${stemCount} tiges.`)}>Envoyer à l&apos;atelier <ArrowUpRight /></button></aside>
      </div>
    </section>

    <section className="wedding-section" id="mariage" aria-labelledby="wedding-title"><div className="page-frame wedding-grid">
      <div className="wedding-art" aria-hidden="true"><span className="wedding-circle wedding-circle-one" /><span className="wedding-circle wedding-circle-two" /><span className="wedding-circle wedding-circle-three" /><span className="wedding-line" /><p>Deux trajectoires,<br />une même floraison.</p></div>
      <div className="wedding-content"><p className="section-label">Devis mariage</p><h2 id="wedding-title">On imagine<br />tout, ensemble.</h2><p className="wedding-lede">Du bouquet à la dernière table, l&apos;atelier compose une scénographie à votre échelle. Donnez-nous l&apos;impulsion, nous dessinons le ciel.</p><form className="wedding-form" onSubmit={submitWedding}><div className="form-grid"><label>Vos prénoms<input required name="names" placeholder="Camille &amp; Noé" /></label><label>Date souhaitée<input required name="date" type="date" /></label><label>Lieu<select defaultValue=""><option value="" disabled>Choisir un décor</option><option>Maison de famille</option><option>Hôtel particulier</option><option>Jardin ou domaine</option><option>Lieu à révéler</option></select></label><label>Invités <output>{weddingGuests} personnes</output><input type="range" min="20" max="240" step="5" value={weddingGuests} onChange={(event) => setWeddingGuests(Number(event.target.value))} /></label></div><div className="wedding-form-bottom"><p>Première enveloppe illustrative : <strong>à partir de {weddingStartingPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</strong></p><button type="submit" className="button button-light">Recevoir mon premier échange <ArrowUpRight /></button></div>{weddingSent && <p className="form-success" role="status">Votre projet est prêt à être confié à l&apos;atelier. Dans une version connectée, cette demande serait transmise à l&apos;équipe mariage.</p>}</form></div>
    </div></section>

    <footer className="site-footer page-frame"><div><a className="wordmark" href="#accueil">fleur<span>IA</span></a><p>Un atelier floral pour les grands élans.</p></div><div className="footer-links"><a href="#catalogue">Catalogue</a><a href="#composer">Générateur</a><a href="#mariage">Mariages</a></div><p className="footer-note">Prototype interactif · les prix et demandes sont illustratifs</p></footer>
  </main>;
}
