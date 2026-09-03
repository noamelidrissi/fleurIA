"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BouquetSketch } from "@/components/bouquet-sketch";
import { ArrowUpRight } from "@/components/icons";
import { plates, findSpecies, type SpeciesKey } from "@/lib/species";

const BASE_PRICE = 74;
const STEM_PRICE: Record<SpeciesKey, number> = {
  hortensia: 18,
  rose: 19,
  anemone: 15,
  iris: 16,
  cosmos: 14,
  pivoine: 16,
};
const WRAP_PRICE = 18;
const DELIVERY_PRICE = 16;
const DEFAULT_SPECIES: SpeciesKey = "pivoine";

export default function ComposerPage() {
  return (
    <Suspense fallback={null}>
      <ComposerContent />
    </Suspense>
  );
}

function ComposerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [species, setSpecies] = useState<SpeciesKey>(DEFAULT_SPECIES);
  const [stemCount, setStemCount] = useState(9);
  const [luxuryWrap, setLuxuryWrap] = useState(true);
  const [delivery, setDelivery] = useState(false);

  useEffect(() => {
    const requested = findSpecies(searchParams.get("espece"));
    if (requested) setSpecies(requested.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const current = findSpecies(species) ?? plates[0];
  const stemsCost = stemCount * STEM_PRICE[species];
  const estimate = useMemo(
    () => BASE_PRICE + stemsCost + (luxuryWrap ? WRAP_PRICE : 0) + (delivery ? DELIVERY_PRICE : 0),
    [delivery, luxuryWrap, stemsCost]
  );

  const formatEur = (value: number) =>
    value.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  const sendToAtelier = () => {
    router.push(
      `/catalogue?message=${encodeURIComponent(`Je souhaite réserver la planche ${current.common}, ${stemCount} tiges.`)}`
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
            <div className="bouquet-sketch-frame">
              <BouquetSketch species={species} stemCount={stemCount} luxuryWrap={luxuryWrap} />
            </div>
            <div className="preview-caption">
              <span>Ébauche n° 07</span>
              <span>{current.common}</span>
            </div>
            <p className="sketch-note">Croquis génératif de la composition — pas un rendu photoréaliste.</p>
          </div>
          <div className="composer-controls">
            <fieldset>
              <legend>Espèce dominante</legend>
              <div className="mood-options">
                {plates.map((plate) => (
                  <button
                    className={species === plate.key ? "mood-option is-selected" : "mood-option"}
                    key={plate.key}
                    type="button"
                    aria-pressed={species === plate.key}
                    onClick={() => setSpecies(plate.key)}
                  >
                    <span className={`mood-swatch ${plate.swatch}`} aria-hidden="true" />
                    <span>{plate.common}</span>
                    <small>{plate.detail}</small>
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
            <strong>{formatEur(estimate)}</strong>
            <ul className="estimate-breakdown">
              <li><span>Base atelier</span><span>{formatEur(BASE_PRICE)}</span></li>
              <li><span>{stemCount} tiges × {formatEur(STEM_PRICE[species])}</span><span>{formatEur(stemsCost)}</span></li>
              {luxuryWrap && <li><span>Enveloppe d&apos;atelier</span><span>{formatEur(WRAP_PRICE)}</span></li>}
              {delivery && <li><span>Livraison à créneau fixe</span><span>{formatEur(DELIVERY_PRICE)}</span></li>}
            </ul>
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
