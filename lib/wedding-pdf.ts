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
 * Runs entirely in the browser (jsPDF), no backend involved.
 */
export function buildWeddingPdf(enquiry: WeddingEnquiry): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 24;
  const contentWidth = pageWidth - margin * 2;
  const ink = "#1e2a33";
  const inkSoft = "#5c6a72";
  let y = 28;

  // Header — wordmark
  doc.setFont("times", "italic");
  doc.setFontSize(26);
  doc.setTextColor(ink);
  doc.text("fleur", margin, y);
  const fleurWidth = doc.getTextWidth("fleur");
  doc.setFont("times", "italic");
  doc.text("IA", margin + fleurWidth, y);

  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(inkSoft);
  doc.text("ATELIER FLORAL — PROTOTYPE DE DÉMONSTRATION", margin, y + 6);

  y += 12;
  doc.setDrawColor(ink);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // Title
  y += 14;
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

  y += 14;
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
    y += 8;
  }

  // Price block
  y += 4;
  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(inkSoft);
  doc.text("ENVELOPPE ILLUSTRATIVE", labelX, y);

  y += 9;
  doc.setFont("times", "bolditalic");
  doc.setFontSize(22);
  doc.setTextColor(ink);
  doc.text(formatPrice(enquiry.price), labelX, y);

  // Disclaimer box
  y += 14;
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
  const footerY = doc.internal.pageSize.getHeight() - 16;
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
