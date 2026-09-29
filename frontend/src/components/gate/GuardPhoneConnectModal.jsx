import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Radio,
  Sparkles,
  Wifi,
  Settings2,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';

const GuardPhoneConnectModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [networkIp, setNetworkIp] = useState('192.168.1.104');
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const { addToast } = useNotifications();

  const port = window.location.port || '5173';

  // Automatically detect the server's real local network IP
  const detectLocalIp = async () => {
    setDetecting(true);
    try {
      const res = await api.get('/health');
      if (res && res.localIp && res.localIp !== 'localhost') {
        setNetworkIp(res.localIp);
      } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setNetworkIp(window.location.hostname);
      }
    } catch (e) {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setNetworkIp(window.location.hostname);
      }
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      detectLocalIp();
    }
  }, [isOpen]);

  const mobileUrl = `http://${networkIp}:${port}/guard-scanner`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    addToast('Scanner URL copied! Open this link in your mobile browser.', 'success', 'Link Copied');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMobileScanner = () => {
    window.open('/guard-scanner', '_blank', 'width=420,height=820,left=200,top=50');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Security Guard Phone Scanner" maxWidth="max-w-md">
      <div className="space-y-4 text-center">
        
        {/* Header Icon & Title */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <Smartphone size={24} />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Link Smartphone to Gate Registry
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Scan this QR code with your phone camera to open the handheld scanner. All scanned passes log out-times directly to the campus database.
          </p>
        </div>

        {/* Live Scannable Real QR Code */}
        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 shadow-sm relative">
          <div className="flex items-center justify-center gap-2 mb-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Radio size={14} className="animate-pulse text-emerald-500" />
            <span>Wireless Scanner Broadcast Active</span>
          </div>

          {/* Genuine Dynamic QR Code rendered with qrcode.react */}
          <div className="inline-block p-3.5 bg-white rounded-2xl shadow-md border border-slate-200">
            <QRCodeSVG
              value={mobileUrl}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#0f172a"
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
            <span>PAIRING PIN:</span>
            <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">
              GUARD-8821
            </span>
          </div>
        </div>

        {/* Wi-Fi & Network Connection Details */}
        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-blue-900 dark:text-blue-200 font-bold">
            <div className="flex items-center gap-1.5">
              <Wifi size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Wi-Fi Network URL</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingIp(!isEditingIp)}
              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Settings2 size={12} />
              <span>{isEditingIp ? 'Done' : 'Change IP'}</span>
            </button>
          </div>

          {isEditingIp ? (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold block">Your Computer Wi-Fi IP:</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={networkIp}
                  onChange={(e) => setNetworkIp(e.target.value)}
                  className="input text-xs py-1.5 font-mono"
                  placeholder="e.g. 192.168.1.104"
                />
                <button
                  type="button"
                  onClick={detectLocalIp}
                  disabled={detecting}
                  className="btn-secondary px-2 text-xs py-1.5 shrink-0"
                  title="Auto-Detect IP"
                >
                  <RefreshCw size={13} className={detecting ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly
                value={mobileUrl}
                className="input text-xs font-mono select-all bg-white dark:bg-slate-900 py-1.5"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-secondary px-3 shrink-0 flex items-center gap-1 text-xs font-bold py-1.5"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Ensure your mobile phone is connected to the same Wi-Fi network as this PC.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleOpenMobileScanner}
            className="btn-primary w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 text-xs font-black shadow-md shadow-emerald-600/20"
          >
            <ExternalLink size={15} />
            <span>Open Mobile Simulator Window (PC Testing)</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default GuardPhoneConnectModal;
