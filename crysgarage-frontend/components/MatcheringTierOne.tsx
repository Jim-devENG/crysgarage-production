import React, { useMemo, useState, useRef, useEffect } from 'react';

export default function MatcheringTierOne() {
  const [target, setTarget] = useState<File | null>(null);
  const [reference, setReference] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [outFormat, setOutFormat] = useState<'WAV16'|'WAV24'|'MP3'|'FLAC'>('WAV16');
  const [outSR, setOutSR] = useState<44100|48000>(44100);
  const [fxStereo, setFxStereo] = useState<boolean>(false);
  const [fxTilt, setFxTilt] = useState<boolean>(false);
  const [fxBass, setFxBass] = useState<boolean>(false);
  const [fxAir, setFxAir] = useState<boolean>(false);
  const [fxSoftClip, setFxSoftClip] = useState<boolean>(false);
  const targetInputRef = useRef<HTMLInputElement | null>(null);
  const refInputRef = useRef<HTMLInputElement | null>(null);
  const targetAudioRef = useRef<HTMLAudioElement | null>(null);
  const refAudioRef = useRef<HTMLAudioElement | null>(null);
  const masteredAudioRef = useRef<HTMLAudioElement | null>(null);
  const [abSource, setAbSource] = useState<'target'|'reference'|'mastered'>('mastered');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodeCacheRef = useRef<Record<string, any>>({});
  const apiBase = useMemo(() => (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://127.0.0.1:8002' : '', []);
  
  const rebuildGraph = () => {
    try {
      const srcEl = abSource === 'target' ? targetAudioRef.current : abSource === 'reference' ? refAudioRef.current : masteredAudioRef.current;
      if (!srcEl) return;
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (nodeCacheRef.current['src']) {
        try { (nodeCacheRef.current['src'] as MediaElementAudioSourceNode).disconnect(); } catch {}
      }
      const srcNode = ctx.createMediaElementSource(srcEl);
      let last: AudioNode = srcNode;
      if (fxStereo) {
        const split = ctx.createChannelSplitter(2);
        const merge = ctx.createChannelMerger(2);
        const gL = ctx.createGain();
        const gR = ctx.createGain();
        gL.gain.value = 1.15;
        gR.gain.value = 1.15;
        last.connect(split);
        split.connect(gL, 0);
        split.connect(gR, 1);
        gL.connect(merge, 0, 0);
        gR.connect(merge, 0, 1);
        last = merge;
      }
      if (fxTilt) {
        const lows = ctx.createBiquadFilter();
        lows.type = 'lowshelf'; lows.frequency.value = 250; lows.gain.value = -1.5;
        const highs = ctx.createBiquadFilter();
        highs.type = 'highshelf'; highs.frequency.value = 8000; highs.gain.value = 1.5;
        last.connect(lows); lows.connect(highs); last = highs;
      }
      last.connect(ctx.destination);
      nodeCacheRef.current['src'] = srcNode;
    } catch {}
  };

  useEffect(() => { rebuildGraph(); }, [abSource, fxStereo, fxTilt, resultUrl, target, reference]);

  const playAB = (which: 'target'|'reference'|'mastered') => {
    setAbSource(which);
    const els = [targetAudioRef.current, refAudioRef.current, masteredAudioRef.current];
    els.forEach((el) => {
      if (!el) return;
      if ((which === 'target' && el === targetAudioRef.current) || (which === 'reference' && el === refAudioRef.current) || (which === 'mastered' && el === masteredAudioRef.current)) {
        el.currentTime = 0; el.play();
      } else { el.pause(); }
    });
  };

  const uploadAndMaster = async () => {
    setError(null);
    setResultUrl(null);
    setProgress(0);
    if (!target || !reference) {
      setError('Please select both Target and Reference files.');
      return;
    }
    // quick client pre-check to avoid identical files
    if (target && reference && target.name === reference.name && target.size === reference.size) {
      setError('Target and Reference look identical (same name and size). Please choose different files.');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('target', target);
      form.append('reference', reference);
      form.append('user_id', 'dev-user');
      form.append('output_format', outFormat);
      form.append('output_sample_rate', String(outSR));
      form.append('stereo_widen', String(fxStereo));
      form.append('tilt_eq', String(fxTilt));
      form.append('bass_boost', String(fxBass));
      form.append('air_add', String(fxAir));
      form.append('soft_clip', String(fxSoftClip));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${apiBase}/master-matchering`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(Math.min(90, pct));
        }
      };
      const done = new Promise<Response>((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(new Response(xhr.responseText));
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText}`));
            }
          }
        };
      });
      xhr.send(form);
      const res = await done;
      if (!res.ok) {
        const text = await res.text();
        try {
          const obj = JSON.parse(text);
          throw new Error(obj?.detail || text || `HTTP ${res.status}`);
        } catch (_) {
          throw new Error(text || `HTTP ${res.status}`);
        }
      }
      const json = await res.json();
      setProgress(100);
      let url = json.url as string;
      try { localStorage.setItem('matchering.mastered_url', url || ''); } catch {}
      try { if ((json as any).file_id) localStorage.setItem('matchering.file_id', String((json as any).file_id)); } catch {}
      // Client-side preview FX: apply light stereo/tilt via WebAudio for preview only
      if ((fxStereo || fxTilt) && url) {
        // We keep the original file as download url; preview player uses processing graph
      }
      setResultUrl(url);
    } catch (err: any) {
      setError(err?.message || 'Failed to master audio');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, which: 'target' | 'reference') => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      which === 'target' ? setTarget(f) : setReference(f);
    }
  };

  const FileDrop = ({ label, file, setFile, inputRef }: { label: string; file: File | null; setFile: (f: File | null) => void; inputRef: React.RefObject<HTMLInputElement> }) => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, label.toLowerCase().includes('target') ? 'target' : 'reference')}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/60">{label}</div>
          <div className="text-sm mt-1 text-white/90 truncate max-w-[60ch]">
            {file ? file.name : 'Drag & drop a file here or choose file'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-md bg-crys-gold text-black hover:opacity-90"
          >
            Choose File
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
    </div>
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,215,0,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,215,0,0.08),transparent_40%)]" />

      <section className="relative max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Matchering Tier 1</h1>
          <p className="mt-2 text-white/70 max-w-2xl">
            Master your Target song to match your Reference using Matchering 2.0. Upload both, click Master, and preview or download the result.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <div className="text-sm font-medium mb-4 text-white/90">1. Select your files</div>
            <div className="space-y-4">
              <FileDrop label="Target (Your song)" file={target} setFile={setTarget} inputRef={targetInputRef} />
              <FileDrop label="Reference (Desired sound)" file={reference} setFile={setReference} inputRef={refInputRef} />
            </div>

            {/* Digital effect buttons under Target */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <button type="button" onClick={() => setFxStereo(v=>!v)} className={`px-3 py-2 rounded-md text-xs font-medium border ${fxStereo? 'bg-crys-gold text-black border-crys-gold' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>Stereo Widen</button>
              <button type="button" onClick={() => setFxTilt(v=>!v)} className={`px-3 py-2 rounded-md text-xs font-medium border ${fxTilt? 'bg-crys-gold text-black border-crys-gold' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>Tilt EQ</button>
              <button type="button" onClick={() => setFxBass(v=>!v)} className={`px-3 py-2 rounded-md text-xs font-medium border ${fxBass? 'bg-crys-gold text-black border-crys-gold' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>Bass Boost</button>
              <button type="button" onClick={() => setFxAir(v=>!v)} className={`px-3 py-2 rounded-md text-xs font-medium border ${fxAir? 'bg-crys-gold text-black border-crys-gold' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>Air Add</button>
              <button type="button" onClick={() => setFxSoftClip(v=>!v)} className={`px-3 py-2 rounded-md text-xs font-medium border ${fxSoftClip? 'bg-crys-gold text-black border-crys-gold' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>Soft Clip</button>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Format</div>
                <select
                  value={outFormat}
                  onChange={(e) => setOutFormat(e.target.value as any)}
                  className="w-full text-sm bg-white/10 border border-white/10 rounded-md px-3 py-2"
                >
                  <option value="WAV16">WAV (16-bit)</option>
                  <option value="WAV24">WAV (24-bit)</option>
                  <option value="MP3">MP3 (320 kbps)</option>
                  <option value="FLAC">FLAC (lossless)</option>
                </select>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Sample rate</div>
                <select
                  value={outSR}
                  onChange={(e) => setOutSR(Number(e.target.value) as any)}
                  className="w-full text-sm bg-white/10 border border-white/10 rounded-md px-3 py-2"
                >
                  <option value={44100}>44.1 kHz</option>
                  <option value={48000}>48 kHz</option>
                </select>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Preview FX</div>
                <div className="flex items-center gap-3 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={fxStereo} onChange={(e) => setFxStereo(e.target.checked)} />
                    Stereo widen
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={fxTilt} onChange={(e) => setFxTilt(e.target.checked)} />
                    Tilt EQ
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={uploadAndMaster}
                disabled={loading || !target || !reference}
                className="px-5 py-2.5 rounded-lg bg-crys-gold text-black font-medium disabled:opacity-50"
              >
                {loading ? 'Mastering…' : 'Master Now'}
              </button>
              {progress > 0 && (
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-crys-gold transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-xs mt-1 text-white/60">Uploading & processing… {progress}%</div>
                </div>
              )}
              {!!target && (
                <button type="button" className={`px-3 py-2 rounded-md text-xs ${abSource==='target'?'bg-white/20':'bg-white/10'}`} onClick={() => playAB('target')}>A: Target</button>
              )}
              {!!reference && (
                <button type="button" className={`px-3 py-2 rounded-md text-xs ${abSource==='reference'?'bg-white/20':'bg-white/10'}`} onClick={() => playAB('reference')}>B: Reference</button>
              )}
              {!!resultUrl && (
                <button type="button" className={`px-3 py-2 rounded-md text-xs ${abSource==='mastered'?'bg-white/20':'bg-white/10'}`} onClick={() => playAB('mastered')}>M: Mastered</button>
              )}
            </div>

            {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <div className="text-sm font-medium mb-4 text-white/90">2. Preview & download</div>
            {!resultUrl && (
              <div className="text-sm text-white/50">Your mastered result will appear here after processing.</div>
            )}
            {resultUrl && (
              <div className="space-y-4">
                <audio ref={targetAudioRef} src={target ? URL.createObjectURL(target) : undefined} className="hidden" preload="metadata" />
                <audio ref={refAudioRef} src={reference ? URL.createObjectURL(reference) : undefined} className="hidden" preload="metadata" />
                <audio ref={masteredAudioRef} controls src={resultUrl} className="w-full" preload="metadata" />
                <div className="flex items-center gap-3">
                  <a
                    href={resultUrl}
                    download
                    className="inline-flex items-center px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm"
                  >
                    Download {outFormat}
                  </a>
                  <a
                    href={resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 text-sm"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
