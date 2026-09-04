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
            <h1>Le bouquet<br />à votre image.</h1>
            <p className="lede">
              fleurIA compose votre bouquet à partir d&apos;espèces choisies et documentées avec soin,
              pour une déclaration, un mariage ou simplement pour dire merci.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/composer">
                Composer mon bouquet <ArrowUpRight />
              </Link>
              <Link className="text-link" href="/catalogue">Découvrir nos fleurs</Link>
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
          <span>Faire défiler pour découvrir nos fleurs</span>
          <Link href="/catalogue">Voir toutes nos fleurs <ArrowUpRight /></Link>
        </div>
      </section>

      <section className="page-frame section-pad">
        <div className="page-intro">
          <h2>Trois fleurs<br />en ce moment.</h2>
          <p>Un aperçu de notre sélection. Les six fleurs disponibles ce mois-ci, avec leur origine, sont réunies dans notre catalogue complet.</p>
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
            <h3>1. Choisir une fleur</h3>
            <p>Pas encore décidé ? Parcourez notre catalogue de fleurs et décrivez votre envie à l&apos;assistant : il vous aide à choisir.</p>
            <Link className="text-link" href="/catalogue">Voir le catalogue <ArrowUpRight /></Link>
          </div>
          <div className="feature-row">
            <h3>2. Composer votre bouquet</h3>
            <p>Choisissez la fleur, le nombre de tiges et la finition, puis achetez votre bouquet directement en ligne.</p>
            <Link className="text-link" href="/composer">Composer <ArrowUpRight /></Link>
          </div>
          <div className="feature-row">
            <h3>Organiser un mariage</h3>
            <p>Un projet à plus grande échelle ? Ce parcours est séparé : confiez-nous vos dates et votre lieu, nous vous envoyons un premier devis estimatif.</p>
            <Link className="text-link" href="/mariage">Faire une demande <ArrowUpRight /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
