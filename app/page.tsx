'use client';
import React, { useState } from 'react';

export default function HabiAPI() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('READY');
  const [songUrl, setSongUrl] = useState('');

  const generateLagu = async () => {
    if(!apiKey) return alert("Isi API KEY dulu!");
    setStatus('SEDANG MENGIRIM...');
    
    const res = await fetch('/api/music', {
      method: 'POST',
      body: JSON.stringify({ prompt, userKey: apiKey })
    });
    const data = await res.json();
    const id = data.data?.task_id || data.task_id;

    if(id) {
      setStatus('LAGU SEDANG DIBUAT (Tunggu 1 Menit)...');
      // Cek status setiap 10 detik
      const cek = setInterval(async () => {
        const resCek = await fetch(`/api/music?taskId=${id}&userKey=${apiKey}`);
        const dataCek = await resCek.json();
        if(dataCek.data?.status === 'completed') {
          setSongUrl(dataCek.data.audio_url);
          setStatus('BERHASIL!');
          clearInterval(cek);
        }
      }, 10000);
    } else {
      setStatus('GAGAL: ' + data.message);
    }
  };

  return (
    <div className="p-5 font-sans max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-black text-blue-600">HABI PRO API</h1>
      <input className="w-full p-3 border rounded-xl" type="password" placeholder="MASUKKAN API KEY" value={apiKey} onChange={e => setApiKey(e.target.value)} />
      <textarea className="w-full p-3 border rounded-xl" placeholder="Lirik/Gaya Lagu..." value={prompt} onChange={e => setPrompt(e.target.value)} />
      <button onClick={generateLagu} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">GENERATE LAGU ⚡</button>
      <div className="p-4 bg-slate-100 rounded-xl text-center text-xs font-bold uppercase">{status}</div>
      {songUrl && <audio controls src={songUrl} className="w-full mt-4" />}
    </div>
  );
}
