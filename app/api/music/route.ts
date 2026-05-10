import { NextResponse } from 'next/server';

// 1. FUNGSI UNTUK CEK STATUS LAGU (GET)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  const userKey = searchParams.get('userKey');

  if (!taskId || !userKey) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.goapi.xyz/suno/v1/fetch/${taskId}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': userKey
      }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Gagal cek status' }, { status: 500 });
  }
}

// 2. FUNGSI UNTUK BUAT LAGU BARU (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model, userKey } = body;

    if (!userKey) {
      return NextResponse.json({ error: 'API Key Kosong' }, { status: 400 });
    }

    const res = await fetch('https://api.goapi.xyz/suno/v1/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': userKey
      },
      body: JSON.stringify({
        prompt: prompt,
        model: model || 'v3.5',
        tags: 'high quality, masterpiece'
      })
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
