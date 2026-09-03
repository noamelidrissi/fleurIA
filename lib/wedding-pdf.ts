import { jsPDF } from "jspdf";

export type WeddingEnquiry = {
  names: string;
  date: string;
  venue: string;
  guests: number;
  price: number;
};

function formatDateFr(iso: string): string {
  if (!iso) return "—";
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatPrice(value: number): string {
  // Built manually (rather than via Intl) because the PDF's standard fonts don't
  // carry a glyph for the narrow no-break space Intl's fr-FR grouping uses.
  const rounded = Math.round(value);
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} €`;
}

/**
 * Builds a client-side PDF summary of an illustrative wedding enquiry.
 * Runs entirely in the browser (jsPDF), no backend involved. Carries the
 * site's own palette (the pale blue/powder pink/ink tokens from
 * app/globals.css, hand-copied here since a PDF can't read CSS custom
 * properties) so the document reads as the same object as the page it
 * came from rather than a generic black-on-white printout.
 */
export function buildWeddingPdf(enquiry: WeddingEnquiry): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const ink = "#1e2a33";
  const inkSoft = "#5c6a72";
  const ciel = "#a9c6d8";
  const poudre = "#e7c3cd";
  const papier = "#f6f1e8";

  // Full-bleed papier ground, then a hairline frame echoing the site's
  // specimen-plate borders.
  doc.setFillColor(papier);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setDrawColor(ink);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Header band — powder pink, matching the wedding page's own background.
  const bandHeight = 34;
  doc.setFillColor(poudre);
  doc.rect(8, 8, pageWidth - 16, bandHeight, "F");
  doc.setDrawColor(ink);
  doc.setLineWidth(0.4);
  doc.line(8, 8 + bandHeight, pageWidth - 8, 8 + bandHeight);

  doc.setFont("times", "italic");
  doc.setFontSize(24);
  doc.setTextColor(ink);
  doc.text("fleur", margin, 8 + bandHeight / 2 + 3);
  const fleurWidth = doc.getTextWidth("fleur");
  doc.text("IA", margin + fleurWidth, 8 + bandHeight / 2 + 3);

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(ink);
  const subhead = "ATELIER FLORAL — CABINET BOTANIQUE";
  doc.text(subhead, pageWidth - margin - doc.getTextWidth(subhead), 8 + bandHeight / 2 + 3);

  let y = 8 + bandHeight + 16;

  // Title
  doc.setFont("times", "bolditalic");
  doc.setFontSize(19);
  doc.setTextColor(ink);
  doc.text("Proposition illustrative — Mariage", margin, y);

  y += 6;
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(inkSoft);
  doc.text("Résumé de votre demande, à titre indicatif.", margin, y);

  // Field rows
  const rows: Array<[string, string]> = [
    ["COUPLE", enquiry.names || "—"],
    ["DATE SOUHAITÉE", formatDateFr(enquiry.date)],
    ["LIEU", enquiry.venue || "—"],
    ["NOMBRE D'INVITÉS", `${enquiry.guests} personnes`],
  ];

  y += 12;
  const labelX = margin;
  const valueX = margin + 56;

  for (const [label, value] of rows) {
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(inkSoft);
    doc.text(label, labelX, y);

    doc.setFont("times", "normal");
    doc.setFontSize(12.5);
    doc.setTextColor(ink);
    doc.text(value, valueX, y);

    y += 5;
    doc.setDrawColor(224, 220, 210);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
  }

  // Price block — pale blue panel, matching the composer/mariage estimate panels.
  y += 4;
  const priceBoxHeight = 30;
  doc.setFillColor(ciel);
  doc.rect(margin, y, contentWidth, priceBoxHeight, "F");
  doc.setDrawColor(ink);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, priceBoxHeight);

  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(ink);
  doc.text("ENVELOPPE ILLUSTRATIVE", labelX + 6, y + 10);

  doc.setFont("times", "bolditalic");
  doc.setFontSize(22);
  doc.text(formatPrice(enquiry.price), labelX + 6, y + 23);

  y += priceBoxHeight + 12;

  // Disclaimer box
  const boxHeight = 22;
  doc.setDrawColor(ink);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, boxHeight);
  doc.setFont("times", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(inkSoft);
  const disclaimer = doc.splitTextToSize(
    "Cette estimation est illustrative et provient d'un prototype de démonstration : elle n'a pas de valeur contractuelle, ne constitue pas un devis engageant et n'enregistre aucune commande.",
    contentWidth - 10
  );
  doc.text(disclaimer, margin + 5, y + 7);

  // Footer
  const footerY = pageHeight - 16;
  doc.setDrawColor(ink);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(inkSoft);
  const generatedOn = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  doc.text(`GÉNÉRÉ LE ${generatedOn.toUpperCase()} · FLEURIA.DEMO`, margin, footerY);

  return doc;
}

/**
 * Triggers the browser download of a jsPDF document. Deliberately bypasses
 * jsPDF's own `.save()`, which internally falls back to `window.open()` on
 * Safari — a call that isn't always recognized as a direct user gesture and
 * gets silently swallowed by the popup blocker (the download then appears to
 * do nothing). A manually built object-URL anchor, clicked synchronously in
 * the same tick as the triggering event, is the reliable cross-browser path.
 *
 * The blob is re-wrapped as `application/octet-stream` rather than jsPDF's
 * default `application/pdf`: Safari special-cases the PDF mime type on blob
 * URLs and navigates to it in the same tab instead of downloading it, even
 * with `download` set on the anchor. Generic binary data doesn't get that
 * treatment, and the `.pdf` extension in `download` still names the file
 * correctly — the bytes are an untouched, valid PDF either way.
 */
export function downloadPdf(doc: jsPDF, filename: string): void {
  const pdfBlob = doc.output("blob");
  const blob = new Blob([pdfBlob], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke on a delay so Safari has time to actually start the download
  // before the underlying blob is freed.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slugifyNames(names: string): string {
  const slug = names
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "projet";
}
