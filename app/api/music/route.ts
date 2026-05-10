import { NextResponse } from 'next/server';
export async function POST(req: Request) {
 const body = await req.json();const API_KEY = process.env.SUNO_API_KEY; // Tambahkan di Settings Vercel
 try {
 const res = await fetch('https://api.goapi.xyz/suno/v1/generation', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'X-API-KEY': API_KEY || ''
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
 return NextResponse.json({ error: 'Server Error' }, { status: 500 });
 }
}
