'use client';
import React, { useState, useEffect } from 'react';

export default function HabiAPI() {
  const [lyrics, setLyrics] = useState('');
  const [model, setModel] = useState('v3.5');
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState('generate'); // generate atau cover
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [credit, setCredit] = useState(null);
  const [songUrl, setSongUrl] = useState(null);

  // Cek Saldo Otomatis
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
    } catch (e) { console.error("Gagal ambil saldo"); }
  };

  const handleGenerate = async () => {
    if (!apiKey) return alert("Masukkan API Key!");
    if (mode === 'cover' && !audioUrl) return alert("Masukkan URL Audio untuk Cover!");
    
    setLoading(true);
    setStatus('Sedang memproses permintaan...');
    setSongUrl(null);

    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: lyrics, 
          model, 
          userKey: apiKey,
          task_type: mode,
          audio_url: audioUrl
        }),
      });
      const data = await res.json();
      
      const id = data.task_id || data.id || (data.data && data.data.task_id);
      if (id) {
        startPolling(id);
      } else {
        setStatus('Gagal: ' + (data.message || 'Cek Saldo/Key Anda'));
        setLoading(false);
      }
    } catch (e) {
      setStatus('Koneksi Gagal.');
      setLoading(false);
    }
  };

  const startPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/music?taskId=${taskId}&userKey=${apiKey}`);
        const data = await res.json();
        const result = data.data || data;
        
        if (result.status === 'completed') {
          setSongUrl(result.audio_url);
          setStatus('Berhasil Dibuat!');
          setLoading(false);
          checkBalance(apiKey);
          clearInterval(interval);
        } else if (result.status === 'failed') {
          setStatus('Gagal memproses lagu.');
          setLoading(false);
          clearInterval(interval);
        } else {
          setStatus('Proses: Sedang meramu musik...');
        }
      } catch (e) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-md">H</div>
          <span className="font-black text-xl tracking-tighter">HABI API</span>
        </div>
        <div className="flex items-center gap-2">
          {credit !== null && (
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100">
              {credit} Credits
            </span>
          )}
          <div className="w-8 h-8 bg-slate-200 rounded-full border" />
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          {/* TAB SELECTION */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setMode('generate')}
              className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all ${mode === 'generate' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
            >
              GENERATE SONG
            </button>
            <button 
              onClick={() => setMode('cover')}
              className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all ${mode === 'cover' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
            >
              UPLOAD & COVER
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl space-y-1">
              <label className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">API Key Manual</label>
              <input 
                type="password" 
                className="w-full bg-white border border-yellow-200 rounded-lg p-2 text-sm outline-none focus:border-yellow-400"
                placeholder="Paste API Key here..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={() => checkBalance(apiKey)}
              />
            </div>

            {mode === 'cover' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Audio URL (MP3/WAV)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/audio.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Lyrics / Prompt</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm h-32 outline-none focus:ring-2 focus:ring-blue-500"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder={mode === 'cover' ? "Ganti lirik/style vokal di sini..." : "Tulis lirik lagu baru di sini..."}
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all flex justify-center items-center gap-2`}
            >
              {loading ? 'PROCESSING...' : mode === 'cover' ? 'START COVER ⚡' : 'GENERATE MUSIC ⚡'}
            </button>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">{status}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-sm uppercase text-slate-500 mb-4 tracking-widest text-center">Output Preview</h2>
          {songUrl ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <audio src={songUrl} controls className="w-full" />
              <a href={songUrl} target="_blank" className="block w-full py-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-700 hover:bg-slate-200 transition">Download MP3</a>
            </div>
          ) : (
            <div className="h-32 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 text-[10px] uppercase font-bold space-y-2">
              <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-lg">🎵</div>
              <p>Lagu muncul otomatis di sini</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
