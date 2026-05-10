'use client';
import React, { useState } from 'react';

export default function HabiAPI() {
  const [lyrics, setLyrics] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState('generate');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [credit, setCredit] = useState(null);
  const [songUrl, setSongUrl] = useState(null);

  const checkBalance = async (key: string) => {
    if (!key) return;
    try {
      const res = await fetch('/api/user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userKey: key }),
      });
      const data = await res.json();
      if (data.credit !== undefined) setCredit(data.credit);
    } catch (e) { console.error("Balance Error"); }
  };

  const handleGenerate = async () => {
    if (!apiKey) return alert("Masukkan API Key!");
    setLoading(true);
    setStatus('Processing...');

    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: lyrics, title, tags, userKey: apiKey, task_type: mode, audio_url: audioUrl 
        }),
      });
      const data = await res.json();
      const id = data.task_id || data.id || (data.data && data.data.task_id);
      if (id) startPolling(id);
      else { setStatus('Failed: ' + (data.message || 'Check Key/Credit')); setLoading(false); }
    } catch (e) { setStatus('Error Connection'); setLoading(false); }
  };

  const startPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/music?taskId=${taskId}&userKey=${apiKey}`);
        const data = await res.json();
        const result = data.data || data;
        if (result.status === 'completed') {
          setSongUrl(result.audio_url || result.audio_urls?.[0]);
          setStatus('Success!'); setLoading(false); checkBalance(apiKey); clearInterval(interval);
        } else if (result.status === 'failed') {
          setStatus('Failed.'); setLoading(false); clearInterval(interval);
        } else { setStatus('Status: ' + (result.status || 'Processing...')); }
      } catch (e) { clearInterval(interval); setLoading(false); }
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm">
          <div className="font-black text-blue-600 text-xl italic">HABI PRO</div>
          {credit !== null && <div className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{credit} Credits</div>}
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <input type="password" placeholder="API KEY MANUAL" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={apiKey} onChange={(e) => setApiKey(e.target.value)} onBlur={() => checkBalance(apiKey)} />
          
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button onClick={() => setMode('generate')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${mode === 'generate' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>GENERATE</button>
            <button onClick={() => setMode('cover')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${mode === 'cover' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>COVER</button>
          </div>

          <input type="text" placeholder="Song Title" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="text" placeholder="Style (e.g. Pop, Rock, Dangdut)" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={tags} onChange={(e) => setTags(e.target.value)} />
          
          {mode === 'cover' && <input type="text" placeholder="Audio URL (Direct Link MP3)" className="w-full p-3 bg-blue-50 border-blue-200 border rounded-xl text-sm" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} />}
          
          <textarea placeholder="Lyrics..." className="w-full p-3 bg-slate-50 border rounded-xl text-sm h-32" value={lyrics} onChange={(e) => setLyrics(e.target.value)} />
          
          <button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 disabled:bg-slate-300">
            {loading ? 'WAITING...' : 'GENERATE ⚡'}
          </button>
          <div className="text-[10px] text-center font-bold text-slate-400 uppercase">{status}</div>
        </div>

        {/* Output */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm min-h-[100px] flex flex-col items-center justify-center">
          {songUrl ? <audio src={songUrl} controls className="w-full" /> : <p className="text-slate-300 text-xs font-bold uppercase">No Audio Result</p>}
        </div>
      </div>
    </div>
  );
}
