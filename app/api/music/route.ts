import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, title, tags, audio_url, userKey, task_type } = body;

    // Menghubungi GoAPI/KIE AI
    const res = await fetch('https://api.goapi.xyz/suno/v1/generation', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'X-API-KEY': userKey // Kunci dari user Anda
      },
      body: JSON.stringify({
        prompt: prompt || "A beautiful song",
        tags: tags || "pop",
        title: title || "My New Song",
        model: "v3.5",
        // Jika mode cover, kirim audio_url
        ...(task_type === 'cover' && { audio_url: audio_url })
      })
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Koneksi ke API Gagal' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  const userKey = searchParams.get('userKey');

  const res = await fetch(`https://api.goapi.xyz/suno/v1/fetch/${taskId}`, {
    method: 'GET',
    headers: { 'X-API-KEY': userKey || '' }
  });
  const data = await res.json();
  return NextResponse.json(data);
}
