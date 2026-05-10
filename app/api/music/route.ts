// Ganti bagian POST di file app/api/music/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, audio_url, userKey, task_type } = body;

    if (!userKey) return NextResponse.json({ error: 'API Key Kosong' }, { status: 400 });

    // Tentukan endpoint & payload berdasarkan mode
    let endpoint = 'https://api.goapi.xyz/suno/v1/generation';
    let payload: any = {
      prompt: prompt,
      model: 'v3.5',
    };

    if (task_type === 'cover') {
      endpoint = 'https://api.goapi.xyz/suno/v1/cover';
      payload = {
        audio_url: audio_url,
        prompt: prompt, // Lirik atau gaya vokal baru
        model: 'v3.5'
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': userKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
