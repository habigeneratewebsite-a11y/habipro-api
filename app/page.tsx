// Tambahkan state baru di bagian atas function HabiAPI
const [mode, setMode] = useState('generate'); // 'generate' atau 'cover'
const [audioUrl, setAudioUrl] = useState('');

// Di dalam return (JSX), tambahkan bagian Tab ini di atas input lirik:
<div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
  <button 
    onClick={() => setMode('generate')}
    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${mode === 'generate' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
  >
    GENERATE SONG
  </button>
  <button 
    onClick={() => setMode('cover')}
    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${mode === 'cover' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
  >
    UPLOAD & COVER
  </button>
</div>

{mode === 'cover' && (
  <div className="space-y-1.5 mb-4">
    <label className="text-[10px] font-black text-slate-500 uppercase">Source Audio URL (MP3/WAV)</label>
    <input 
      type="text" 
      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none"
      placeholder="https://link-lagu-anda.mp3"
      value={audioUrl}
      onChange={(e) => setAudioUrl(e.target.value)}
    />
  </div>
)}
