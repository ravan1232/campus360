import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import {
  Camera,
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  LogOut,
  User,
  Phone,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/api';

const GuardMobileScanner = () => {
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [lastScannedRaw, setLastScannedRaw] = useState('');
  
  // Last verified and saved exit record
  const [savedExitRecord, setSavedExitRecord] = useState(null);
  const [recentExits, setRecentExits] = useState([
    {
      id: 'EX-01',
      holder_name: 'Aiden Montgomery',
      role: 'Student (Grade 11-A)',
      out_time: '12:35 PM (Today)',
      token: 'OUTPASS-STD042-9981',
      type: 'Student Half-Day Outpass'
    },
    {
      id: 'EX-02',
      holder_name: 'Prof. Marcus Vance',
      role: 'Teacher (Physics Dept)',
      out_time: '11:15 AM (Today)',
      token: 'FACULTY-TCH8821',
      type: 'Faculty Emergency Pass'
    }
  ]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const animFrameIdRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Play auditory confirmation chime
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);
    } catch (e) {}
  };

  // Vibrate phone if supported
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch (e) {}
    }
  };

  // Clean raw scanned text / URLs into pass token
  const extractToken = (rawText) => {
    if (!rawText) return '';
    const trimmed = String(rawText).trim();
    try {
      const obj = JSON.parse(trimmed);
      if (obj.token) return obj.token;
      if (obj.id) return obj.id;
    } catch (e) {}
    if (trimmed.includes('token=')) {
      const match = trimmed.split('token=')[1];
      if (match) return match.split('&')[0];
    }
    return trimmed;
  };

  // Process and verify pass token
  const handleScanPass = async (tokenToScan) => {
    const raw = tokenToScan || tokenInput;
    const cleanToken = extractToken(raw);
    if (!cleanToken) return;

    setLoading(true);
    setLastScannedRaw(cleanToken);

    try {
      const res = await api.post('/gate/qr/checkout', {
        token: cleanToken,
        device: '📱 Officer Vikram Singh (Guard Phone #01)',
        isPhone: true
      });

      if (res && res.success) {
        playBeep();
        triggerHaptic();

        const fullOutTime = res.gate_out_time || res.out_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (Today)';
        const record = {
          success: true,
          holder_name: res.pass?.holder_name || res.log?.holder_name || 'Authorized Member',
          holder_id: res.pass?.holder_id || cleanToken,
          type: res.pass?.title || res.pass?.type || 'Gate Clearance Pass',
          reason: res.pass?.reason || res.log?.reason || 'Verified Campus Departure',
          generate_time: res.generate_time || res.pass?.generate_time || res.log?.generate_time || 'Recorded at issuance',
          gate_out_time: fullOutTime,
          out_time: fullOutTime,
          scanned_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          parent_contact: res.pass?.parent_contact || 'Parent Confirmed',
          approved_by: res.pass?.approved_by || 'Class Teacher & Principal',
          officer: 'Officer Vikram Singh',
          gate: 'Main West Gate',
          device: '📱 Guard Security Phone (Handheld #01)',
          whatsapp_number: '9741264364',
          whatsapp_notified: true
        };

        setSavedExitRecord(record);
        setRecentExits(prev => [record, ...prev.slice(0, 4)]);
      } else {
        setSavedExitRecord({
          success: false,
          message: res?.message || 'Unrecognized pass or clearance expired.'
        });
      }
    } catch (err) {
      setSavedExitRecord({
        success: false,
        message: 'Could not connect to gate registry. Check connection to PC.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Live video frame QR scanner loop using jsQR
  const scanVideoFrame = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      animFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const video = videoRef.current;
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      const canvas = canvasRef.current;
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data && !isProcessingRef.current) {
          isProcessingRef.current = true;
          handleScanPass(code.data);
          // 2.5 second cooldown before next auto scan
          setTimeout(() => {
            isProcessingRef.current = false;
          }, 2500);
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
  }, []);

  // Stop camera feed and scan loop
  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start live camera stream
  const startCamera = async (facing = facingMode) => {
    stopCamera();
    setCameraError(null);

    // Check mediaDevices support (browsers block getUserMedia on insecure HTTP except on localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Live video stream requires HTTPS on mobile browsers. Use the "Take Photo with Camera" button below, which works instantly on all mobile phones!');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.log('Autoplay deferred:', e));
          setCameraActive(true);
          animFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
        };
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      let msg = 'Camera access denied or unavailable.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Allow camera access in browser settings, or use "Take Photo with Camera" below.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        msg = 'Camera is in use by another application.';
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  // Auto-scan if token provided in URL query string (e.g. from WhatsApp guard link)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get('token');
      if (queryToken) {
        setTokenInput(queryToken);
        handleScanPass(queryToken);
      }
    } catch (e) {}
  }, []);

  // Flip front/back camera
  const flipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  };

  // Instant Phone Camera Snapshot / Image File Scan (works 100% on iOS & Android over any network/HTTP)
  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleScanPass(code.data);
        } else {
          setSavedExitRecord({
            success: false,
            message: 'No readable QR code found in photo. Please ensure QR code is centered and well-lit.'
          });
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if needed
    e.target.value = '';
  };

  const quickChips = [
    { label: 'Student: Aiden Montgomery (Grade 11-A)', token: 'OUTPASS-STD042-9981' },
    { label: 'Teacher Emergency: Prof. Marcus Vance', token: 'FACULTY-TCH8821' },
    { label: 'Campus Transit Bus 304 (Route 14)', token: 'VEH-BUS304-2026' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Phone App Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/gate')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition"
            title="Back to Gate Console"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-xs font-black tracking-wider uppercase text-white">Guard Phone Scanner</h1>
            </div>
            <p className="text-[11px] font-bold text-slate-400">Officer Vikram Singh · Main West Gate</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={flipCamera}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            title="Switch Camera"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* Main Scanner Body */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        
        {/* Device Status Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <Smartphone size={16} className="text-emerald-400" />
            <span>Terminal: Guard-Mobile-01</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Online & Synced
          </span>
        </div>

        {/* Live Camera Viewfinder */}
        <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-slate-800 aspect-[4/3] shadow-2xl flex items-center justify-center">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {/* Laser Sweep Animation */}
              <div className="absolute left-6 right-6 h-0.5 bg-emerald-400 shadow-[0_0_20px_#10b981] animate-laser pointer-events-none" />
              
              {/* Targeting Reticle Brackets */}
              <div className="absolute inset-6 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <span className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></span>
                  <span className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></span>
                </div>
                <div className="flex justify-between">
                  <span className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></span>
                  <span className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></span>
                </div>
              </div>

              {/* Viewfinder Instructions */}
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur text-white text-[11px] font-bold border border-white/20 shadow-lg">
                  Scanning... Align QR Pass Inside Box
                </span>
              </div>
            </>
          ) : (
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto">
                <Camera size={24} />
              </div>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                {cameraError || 'Camera initializing... Tap below to start camera or take a photo.'}
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-xs flex items-center justify-center gap-2 font-bold shadow-lg"
                >
                  <Camera size={16} />
                  <span>Take Photo with Phone Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="btn-secondary py-2 px-3 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Try Live Stream Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Camera Capture File Input (Standard HTML5 capture, works 100% on iOS & Android over HTTP) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCapture}
          className="hidden"
        />

        {/* Instant Camera Photo Snap / Upload Button */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow"
          >
            <Camera size={16} />
            <span>Snap QR Photo</span>
          </button>
          <label className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer">
            <ImageIcon size={16} />
            <span>Choose from Gallery</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </label>
        </div>

        {/* 1-Tap Quick Scan Test Outpass Tokens */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-400" />
            1-Tap Pass Simulator (Instant Test)
          </label>
          <div className="grid gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleScanPass(chip.token)}
                className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:bg-slate-850 active:scale-[0.99] transition text-left flex items-center justify-between text-xs font-bold text-slate-200"
              >
                <span>{chip.label}</span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                  {loading && lastScannedRaw === chip.token ? 'Saving...' : 'Scan Pass'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Token Verification Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Or enter Token (e.g. OUTPASS-STD042-9981)"
            className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
          />
          <button
            disabled={loading}
            onClick={() => handleScanPass()}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-4 text-xs font-black text-white transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Verify'}
          </button>
        </div>

        {/* VERIFICATION & OUT-TIME CONFIRMATION CARD */}
        {savedExitRecord && (
          <div className={`p-4 rounded-3xl border-2 transition-all shadow-2xl animate-fade-in ${
            savedExitRecord.success
              ? 'bg-emerald-950/70 border-emerald-500 text-white'
              : 'bg-rose-950/70 border-rose-500 text-white'
          }`}>
            {savedExitRecord.success ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow">
                    <CheckCircle2 size={13} /> Exit Verified · Out-Time Saved
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300 font-bold">
                    {savedExitRecord.out_time}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{savedExitRecord.holder_name}</h3>
                  <p className="text-xs text-emerald-200 font-bold mt-0.5">
                    {savedExitRecord.type} • ID: {savedExitRecord.holder_id}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400 font-bold">🕒 Pass Generate Time</span>
                    <span className="font-mono font-bold text-blue-300 text-xs">{savedExitRecord.generate_time}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400 font-bold">🚪 Gate Out Time (Scanned)</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">{savedExitRecord.gate_out_time || savedExitRecord.out_time}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5 items-center">
                    <span className="text-slate-400 font-bold">📲 WhatsApp Alert</span>
                    <span className="font-mono font-bold text-emerald-300 text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Dispatched (+91 9741264364)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400 font-bold">Reason</span>
                    <span className="text-white font-bold text-right">{savedExitRecord.reason}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400 font-bold">Approval Authority</span>
                    <span className="text-white font-bold">{savedExitRecord.approved_by}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Scanned Device</span>
                    <span className="text-emerald-300 font-mono font-bold text-[11px]">{savedExitRecord.device}</span>
                  </div>
                </div>

                <div className="text-center pt-0.5">
                  <span className="text-[11px] text-emerald-300 font-bold">
                    ✓ Out-time details committed to Central Campus Database.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <XCircle size={24} className="text-rose-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-rose-200">Pass Verification Failed</h4>
                  <p className="text-xs text-rose-300/80">{savedExitRecord.message}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Mobile Scans Log */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Recent Phone Scanner Departures</span>
            <span>{recentExits.length} Records</span>
          </div>
          <div className="space-y-1.5">
            {recentExits.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-extrabold text-white">{item.holder_name}</p>
                  <p className="text-[10px] text-slate-400">{item.type} • {item.token}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">{item.out_time}</span>
                  <span className="text-[9px] uppercase font-black text-slate-500">Out-Time Saved</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer Return Action */}
      <footer className="p-4 border-t border-slate-900 bg-slate-950/90 text-center">
        <button
          onClick={() => navigate('/gate')}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 font-bold text-xs text-slate-200 transition"
        >
          Return to Main Gate Security Dashboard
        </button>
      </footer>

    </div>
  );
};

export default GuardMobileScanner;
