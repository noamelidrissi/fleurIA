export type Mood = "peony" | "hydrangea" | "anemone";

export const moods: Record<
  Mood,
  { label: string; latin: string; detail: string; swatch: string; photo: string }
> = {
  peony: {
    label: "Pivoine",
    latin: "Paeonia lactiflora",
    detail: "pivoines et carnations poudrées",
    swatch: "mood-poudre",
    photo: "/images/specimens/peony.jpg",
  },
  hydrangea: {
    label: "Hortensia",
    latin: "Hydrangea macrophylla",
    detail: "hortensias et bleus minéraux",
    swatch: "mood-ciel",
    photo: "/images/specimens/hydrangea.jpg",
  },
  anemone: {
    label: "Anémone",
    latin: "Anemone coronaria",
    detail: "anémones et roses tendres",
    swatch: "mood-encre",
    photo: "/images/specimens/anemone.jpg",
  },
};

export const plates: {
  key: string;
  common: string;
  latin: string;
  accession: string;
  note: string;
  ground: "plate-card-ciel" | "plate-card-poudre" | "plate-card-papier";
  photo: string;
}[] = [
  {
    key: "hortensia",
    common: "Hortensia",
    latin: "Hydrangea macrophylla",
    accession: "N° 012",
    note: "Bleus minéraux, tenue en vase longue.",
    ground: "plate-card-ciel",
    photo: "/images/specimens/hydrangea.jpg",
  },
  {
    key: "rose",
    common: "Rose de jardin",
    latin: "Rosa × damascena",
    accession: "N° 018",
    note: "Parfum ancien, pétale mousseux.",
    ground: "plate-card-poudre",
    photo: "/images/specimens/rose.jpg",
  },
  {
    key: "anemone",
    common: "Anémone",
    latin: "Anemone coronaria",
    accession: "N° 021",
    note: "Cœur sombre, tige gracile.",
    ground: "plate-card-papier",
    photo: "/images/specimens/anemone.jpg",
  },
  {
    key: "iris",
    common: "Iris",
    latin: "Iris japonica",
    accession: "N° 026",
    note: "Pétales frangés, veines safran.",
    ground: "plate-card-ciel",
    photo: "/images/specimens/iris.jpg",
  },
  {
    key: "cosmos",
    common: "Cosmos",
    latin: "Cosmos bipinnatus",
    accession: "N° 031",
    note: "Silhouette légère, feuillage fin.",
    ground: "plate-card-poudre",
    photo: "/images/specimens/cosmos.jpg",
  },
  {
    key: "pivoine",
    common: "Pivoine",
    latin: "Paeonia lactiflora",
    accession: "N° 014",
    note: "Carnations poudrées, tenue courte.",
    ground: "plate-card-papier",
    photo: "/images/specimens/peony.jpg",
  },
];

export const catalogNotes: Record<string, string> = {
  "Quel bouquet pour une déclaration ?":
    "Pour une déclaration, j’ouvrirais la planche avec des roses de jardin, puis une espèce plus inattendue — une fritillaire, par exemple — pour éviter le déjà-vu.",
  "Je cherche des fleurs de saison":
    "Je peux filtrer le cabinet selon la saison et l’arrivage. Dites-moi la date et la palette qui vous attire : le catalogue réel prendra ensuite le relais.",
  "Comment fonctionne la livraison ?":
    "L’atelier coordonne chaque livraison selon l’adresse et le créneau souhaité. Cette réponse est une démonstration : les zones et créneaux réels seront connectés au service de livraison.",
};
