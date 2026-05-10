import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, audio_url, userKey, task_type } = body;

    if (!userKey) return NextResponse.json({ error: 'API Key Kosong' }, { status: 400 });

    // Cek apakah ini mode Cover atau Generate biasa
    const endpoint = task_type === 'cover' 
      ? 'https://api.goapi.xyz/suno/v1/cover' 
      : 'https://api.goapi.xyz/suno/v1/generation';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': userKey
      },
      body: JSON.stringify({
        prompt: prompt,
        audio_url: audio_url, // Diperlukan untuk mode Cover
        model: 'v3.5',
      })
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// Fungsi GET untuk polling tetap sama seperti sebelumnya
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  const userKey = searchParams.get('userKey');
  try {
    const res = await fetch(`https://api.goapi.xyz/suno/v1/fetch/${taskId}`, {
      method: 'GET',
      headers: { 'X-API-KEY': userKey || '' }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
