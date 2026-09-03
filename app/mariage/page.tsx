"use client";

import { FormEvent, useMemo, useState } from "react";
import { PlateFrame } from "@/components/plate";
import { ArrowUpRight } from "@/components/icons";

export default function MariagePage() {
  const [weddingSent, setWeddingSent] = useState(false);
  const [weddingGuests, setWeddingGuests] = useState(80);
  const weddingStartingPrice = useMemo(() => 1250 + Math.max(weddingGuests - 30, 0) * 22, [weddingGuests]);

  const submitWedding = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWeddingSent(true);
  };

  return (
    <main>
      <section className="wedding-section" aria-labelledby="wedding-title">
        <div className="page-frame section-pad wedding-grid">
          <figure className="wedding-plate">
            <PlateFrame src="/images/specimens/rose.jpg" alt="Rose de jardin, Rosa × damascena" width={640} height={800} priority />
            <p>Deux jardins,<br />une même floraison.</p>
          </figure>
          <div className="wedding-content">
            <h2 id="wedding-title">On imagine<br />tout, ensemble.</h2>
            <p className="wedding-lede">
              Du bouquet à la dernière table, l&apos;atelier compose une scénographie à votre échelle. Donnez-nous l&apos;impulsion, nous en dessinons chaque planche.
            </p>
            <form className="wedding-form" onSubmit={submitWedding}>
              <div className="form-grid">
                <label>Vos prénoms<input required name="names" placeholder="Camille &amp; Noé" /></label>
                <label>Date souhaitée<input required name="date" type="date" /></label>
                <label>
                  Lieu
                  <select defaultValue="">
                    <option value="" disabled>Choisir un décor</option>
                    <option>Maison de famille</option>
                    <option>Hôtel particulier</option>
                    <option>Jardin ou domaine</option>
                    <option>Lieu à révéler</option>
                  </select>
                </label>
                <label>
                  Invités <output>{weddingGuests} personnes</output>
                  <input type="range" min="20" max="240" step="5" value={weddingGuests} onChange={(event) => setWeddingGuests(Number(event.target.value))} />
                </label>
              </div>
              <div className="wedding-form-bottom">
                <p>Première enveloppe illustrative : <strong>{weddingStartingPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</strong></p>
                <button type="submit" className="button">Recevoir mon premier échange <ArrowUpRight /></button>
              </div>
              {weddingSent && (
                <p className="form-success" role="status">
                  Votre projet est prêt à être confié à l&apos;atelier. Dans une version connectée, cette demande serait transmise à l&apos;équipe mariage.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
