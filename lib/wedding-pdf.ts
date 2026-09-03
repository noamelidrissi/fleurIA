import { jsPDF } from "jspdf";

export type WeddingEnquiry = {
  names: string;
  date: string;
  venue: string;
  guests: number;
  basePrice: number;
  baseGuests: number;
  pricePerGuest: number;
};

function formatDateFr(value: string | Date): string {
  if (!value) return "—";
  // A plain `YYYY-MM-DD` string (from a <input type="date">) parses as UTC
  // midnight; anchoring it to local noon avoids the date shifting by a day
  // in timezones behind UTC. A Date object (e.g. "now" or "now + 30 days")
  // is already a real instant and needs no such adjustment.
  const parsed = typeof value === "string" ? new Date(`${value}T12:00:00`) : value;
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatPrice(value: number): string {
  // Built manually (rather than via Intl) because the PDF's standard fonts don't
  // carry a glyph for the narrow no-break space Intl's fr-FR grouping uses.
  const rounded = Math.round(value);
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} €`;
}

/** Deterministic devis reference from the enquiry itself, not random — the same
 * request regenerated (e.g. after fixing a typo) yields the same number. */
function devisReference(enquiry: WeddingEnquiry): string {
  const basis = `${enquiry.names}|${enquiry.date}|${enquiry.venue}|${enquiry.guests}`;
  let hash = 0;
  for (let i = 0; i < basis.length; i += 1) {
    hash = (hash * 31 + basis.charCodeAt(i)) >>> 0;
  }
  const year = enquiry.date ? enquiry.date.slice(0, 4) : new Date().getFullYear().toString();
  return `FL-${year}-${(hash % 9000 + 1000).toString()}`;
}

function addDays(base: Date, days: number): Date {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Builds a client-side PDF quote (devis) for an illustrative wedding
 * enquiry. Runs entirely in the browser (jsPDF), no backend involved.
 * Structured like an actual devis a florist would send — reference number,
 * issue/validity dates, issuer/client blocks, an itemized line table, and a
 * signature area — rather than a marketing summary card, while keeping the
 * site's own ink/serif register instead of a generic invoice template.
 */
export function buildWeddingPdf(enquiry: WeddingEnquiry): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const ink = "#1e2a33";
  const inkSoft = "#5c6a72";
  const hairline = "#c9c2b4";

  const issueDate = new Date();
  const reference = devisReference(enquiry);
  const extraGuests = Math.max(enquiry.guests - enquiry.baseGuests, 0);
  const extraCost = extraGuests * enquiry.pricePerGuest;
  const total = enquiry.basePrice + extraCost;

  let y = margin;

  // Letterhead: wordmark + atelier line on the left, devis identity on the right.
  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.setTextColor(ink);
  doc.text("fleur", margin, y);
  const fleurWidth = doc.getTextWidth("fleur");
  doc.text("IA", margin + fleurWidth, y);

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(inkSoft);
  doc.text("Atelier floral · 14 rue des Tanneurs, 75011 Paris", margin, y + 5);
  doc.text("SIRET 000 000 000 00000 · contact@fleuria.demo", margin, y + 9);

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(ink);
  doc.text(`DEVIS N° ${reference}`, pageWidth - margin, y - 1, { align: "right" });

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(inkSoft);
  doc.text(`Émis le ${formatDateFr(issueDate)}`, pageWidth - margin, y + 5, { align: "right" });
  doc.text(`Valable jusqu'au ${formatDateFr(addDays(issueDate, 30))}`, pageWidth - margin, y + 9, {
    align: "right",
  });

  y += 16;
  doc.setDrawColor(ink);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);

  // Issuer / client two-column block.
  y += 10;
  const colWidth = contentWidth / 2 - 6;
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(inkSoft);
  doc.text("ÉMIS PAR", margin, y);
  doc.text("DESTINATAIRE", margin + colWidth + 12, y);

  y += 5;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(ink);
  const issuerLines = ["fleurIA — atelier floral", "14 rue des Tanneurs, 75011 Paris"];
  const clientLines = [
    enquiry.names || "—",
    `Le ${formatDateFr(enquiry.date)} · ${enquiry.venue || "lieu à préciser"}`,
    `${enquiry.guests} invités`,
  ];
  // Wrap each line to its column width (a long couple name shouldn't run
  // into or past the client column's own right edge, let alone the page
  // margin) and track how many wrapped rows the tallest column actually used.
  let issuerRows = 0;
  issuerLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, colWidth);
    doc.text(wrapped, margin, y + issuerRows * 5);
    issuerRows += wrapped.length;
  });
  let clientRows = 0;
  clientLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, colWidth);
    doc.text(wrapped, margin + colWidth + 12, y + clientRows * 5);
    clientRows += wrapped.length;
  });

  y += Math.max(issuerRows, clientRows) * 5 + 10;

  // Line-item table.
  const cols = {
    label: margin,
    qty: margin + contentWidth * 0.56,
    unit: margin + contentWidth * 0.72,
    total: pageWidth - margin,
  };

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(inkSoft);
  doc.text("DÉSIGNATION", cols.label, y);
  doc.text("QTÉ", cols.qty, y, { align: "right" });
  doc.text("PRIX UNIT.", cols.unit, y, { align: "right" });
  doc.text("TOTAL", cols.total, y, { align: "right" });

  y += 3;
  doc.setDrawColor(ink);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  type Row = { label: string; qty: string; unit: string; total: string };
  const items: Row[] = [
    {
      label: `Scénographie florale de base (jusqu'à ${enquiry.baseGuests} invités)`,
      qty: "1",
      unit: formatPrice(enquiry.basePrice),
      total: formatPrice(enquiry.basePrice),
    },
  ];
  if (extraGuests > 0) {
    items.push({
      label: "Invités supplémentaires",
      qty: String(extraGuests),
      unit: formatPrice(enquiry.pricePerGuest),
      total: formatPrice(extraCost),
    });
  }

  y += 9;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(ink);
  for (const item of items) {
    const wrapped = doc.splitTextToSize(item.label, cols.qty - cols.label - 8);
    doc.text(wrapped, cols.label, y);
    doc.text(item.qty, cols.qty, y, { align: "right" });
    doc.text(item.unit, cols.unit, y, { align: "right" });
    doc.text(item.total, cols.total, y, { align: "right" });
    const rowHeight = Math.max(wrapped.length, 1) * 5 + 4;
    y += rowHeight;
    doc.setDrawColor(hairline);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 3, pageWidth - margin, y - 3);
  }

  y += 4;
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(inkSoft);
  doc.text("TVA non applicable — art. 293 B du CGI", cols.label, y);

  y += 8;
  doc.setDrawColor(ink);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  doc.setFont("times", "bolditalic");
  doc.setFontSize(15);
  doc.setTextColor(ink);
  doc.text("TOTAL ESTIMÉ", cols.label, y);
  doc.text(formatPrice(total), cols.total, y, { align: "right" });

  // Signature area.
  y += 20;
  const signWidth = contentWidth * 0.42;
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(inkSoft);
  doc.text("BON POUR ACCORD — DATE ET SIGNATURE", margin, y);
  doc.setDrawColor(ink);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 16, margin + signWidth, y + 16);

  // Conditions.
  y += 26;
  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(inkSoft);
  const disclaimer = doc.splitTextToSize(
    "Devis établi à titre indicatif et non engageant, généré dans le cadre d'un prototype de démonstration : aucune commande n'est enregistrée. Les tarifs réels dépendront des espèces disponibles à la date de l'événement.",
    contentWidth
  );
  doc.text(disclaimer, margin, y);

  // Footer.
  const footerY = pageHeight - 14;
  doc.setDrawColor(hairline);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(inkSoft);
  doc.text(`${reference} · FLEURIA.DEMO`, margin, footerY);
  doc.text("1/1", pageWidth - margin, footerY, { align: "right" });

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
