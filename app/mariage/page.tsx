"use client";

import { FormEvent, useMemo, useState } from "react";
import { PlateFrame } from "@/components/plate";
import { ArrowUpRight, Download } from "@/components/icons";
import { buildWeddingPdf, downloadPdf, slugifyNames } from "@/lib/wedding-pdf";

const VENUES = ["Maison de famille", "Hôtel particulier", "Jardin ou domaine", "Lieu à révéler"];

const BASE_PRICE = 1250;
const BASE_GUESTS = 30;
const PRICE_PER_GUEST = 22;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type Touched = { names: boolean; date: boolean; venue: boolean };

export default function MariagePage() {
  const [weddingSent, setWeddingSent] = useState(false);
  const [names, setNames] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [weddingGuests, setWeddingGuests] = useState(80);
  const [touched, setTouched] = useState<Touched>({ names: false, date: false, venue: false });
  const [attempted, setAttempted] = useState(false);

  const min = todayIso();
  const weddingStartingPrice = useMemo(
    () => BASE_PRICE + Math.max(weddingGuests - BASE_GUESTS, 0) * PRICE_PER_GUEST,
    [weddingGuests]
  );

  const dateIsPast = date !== "" && date < min;
  const errors = {
    names: names.trim() === "" ? "Indiquez vos deux prénoms." : "",
    date: date === "" ? "Choisissez une date." : dateIsPast ? "La date ne peut pas être passée." : "",
    venue: venue === "" ? "Choisissez un décor." : "",
  };
  const isValid = !errors.names && !errors.date && !errors.venue;
  const showError = (field: keyof Touched) => (touched[field] || attempted) && errors[field];

  const submitWedding = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (!isValid) return;
    setWeddingSent(true);
  };

  const handleDownloadPdf = () => {
    if (!isValid) return;
    const doc = buildWeddingPdf({
      names,
      date,
      venue,
      guests: weddingGuests,
      basePrice: BASE_PRICE,
      baseGuests: BASE_GUESTS,
      pricePerGuest: PRICE_PER_GUEST,
    });
    downloadPdf(doc, `fleuria-mariage-${slugifyNames(names)}.pdf`);
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
            <ol className="wedding-steps">
              <li><span>01</span>Vous partagez une date et un lieu.</li>
              <li><span>02</span>L&apos;atelier revient sous 48h avec une première intention.</li>
              <li><span>03</span>On ajuste ensemble jusqu&apos;au devis définitif.</li>
            </ol>
            <form className="wedding-form" onSubmit={submitWedding} noValidate>
              <div className="form-grid">
                <label>
                  Vos prénoms
                  <input
                    required
                    name="names"
                    placeholder="Camille &amp; Noé"
                    value={names}
                    onChange={(event) => setNames(event.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, names: true }))}
                    aria-invalid={Boolean(showError("names"))}
                  />
                  {showError("names") && <small className="field-error">{errors.names}</small>}
                </label>
                <label>
                  Date souhaitée
                  <input
                    required
                    name="date"
                    type="date"
                    min={min}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, date: true }))}
                    aria-invalid={Boolean(showError("date"))}
                  />
                  {showError("date") && <small className="field-error">{errors.date}</small>}
                </label>
                <label>
                  Lieu
                  <select
                    required
                    value={venue}
                    onChange={(event) => setVenue(event.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, venue: true }))}
                    aria-invalid={Boolean(showError("venue"))}
                  >
                    <option value="" disabled>Choisir un décor</option>
                    {VENUES.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  {showError("venue") && <small className="field-error">{errors.venue}</small>}
                </label>
                <label>
                  Invités <output>{weddingGuests} personnes</output>
                  <input
                    type="range"
                    min="20"
                    max="240"
                    step="5"
                    list="wedding-guest-marks"
                    value={weddingGuests}
                    onChange={(event) => setWeddingGuests(Number(event.target.value))}
                  />
                  <datalist id="wedding-guest-marks">
                    <option value="20" />
                    <option value="80" />
                    <option value="140" />
                    <option value="200" />
                    <option value="240" />
                  </datalist>
                  <span className="range-bounds"><span>20</span><span>240</span></span>
                </label>
              </div>
              <div className="wedding-form-bottom">
                <div>
                  <p>Première enveloppe illustrative : <strong>{weddingStartingPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</strong></p>
                  <p className="price-explainer">
                    Base de {BASE_PRICE.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })} pour {BASE_GUESTS} invités, puis {PRICE_PER_GUEST}&nbsp;€ par invité supplémentaire — un point de départ à affiner ensemble, non un tarif figé.
                  </p>
                </div>
                <div className="wedding-actions">
                  <button type="button" className="button button-outline" onClick={handleDownloadPdf} disabled={!isValid}>
                    Télécharger le PDF <Download />
                  </button>
                  <button type="submit" className="button" disabled={weddingSent}>
                    {weddingSent ? "Demande envoyée" : "Recevoir mon premier échange"} <ArrowUpRight />
                  </button>
                </div>
              </div>
              {weddingSent && (
                <p className="form-success" role="status">
                  Votre projet est prêt à être confié à l&apos;atelier — réponse sous 48h dans une version connectée. Ceci reste une démonstration : aucune demande n&apos;est réellement transmise, mais vous pouvez garder une trace de votre simulation en PDF.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
