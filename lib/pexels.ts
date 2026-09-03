const PEXELS_API_BASE = "https://api.pexels.com/v1";

export type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  alt: string;
  photographer: string;
  photographerUrl: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
};

function getApiKey(): string {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    throw new Error(
      "PEXELS_API_KEY is missing. Add it to .env.local (see .env.local.example)."
    );
  }
  return key;
}

function mapPhoto(raw: any): PexelsPhoto {
  return {
    id: raw.id,
    width: raw.width,
    height: raw.height,
    alt: raw.alt ?? "",
    photographer: raw.photographer,
    photographerUrl: raw.photographer_url,
    src: raw.src,
  };
}

export async function searchPhotos(
  query: string,
  options: { perPage?: number; page?: number; orientation?: "landscape" | "portrait" | "square" } = {}
): Promise<PexelsPhoto[]> {
  const params = new URLSearchParams({
    query,
    per_page: String(options.perPage ?? 10),
    page: String(options.page ?? 1),
  });
  if (options.orientation) params.set("orientation", options.orientation);

  const response = await fetch(`${PEXELS_API_BASE}/search?${params.toString()}`, {
    headers: { Authorization: getApiKey() },
  });

  if (!response.ok) {
    throw new Error(`Pexels search failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return (data.photos ?? []).map(mapPhoto);
}

export async function getCuratedPhotos(
  options: { perPage?: number; page?: number } = {}
): Promise<PexelsPhoto[]> {
  const params = new URLSearchParams({
    per_page: String(options.perPage ?? 10),
    page: String(options.page ?? 1),
  });

  const response = await fetch(`${PEXELS_API_BASE}/curated?${params.toString()}`, {
    headers: { Authorization: getApiKey() },
  });

  if (!response.ok) {
    throw new Error(`Pexels curated fetch failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return (data.photos ?? []).map(mapPhoto);
}
