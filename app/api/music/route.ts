import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, title, tags, audio_url, userKey, task_type } = body;

    if (!userKey) return NextResponse.json({ error: 'API Key Kosong' }, { status: 400 });

    // Endpoint sesuai dokumentasi terbaru
    let endpoint = 'https://api.goapi.xyz/suno/v1/generation';
    let payload: any = {
      prompt: prompt,
      tags: tags || 'pop',
      title: title || 'New Song',
      model: 'v3.5',
      mv: 'chirp-v3-5'
    };

    if (task_type === 'cover') {
      endpoint = 'https://api.goapi.xyz/suno/v1/cover';
      payload = {
        audio_url: audio_url,
        prompt: prompt,
        tags: tags,
        title: title
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': userKey },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

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
  } catch (e) { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}
