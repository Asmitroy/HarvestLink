import { useEffect, useRef, useState, useCallback } from 'react';

// ── Crop keyword map (English + Hindi + Marathi common words) ──────────────
const CROP_KEYWORDS = {
  tomato:  ['tomato', 'tamatar', 'tamater', 'tomatoes'],
  onion:   ['onion', 'pyaz', 'pyaaz', 'kanda', 'onions'],
  potato:  ['potato', 'aloo', 'alu', 'batata', 'potatoes'],
  wheat:   ['wheat', 'gehu', 'gehun', 'gahu'],
  chilli:  ['chilli', 'chili', 'mirchi', 'mirch', 'chillies'],
  brinjal: ['brinjal', 'baingan', 'baigan', 'eggplant', 'brinjals'],
};

/** Parse a raw transcript string → { crop, qty } or null */
function parseTranscript(text) {
  const lower = text.toLowerCase();

  let detectedCrop = null;
  for (const [crop, keywords] of Object.entries(CROP_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detectedCrop = crop;
      break;
    }
  }

  let detectedQty = null;
  const qtyMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram|kilos)?/);
  if (qtyMatch) {
    const n = parseFloat(qtyMatch[1]);
    if (n > 0 && n < 100000) detectedQty = n;
  }

  if (detectedCrop || detectedQty) return { crop: detectedCrop, qty: detectedQty };
  return null;
}

export default function VoiceOverlay({ onClose, onRecognized }) {
  const recognitionRef    = useRef(null);
  const finalTranscriptRef = useRef('');
  const isUnmountedRef    = useRef(false);

  const [transcript, setTranscript] = useState('');
  const [status,     setStatus]     = useState('starting'); // starting | listening | error
  const [errorMsg,   setErrorMsg]   = useState('');
  const [parsed,     setParsed]     = useState(null);

  // ── Stop and close ──────────────────────────────────────────────────────
  const stopAndClose = useCallback(() => {
    recognitionRef.current?.stop();
    onClose();
  }, [onClose]);

  // ── Confirm with whatever was parsed ────────────────────────────────────
  const confirmParsed = useCallback((p) => {
    recognitionRef.current?.stop();
    onRecognized(p.crop, p.qty);
  }, [onRecognized]);

  // ── Init Web Speech API ─────────────────────────────────────────────────
  useEffect(() => {
    isUnmountedRef.current = false;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatus('error');
      setErrorMsg('Your browser does not support speech recognition. Please use Chrome or Edge.');
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang            = 'en-IN';   // Indian English – also picks up Hindi/Marathi words
    rec.continuous      = true;      // keep going until we stop it explicitly
    rec.interimResults  = true;      // show partial results live
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      if (!isUnmountedRef.current) setStatus('listening');
    };

    rec.onresult = (event) => {
      if (isUnmountedRef.current) return;
      let interimText = '';
      let finalText   = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += segment + ' ';
          finalTranscriptRef.current = finalText;
        } else {
          interimText += segment;
        }
      }

      const fullText = (finalText + interimText).trim();
      setTranscript(fullText);
      setParsed(parseTranscript(fullText));
    };

    rec.onerror = (event) => {
      if (isUnmountedRef.current) return;
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      setStatus('error');
      const msgs = {
        'not-allowed':         'Microphone permission denied. Click the lock icon in the address bar and allow mic access.',
        'audio-capture':       'No microphone found. Please connect a microphone and try again.',
        'network':             'Network error during speech recognition. Check your internet connection.',
        'service-not-allowed': 'Speech service blocked. Please try Chrome or Edge.',
      };
      setErrorMsg(msgs[event.error] || `Speech error: ${event.error}`);
    };

    // When the browser auto-ends recognition (silence), restart it
    rec.onend = () => {
      if (isUnmountedRef.current) return;
      try { rec.start(); } catch (_) { /* already running */ }
    };

    try {
      rec.start();
    } catch (e) {
      setStatus('error');
      setErrorMsg('Could not start microphone: ' + e.message);
    }

    return () => {
      isUnmountedRef.current = true;
      rec.onend = null; // prevent restart loop on unmount
      try { rec.stop(); } catch (_) { /* ignore */ }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived labels ──────────────────────────────────────────────────────
  const cropLabel = parsed?.crop ? `🌿 ${parsed.crop.charAt(0).toUpperCase() + parsed.crop.slice(1)}` : null;
  const qtyLabel  = parsed?.qty  ? `⚖️ ${parsed.qty} kg` : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,20,15,0.78)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) stopAndClose(); }}
    >
      <div
        className="panel-in relative flex flex-col items-center gap-5 px-10 py-12 rounded-3xl text-white w-[26rem] text-center"
        style={{ background: 'linear-gradient(175deg,#064e35,#0D7A51)' }}
      >
        {/* Close */}
        <button
          onClick={stopAndClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors text-sm"
        >✕</button>

        {/* ── Animated mic ── */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {status === 'listening' && (
            <>
              <span className="voice-ring-w voice-ring-w-1" />
              <span className="voice-ring-w voice-ring-w-2" />
              <span className="voice-ring-w voice-ring-w-3" />
            </>
          )}
          <div
            className="relative z-10 w-16 h-16 rounded-full border-2 flex items-center justify-center backdrop-blur-sm"
            style={{
              background:  status === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.15)',
              borderColor: status === 'error' ? 'rgba(239,68,68,0.6)'  : 'rgba(255,255,255,0.3)',
            }}
          >
            {status === 'error' ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8"  y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* ── Title ── */}
        <h3 className="text-[1.4rem] font-extrabold leading-tight">
          {status === 'starting' && 'Starting mic…'}
          {status === 'listening' && 'Listening…'}
          {status === 'error'    && 'Mic Error'}
        </h3>

        {/* ── Error ── */}
        {status === 'error' && (
          <p className="text-red-300 text-[0.85rem] leading-snug">{errorMsg}</p>
        )}

        {/* ── Live transcript box ── */}
        {status !== 'error' && (
          <div
            className="w-full min-h-[3.5rem] rounded-2xl px-4 py-3 text-[0.88rem] leading-snug text-left"
            style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {transcript ? (
              <span className="text-white/90">{transcript}</span>
            ) : (
              <span className="text-white/40 italic">
                Say: <span className="not-italic text-green-300">"50 kg Tomato"</span> or <span className="not-italic text-green-300">"100 kg Onion"</span>
              </span>
            )}
          </div>
        )}

        {/* ── Detected chips ── */}
        {parsed && (
          <div className="flex gap-2 flex-wrap justify-center">
            {cropLabel && (
              <span className="text-[0.78rem] font-bold px-3 py-1.5 rounded-full bg-green-400/20 border border-green-300/40 text-green-200">
                {cropLabel}
              </span>
            )}
            {qtyLabel && (
              <span className="text-[0.78rem] font-bold px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white">
                {qtyLabel}
              </span>
            )}
          </div>
        )}

        {/* ── Waveform ── */}
        {status === 'listening' && (
          <div className="wave-bars">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.09}s` }} />
            ))}
          </div>
        )}

        {/* ── Hint ── */}
        {status === 'listening' && !parsed && (
          <p className="text-white/65 text-[0.82rem]">
            Speak clearly • हिंदी, English, मराठी supported
          </p>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-3 w-full">
          {parsed && (
            <button
              onClick={() => confirmParsed(parsed)}
              className="flex-1 py-3 rounded-full font-bold text-[0.9rem] transition-all"
              style={{ background: 'rgba(255,255,255,0.92)', color: '#0D7A51' }}
            >
              ✓ Confirm
            </button>
          )}
          <button
            onClick={stopAndClose}
            className="flex-1 px-5 py-3 rounded-full bg-white/15 border-2 border-white/35 text-white font-bold text-[0.9rem] hover:bg-white/25 transition-colors"
          >
            {parsed ? 'Cancel' : '■ Stop'}
          </button>
        </div>
      </div>
    </div>
  );
}
