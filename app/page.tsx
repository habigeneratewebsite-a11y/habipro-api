'use client';
import React, { useState, useEffect } from 'react';

export default function HabiAPI() {
  const [lyrics, setLyrics] = useState('');
  const [model, setModel] = useState('v3.5');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [credit, setCredit] = useState(null);
  const [songUrl, setSongUrl] = useState(null);

  // Fungsi untuk cek saldo otomatis saat API Key diisi
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
    setLoading(true);
    setStatus('Memulai proses generate...');
    setSongUrl(null);

    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: lyrics, model, userKey: apiKey }),
      });
      const data = await res.json();
      
      if (data.task_id || data.id) {
        const id = data.task_id || data.id;
        startPolling(id);
      } else {
        setStatus('Error: ' + (data.message || 'Gagal memulai tugas'));
        setLoading(false);
      }
    } catch (e) {
      setStatus('Koneksi terputus.');
      setLoading(false);
    }
  };

  // SISTEM POLLING (Cek setiap 5 detik)
  const startPolling = (taskId: string) => {
    setStatus('Lagu sedang dibuat (0%)...');
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/music?taskId=${taskId}&userKey=${apiKey}`);
        const data = await res.json();
        
        if (data.status === 'completed' || data.data?.status === 'completed') {
          const url = data.audio_url || data.data?.audio_url;
          setSongUrl(url);
          setStatus('Selesai!');
          setLoading(false);
          checkBalance(apiKey); // Update saldo setelah potong
          clearInterval(interval);
        } else {
          setStatus('Sedang memproses musik... Mohon tunggu.');
        }
      } catch (e) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">H</div>
          <span className="font-black text-xl tracking-tighter uppercase">Habi API</span>
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 mt-4">
          <div className="space-y-1.5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <label className="text-[10px] font-black text-blue-700 uppercase">Suno API Key (Manual)</label>
            <input 
              type="password" 
              className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm outline-none"
              placeholder="Paste your key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onBlur={() => checkBalance(apiKey)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Lyrics / Prompt</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm h-32 outline-none focus:ring-2 focus:ring-blue-500"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Tulis lirik atau gaya musik (contoh: Dangdut Koplo)"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:bg-slate-300"
            >
              {loading ? 'PROSES GENERATE...' : 'GENERATE MUSIC ⚡'}
            </button>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase">{status}</p>
          </div>
        </div>

        {/* OUTPUT AREA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-sm uppercase text-slate-500 mb-4">Output Result</h2>
          {songUrl ? (
            <div className="space-y-4">
              <audio src={songUrl} controls className="w-full" />
              <a href={songUrl} target="_blank" className="block text-center text-xs font-bold text-blue-600 underline">Download MP3</a>
            </div>
          ) : (
            <div className="h-32 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-400 text-xs">
              Hasil lagu akan muncul otomatis di sini
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
