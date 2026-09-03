import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer page-frame">
      <div>
        <Link className="wordmark" href="/">fleur<span>IA</span></Link>
        <p>Un atelier floral pour les grands élans.</p>
      </div>
      <div className="footer-links">
        <Link href="/catalogue">Catalogue</Link>
        <Link href="/composer">Composer</Link>
        <Link href="/mariage">Mariages</Link>
      </div>
    </footer>
  );
}
