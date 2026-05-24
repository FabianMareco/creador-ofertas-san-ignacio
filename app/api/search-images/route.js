// app/api/search-images/route.js
// Proxies requests to Pexels API to keep the API key server-side

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'food product';
  const page = searchParams.get('page') || 1;

  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'PEXELS_API_KEY no configurada. Ver README.md para instrucciones.' },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&page=${page}&orientation=portrait`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 300 }, // cache 5min
      }
    );

    if (!res.ok) {
      return Response.json({ error: 'Error al buscar imágenes' }, { status: res.status });
    }

    const data = await res.json();

    // Return simplified data
    const photos = (data.photos || []).map((p) => ({
      id: p.id,
      url: p.src.large, // ~940px wide
      preview: p.src.medium, // ~350px wide
      alt: p.alt || query,
      photographer: p.photographer,
    }));

    return Response.json({ photos, total: data.total_results });
  } catch (err) {
    return Response.json({ error: 'Error de red al buscar imágenes' }, { status: 500 });
  }
}
