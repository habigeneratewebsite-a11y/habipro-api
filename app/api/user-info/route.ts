import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userKey } = await req.json();

    if (!userKey) {
      return NextResponse.json({ error: 'Key diperlukan' }, { status: 400 });
    }

    // Menghubungi provider (GoAPI/Apiframe) untuk cek profil & kredit
    const res = await fetch('https://api.goapi.xyz/suno/v1/user/profile', {
      method: 'GET',
      headers: {
        'X-API-KEY': userKey
      }
    });

    const data = await res.json();
    
    // Kembalikan data kredit ke tampilan depan
    return NextResponse.json({
      credit: data.data?.credit || 0,
      plan: data.data?.plan || 'Free'
    });
  } catch (e) {
    return NextResponse.json({ error: 'Gagal fetch saldo' }, { status: 500 });
  }
}
