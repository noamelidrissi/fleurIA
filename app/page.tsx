import Link from "next/link";
import { PlateFrame, PlateCaption } from "@/components/plate";
import { ArrowUpRight } from "@/components/icons";
import { plates } from "@/lib/species";

const featured = plates.slice(0, 3);

export default function Home() {
  return (
    <main>
      <section className="page-hero">
        <div className="page-frame specimen-hero">
          <div className="specimen-lead">
            <h1>L&apos;art d&apos;offrir,<br />une fleur à la fois.</h1>
            <p className="lede">
              fleurIA compose votre bouquet à partir d&apos;espèces choisies et documentées avec soin,
              pour une déclaration, un mariage ou simplement pour dire merci.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/composer">
                Composer mon bouquet <ArrowUpRight />
              </Link>
              <Link className="text-link" href="/catalogue">Découvrir le cabinet</Link>
            </div>
            <div className="meta-line">
              <span>Aujourd&apos;hui : Pivoine</span>
              <span>Paeonia lactiflora · N° 014</span>
            </div>
          </div>
          <figure className="hero-plate">
            <PlateFrame src="/images/specimens/peony.jpg" alt="Pivoine, Paeonia lactiflora" width={800} height={1000} priority />
          </figure>
        </div>
        <div className="page-frame hero-scroll">
          <span>Faire défiler pour voir les espèces</span>
          <Link href="/catalogue">Voir le cabinet complet <ArrowUpRight /></Link>
        </div>
      </section>

      <section className="page-frame section-pad">
        <div className="page-intro">
          <h2>Trois espèces<br />en ce moment.</h2>
          <p>Un aperçu du cabinet. Les six planches et leur provenance sont réunies au complet dans le cabinet.</p>
        </div>
        <div className="plates-grid">
          {featured.map((plate) => (
            <article className={`plate-card ${plate.ground}`} key={plate.key}>
              <PlateFrame src={plate.photo} alt={`${plate.common}, ${plate.latin}`} width={600} height={600} priority />
              <PlateCaption latin={plate.latin} common={`${plate.common} · ${plate.note}`} accession={plate.accession} />
            </article>
          ))}
        </div>
      </section>

      <section className="page-frame section-pad">
        <div className="page-intro">
          <h2>Trois façons<br />de commencer.</h2>
          <p>Chaque parcours vit sur sa propre page.</p>
        </div>
        <div className="feature-index">
          <div className="feature-row">
            <h3>Le cabinet</h3>
            <p>Parcourez les espèces disponibles et posez vos questions à l&apos;assistant catalogue.</p>
            <Link className="text-link" href="/catalogue">Ouvrir <ArrowUpRight /></Link>
          </div>
          <div className="feature-row">
            <h3>Le générateur</h3>
            <p>Choisissez une espèce, une densité, une finition, et recevez une estimation.</p>
            <Link className="text-link" href="/composer">Ouvrir <ArrowUpRight /></Link>
          </div>
          <div className="feature-row">
            <h3>Le mariage</h3>
            <p>Confiez vos dates et votre lieu, l&apos;atelier compose une première enveloppe.</p>
            <Link className="text-link" href="/mariage">Ouvrir <ArrowUpRight /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
