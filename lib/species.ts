export type SpeciesKey = "hortensia" | "rose" | "anemone" | "iris" | "cosmos" | "pivoine";

export const plates: {
  key: SpeciesKey;
  common: string;
  latin: string;
  accession: string;
  note: string;
  detail: string;
  ground: "plate-card-ciel" | "plate-card-papier" | "plate-card-rouge";
  photo: string;
  swatch: string;
  talk: string;
}[] = [
  {
    key: "hortensia",
    common: "Hortensia",
    latin: "Hydrangea macrophylla",
    accession: "N° 012",
    note: "Bleus minéraux, tenue en vase longue.",
    detail: "hortensias et bleus minéraux",
    ground: "plate-card-ciel",
    photo: "/images/specimens/hydrangea.jpg",
    swatch: "mood-ciel",
    talk:
      "L’hortensia (Hydrangea macrophylla) fleurit en général de juin à septembre et tient dix à douze jours en vase si la tige est fendue dès la coupe. Sa masse bleu minéral structure un bouquet sans l’alourdir — je l’accorde souvent à la rose de jardin pour réchauffer la teinte.",
  },
  {
    key: "rose",
    common: "Rose de jardin",
    latin: "Rosa × damascena",
    accession: "N° 018",
    note: "Parfum ancien, pétale mousseux.",
    detail: "roses et parfums anciens",
    ground: "plate-card-papier",
    photo: "/images/specimens/rose.jpg",
    swatch: "mood-poudre-deep",
    talk:
      "La rose de jardin (Rosa × damascena) est disponible de mai à octobre selon les arrivages, avec un pétale mousseux et un parfum ancien qui en font un choix classique pour une déclaration. Comptez environ une semaine de tenue — je la marie volontiers à l’anémone pour un contraste de cœur sombre.",
  },
  {
    key: "anemone",
    common: "Anémone",
    latin: "Anemone coronaria",
    accession: "N° 021",
    note: "Cœur sombre, tige gracile.",
    detail: "anémones et cœurs sombres",
    ground: "plate-card-rouge",
    photo: "/images/specimens/anemone.jpg",
    swatch: "mood-encre",
    talk:
      "L’anémone (Anemone coronaria) apparaît en fin d’hiver et au printemps ; son cœur sombre et sa tige gracile lui donnent une allure plus graphique qu’une rose. Sa tenue est brève, quatre à six jours — une espèce à offrir plutôt qu’à faire attendre, que j’associe bien à l’iris.",
  },
  {
    key: "iris",
    common: "Iris",
    latin: "Iris japonica",
    accession: "N° 026",
    note: "Pétales frangés, veines safran.",
    detail: "iris et pétales frangés",
    ground: "plate-card-ciel",
    photo: "/images/specimens/iris.jpg",
    swatch: "mood-ciel-deep",
    talk:
      "L’iris (Iris japonica) fleurit au printemps ; ses pétales frangés aux veines safran apportent une touche presque calligraphique à une composition. Sa tenue est courte, trois à cinq jours, mais son entrée en scène est mémorable — je l’allège volontiers avec du cosmos.",
  },
  {
    key: "cosmos",
    common: "Cosmos",
    latin: "Cosmos bipinnatus",
    accession: "N° 031",
    note: "Silhouette légère, feuillage fin.",
    detail: "cosmos et silhouette légère",
    ground: "plate-card-papier",
    photo: "/images/specimens/cosmos.jpg",
    swatch: "mood-papier-deep",
    talk:
      "Le cosmos (Cosmos bipinnatus) est une fleur d’été, de juillet à septembre, à la silhouette légère et au feuillage fin. Il tient cinq à sept jours en vase et apporte du mouvement à une composition plus dense, comme celle de la pivoine.",
  },
  {
    key: "pivoine",
    common: "Pivoine",
    latin: "Paeonia lactiflora",
    accession: "N° 014",
    note: "Carnations poudrées, tenue courte.",
    detail: "pivoines et carnations poudrées",
    ground: "plate-card-rouge",
    photo: "/images/specimens/peony.jpg",
    swatch: "mood-poudre",
    talk:
      "La pivoine (Paeonia lactiflora) a une saison courte, de mai à juin, et une tenue tout aussi brève — trois à cinq jours une fois épanouie. Ses carnations poudrées en font l’espèce la plus demandée pour un mariage ; je la marie à l’hortensia pour prolonger la tenue générale du bouquet.",
  },
];

export function findSpecies(key: string | null | undefined): (typeof plates)[number] | undefined {
  return plates.find((plate) => plate.key === key);
}

export const catalogNotes: Record<string, string> = {
  "Quel bouquet pour une déclaration ?":
    "J’ouvrirais la planche avec la rose de jardin — pétale mousseux, parfum ancien — puis j’ajouterais l’anémone à cœur sombre pour éviter le trop classique. Les deux se trouvent au cabinet ce mois-ci et tiennent bien en vase.",
  "Je cherche des fleurs de saison":
    "En ce moment, le cabinet met en avant l’hortensia et le cosmos, tous deux disponibles jusqu’en septembre. Dites-moi la palette qui vous attire et la date envisagée : le catalogue réel affinera ensuite selon l’arrivage exact.",
  "Comment fonctionne la livraison ?":
    "L’atelier coordonne chaque livraison selon l’adresse et le créneau souhaité, généralement sous 24 à 48 heures en zone urbaine. Ceci reste une réponse de démonstration : les zones et créneaux réels seront connectés au service de livraison.",
};

const catalogueFallback =
  "Je n’ai pas encore cette précision dans le cabinet. Parmi les six planches présentées — hortensia, rose, anémone, iris, cosmos, pivoine — laquelle vous inspire, ou quelle occasion cherchez-vous à marquer ?";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Finds the cabinet species named (by common or Latin name) inside a message,
 * if any. Used both to ground the local fallback reply and to let the UI
 * offer a direct "compose with this species" action after a recommendation.
 */
export function matchSpecies(message: string): (typeof plates)[number] | undefined {
  const normalized = normalize(message);
  return plates.find(
    (candidate) =>
      normalized.includes(normalize(candidate.common)) || normalized.includes(normalize(candidate.latin))
  );
}

/**
 * Resolves a visitor message to a grounded reply: a curated FAQ answer if the
 * message is one of the suggested prompts, a specimen-specific answer if the
 * message names one of the six cabinet species (by common or Latin name), or
 * an honest fallback that offers a concrete next step rather than a vague or
 * generic non-answer. Used as the offline/error fallback when the live
 * Mistral call is unavailable.
 */
export function resolveCatalogueReply(message: string): string {
  if (catalogNotes[message]) return catalogNotes[message];
  const plate = matchSpecies(message);
  return plate ? plate.talk : catalogueFallback;
}
