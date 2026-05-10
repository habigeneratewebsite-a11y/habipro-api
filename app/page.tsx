'use client';
import React, { useState } from 'react';

export default function HabiAPI() {
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState('generate');
  const [form, setForm] = useState({ prompt: '', title: '', tags: '', audio_url: '' });
  const [status, setStatus] = useState('READY');
  const [songUrl, setSongUrl] = useState('');

  const runTask = async () => {
    if (!apiKey) return alert("API KEY KOSONG!");
    setStatus('SENDING TO KIE AI...');
    
    try {
      // Langsung menembak ke server penyedia (KIE AI/GoAPI)
      const res = await fetch('https://api.goapi.xyz/suno/v1/generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
        body: JSON.stringify({
          prompt: form.prompt || "A song",
          tags: form.tags || "pop",
          title: form.title || "New Song",
          model: "v3.5",
          ...(mode === 'cover' && { audio_url: form.audio_url })
        })
      });

      const data = await res.json();
      const taskId = data.data?.task_id || data.task_id;

      if (taskId) {
        setStatus('PROCESSING... PLEASE WAIT');
        const check = setInterval(async () => {
          const resCheck = await fetch(`https://api.goapi.xyz/suno/v1/fetch/${taskId}`, {
            headers: { 'X-API-KEY': apiKey }
          });
          const dataCheck = await resCheck.json();
          if (dataCheck.data?.status === 'completed') {
            setSongUrl(dataCheck.data.audio_url);
            setStatus('SUCCESS!');
            clearInterval(check);
          }
        }, 10000);
      } else {
        setStatus('ERROR: ' + (data.message || 'Check Credit/Key'));
      }
    } catch (e) {
      setStatus('CONNECTION ERROR');
    }
  };

  return (
    <div className="max-w-md mx-auto p-5 font-sans bg-slate-50 min-h-screen">
      <div className="bg-blue-600 text-white p-6 rounded-[32px] font-black text-center text-xl mb-4">HABI PRO AI</div>
      
      <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
        <input className="w-full p-4 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="ENTER API KEY" onChange={e => setApiKey(e.target.value)} />
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setMode('generate')} className={`flex-1 p-2 text-[10px] font-bold rounded-xl ${mode==='generate'?'bg-white shadow text-blue-600':'text-slate-400'}`}>GENERATE</button>
          <button onClick={() => setMode('cover')} className={`flex-1 p-2 text-[10px] font-bold rounded-lg ${mode==='cover'?'bg-white shadow text-blue-600':'text-slate-400'}`}>COVER</button>
        </div>

        <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Song Title" onChange={e => setForm({...form, title: e.target.value})} />
        <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Style (Pop, Jazz...)" onChange={e => setForm({...form, tags: e.target.value})} />
        {mode === 'cover' && <input className="w-full p-3 bg-blue-50 border-blue-200 border rounded-xl text-sm" placeholder="Audio URL Link" onChange={e => setForm({...form, audio_url: e.target.value})} />}
        <textarea className="w-full p-3 bg-slate-50 border rounded-xl text-sm h-32" placeholder="Lyrics..." onChange={e => setForm({...form, prompt: e.target.value})} />
        
        <button onClick={runTask} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg active:scale-95 transition">START GENERATE ⚡</button>
        <div className="text-center text-[10px] font-bold text-slate-400 uppercase">{status}</div>
      </div>

      {songUrl && (
        <div className="mt-4 p-4 bg-white border rounded-[32px] shadow-sm animate-bounce-in">
          <audio src={songUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
}
