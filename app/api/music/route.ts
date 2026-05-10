import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Mengambil API Key yang dimasukkan user di website Anda
    const USER_API_KEY = body.userKey; 

    const res = await fetch('https://api.goapi.xyz/suno/v1/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': USER_API_KEY // Key manual dari user
      },
      body: JSON.stringify({
        prompt: body.prompt,
        model: body.model || 'v3.5',
        tags: 'pop, high quality'
      })
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Koneksi API Gagal' }, { status: 500 });
  }
}
