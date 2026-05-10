'use client';
import React, { useState } from 'react';

export default function HabiAPI() {
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState('generate');
  const [form, setForm] = useState({ prompt: '', title: '', tags: '', audio_url: '' });
  const [status, setStatus] = useState('SIAP');
  const [songUrl, setSongUrl] = useState('');

  const jalankan = async () => {
    if (!apiKey) return alert("API KEY KOSONG!");
    setStatus('MENGIRIM KE SERVER...');
    
    try {
      // Kita langsung tembak ke KIE AI dari sini, tanpa lewat folder API yang ribet
      const res = await fetch('https://api.goapi.xyz/suno/v1/generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
        body: JSON.stringify({
          prompt: form.prompt || "Lagu keren",
          tags: form.tags || "pop",
          title: form.title || "Lagu Baru",
          model: "v3.5",
          ...(mode === 'cover' && { audio_url: form.audio_url })
        })
      });

      const data = await res.json();
      const id = data.data?.task_id || data.task_id;

      if (id) {
        setStatus('LAGU SEDANG DIBUAT... TUNGGU 1 MENIT');
        const cekStatus = setInterval(async () => {
          const resCek = await fetch(`https://api.goapi.xyz/suno/v1/fetch/${id}`, {
            headers: { 'X-API-KEY': apiKey }
          });
          const dataCek = await resCek.json();
          if (dataCek.data?.status === 'completed') {
            setSongUrl(dataCek.data.audio_url);
            setStatus('BERHASIL!');
            clearInterval(cekStatus);
          } else if (dataCek.data?.status === 'failed') {
            setStatus('GAGAL DARI SERVER');
            clearInterval(cekStatus);
          }
        }, 10000);
      } else {
        setStatus('ERROR: ' + (data.message || 'Cek Saldo/Key'));
      }
    } catch (e) {
      setStatus('KONEKSI BERMASALAH');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 bg-slate-50 min-h-screen">
      <div className="bg-blue-600 text-white p-6 rounded-[2rem] font-black text-center text-xl">HABI PRO AI</div>
      
      <div className="bg-white p-5 rounded-[2rem] border shadow-sm space-y-4">
        <input className="w-full p-3 bg-slate-100 rounded-xl text-sm outline-none border-none" type="password" placeholder="API KEY ANDA" onChange={e => setApiKey(e.target.value)} />
        
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setMode('generate')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${mode==='generate'?'bg-white shadow text-blue-600':'text-slate-400'}`}>GENERATE</button>
          <button onClick={() => setMode('cover')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${mode==='cover'?'bg-white shadow text-blue-600':'text-slate-400'}`}>COVER</button>
        </div>

        <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Judul Lagu" onChange={e => setForm({...form, title: e.target.value})} />
        <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Genre (Dangdut, Pop...)" onChange={e => setForm({...form, tags: e.target.value})} />
        {mode === 'cover' && <input className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm" placeholder="Link MP3 untuk Cover" onChange={e => setForm({...form, audio_url: e.target.value})} />}
        <textarea className="w-full p-3 bg-slate-50 border rounded-xl text-sm h-32" placeholder="Lirik lagu..." onChange={e => setForm({...form, prompt: e.target.value})} />
        
        <button onClick={jalankan} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg">MULAI PROSES ⚡</button>
        <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{status}</div>
      </div>

      {songUrl && (
        <div className="p-4 bg-white border rounded-[2rem] shadow-sm">
          <audio src={songUrl} controls className="w-full" />
          <a href={songUrl} target="_blank" className="block text-center text-xs mt-3 font-bold text-blue-600">DOWNLOAD MP3</a>
        </div>
      )}
    </div>
  );
}
