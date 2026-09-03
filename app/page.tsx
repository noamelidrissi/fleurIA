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
            <PlateFrame src="/images/atelier/wrapping.jpg" alt="L'atelier compose un bouquet à la main" width={800} height={1000} priority />
            <div className="hero-inset">
              <PlateFrame src="/images/specimens/peony.jpg" alt="Pivoine, Paeonia lactiflora" width={400} height={500} priority />
            </div>
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
              <Link className="text-link" href={`/composer?espece=${plate.key}`}>Composer avec cette espèce <ArrowUpRight /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page-frame section-pad">
        <div className="page-intro">
          <h2>Comment<br />procéder.</h2>
          <p>Pas sûr par où commencer ? Voici comment se déroule une commande.</p>
        </div>
        <div className="feature-index">
          <div className="feature-row">
            <h3>1. Le cabinet</h3>
            <p>Pas encore fixé sur une espèce ? Parcourez le cabinet et décrivez votre besoin à l&apos;assistant : il vous oriente vers une espèce précise.</p>
            <Link className="text-link" href="/catalogue">Ouvrir <ArrowUpRight /></Link>
          </div>
          <div className="feature-row">
            <h3>2. Le générateur</h3>
            <p>Choisissez l&apos;espèce, la densité et la finition, puis envoyez votre composition à l&apos;atelier.</p>
            <Link className="text-link" href="/composer">Ouvrir <ArrowUpRight /></Link>
          </div>
          <div className="feature-row">
            <h3>Le mariage</h3>
            <p>Un projet à plus grande échelle ? Ce parcours est séparé : confiez vos dates et votre lieu, l&apos;atelier compose une première enveloppe.</p>
            <Link className="text-link" href="/mariage">Ouvrir <ArrowUpRight /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
