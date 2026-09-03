"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlateFrame } from "@/components/plate";
import { ArrowUpRight } from "@/components/icons";
import { moods, type Mood } from "@/lib/species";

export default function ComposerPage() {
  const router = useRouter();
  const [mood, setMood] = useState<Mood>("peony");
  const [stemCount, setStemCount] = useState(9);
  const [luxuryWrap, setLuxuryWrap] = useState(true);
  const [delivery, setDelivery] = useState(false);

  const estimate = useMemo(
    () =>
      74 +
      stemCount * (mood === "hydrangea" ? 18 : mood === "peony" ? 16 : 17) +
      (luxuryWrap ? 18 : 0) +
      (delivery ? 16 : 0),
    [delivery, luxuryWrap, mood, stemCount]
  );

  const sendToAtelier = () => {
    router.push(
      `/catalogue?message=${encodeURIComponent(`Je souhaite réserver la planche ${moods[mood].label}, ${stemCount} tiges.`)}`
    );
  };

  return (
    <main>
      <section className="page-frame section-pad" aria-labelledby="composer-title">
        <div className="page-intro">
          <h2 id="composer-title">L&apos;atelier<br />dans vos mains.</h2>
          <p>Choisissez l&apos;espèce, la densité et la finition. L&apos;estimation reste illustrative.</p>
        </div>
        <div className="composer-workbench">
          <div className="bouquet-preview">
            <PlateFrame src={moods[mood].photo} alt={moods[mood].latin} width={640} height={800} priority />
            <div className="preview-caption">
              <span>Ébauche n° 07</span>
              <span>{moods[mood].label}</span>
            </div>
          </div>
          <div className="composer-controls">
            <fieldset>
              <legend>Espèce dominante</legend>
              <div className="mood-options">
                {(Object.keys(moods) as Mood[]).map((option) => (
                  <button
                    className={mood === option ? "mood-option is-selected" : "mood-option"}
                    key={option}
                    type="button"
                    aria-pressed={mood === option}
                    onClick={() => setMood(option)}
                  >
                    <span className={`mood-swatch ${moods[option].swatch}`} aria-hidden="true" />
                    <span>{moods[option].label}</span>
                    <small>{moods[option].detail}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="stem-field">
              <legend>Amplitude florale <output>{stemCount} tiges</output></legend>
              <input
                type="range"
                min="5"
                max="18"
                value={stemCount}
                onChange={(event) => setStemCount(Number(event.target.value))}
                aria-label="Nombre de tiges"
              />
              <div className="range-labels"><span>Intime</span><span>Déployé</span></div>
            </fieldset>
            <div className="switches">
              <label className="switch-line">
                <span><strong>Enveloppe d&apos;atelier</strong><small>Papier texturé et ruban</small></span>
                <input type="checkbox" checked={luxuryWrap} onChange={(event) => setLuxuryWrap(event.target.checked)} />
                <i aria-hidden="true" />
              </label>
              <label className="switch-line">
                <span><strong>Livraison à créneau fixe</strong><small>Créneau à confirmer par l&apos;atelier</small></span>
                <input type="checkbox" checked={delivery} onChange={(event) => setDelivery(event.target.checked)} />
                <i aria-hidden="true" />
              </label>
            </div>
          </div>
          <aside className="estimate-panel" aria-live="polite">
            <span>Estimation bouquet</span>
            <strong>{estimate.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</strong>
            <p>Base illustrative, à confirmer selon les fleurs de saison et le lieu de livraison.</p>
            <button type="button" className="button" onClick={sendToAtelier}>
              Envoyer à l&apos;atelier <ArrowUpRight />
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}
