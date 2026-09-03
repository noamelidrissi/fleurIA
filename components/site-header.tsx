"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, MenuIcon } from "./icons";

const links = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/composer", label: "Composer" },
  { href: "/mariage", label: "Mariages" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header page-frame">
      <Link className="wordmark" href="/" aria-label="fleurIA, retour à l'accueil" onClick={() => setMenuOpen(false)}>
        fleur<span>IA</span>
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MenuIcon open={menuOpen} />
      </button>
      <nav id="main-navigation" className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Navigation principale">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={pathname === link.href ? "is-active" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link className="nav-cta button" href="/composer" onClick={() => setMenuOpen(false)}>
          Composer un bouquet <ArrowUpRight />
        </Link>
      </nav>
    </header>
  );
}
