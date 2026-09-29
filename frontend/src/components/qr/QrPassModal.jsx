import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../common/Modal';
import { ShieldCheck, Clock, Download, Printer, User, Bus, CheckCircle2, AlertTriangle, MessageSquare, ExternalLink, Copy, Check } from 'lucide-react';

const QrPassModal = ({ isOpen, onClose, pass }) => {
  const [copied, setCopied] = useState(false);
  if (!pass) return null;

  const isExited = pass.status === 'exited' || pass.status === 'checked_out';
  const token = pass.token || pass.qr_token || pass.pass_number || 'PASS-000';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(token)}`;
  const guardScannerUrl = typeof window !== 'undefined' ? `${window.location.origin}/guard-scanner?token=${encodeURIComponent(token)}` : `http://localhost:5173/guard-scanner?token=${encodeURIComponent(token)}`;

  const isTeacher = (pass.holder_type === 'teacher' || (token && token.includes('TCH')));
  const passTypeTitle = isTeacher ? 'TEACHER EMERGENCY GATE PASS' : 'STUDENT GATE OUTPASS';

  const waFullText = [
    `${isTeacher ? '🚨' : '🎓'} *CAMPUS 360 - ${passTypeTitle} QR CODE*`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `👤 *Holder:* ${pass.holder_name} (${isTeacher ? 'Teacher / Faculty' : 'Student'})`,
    pass.holder_id ? `🆔 *ID / Roll:* ${pass.holder_id}` : null,
    `🎫 *Pass Token:* ${token}`,
    pass.reason ? `📝 *Reason:* ${pass.reason}` : null,
    `🕒 *Gate Pass Generate Time:* ${pass.generate_time || 'Recorded at issuance'}`,
    pass.gate_out_time ? `🚪 *Gate Out Time (Scanned):* ${pass.gate_out_time}` : null,
    `🚪 *Designated Gate:* ${pass.gate || 'Main West Gate'}`,
    `✅ *Status:* Authorized & Cleared for Gate Exit`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '📷 *OFFICIAL SCANNABLE QR CODE (TAP TO VIEW / SCAN):*',
    qrImageUrl,
    '',
    '🔍 *Direct Guard Clearance Scanner URL:*',
    guardScannerUrl,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '📱 *WhatsApp Notification Target:* +91 9741264364',
    '🔐 *Campus 360 Automated Security Perimeter System*'
  ].filter(Boolean).join('\n');

  const waSendUrl = `https://api.whatsapp.com/send?phone=919741264364&text=${encodeURIComponent(waFullText)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(waFullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Campus Security Pass" maxWidth="max-w-md">
      <div className="space-y-5 print:p-0">
        
        {/* Pass Card Container */}
        <div className="relative rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 shadow-xl text-center overflow-hidden">
          
          {/* Watermark / Header Seal */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                C
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black tracking-tight uppercase text-slate-800 dark:text-white">
                  Campus 360 Security
                </h4>
                <p className="text-[10px] text-slate-400">Official Clearance Certificate</p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
              isExited
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 animate-pulse'
            }`}>
              {isExited ? 'Exited / Inactive' : 'Verified & Active'}
            </span>
          </div>

          {/* Pass Type & Holder */}
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {pass.title || 'Campus Clearance Pass'}
            </h3>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {pass.holder_name}
            </p>
            {pass.holder_id && (
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                ID / Roll: {pass.holder_id}
              </p>
            )}
          </div>

          {/* Dynamic SVG QR Code with Scanner Guidelines */}
          <div className="inline-block p-4 rounded-2xl bg-white shadow-md border border-slate-100 my-2">
            <QRCodeSVG
              value={JSON.stringify({
                token,
                holder: pass.holder_name,
                type: pass.type,
                approved_by: pass.approved_by,
                status: pass.status
              })}
              size={180}
              level="H"
              includeMargin={true}
            />
            <p className="font-mono text-xs font-bold text-slate-700 mt-2 tracking-wider">
              {token}
            </p>
          </div>

          {/* Key Pass Details */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
            {/* Generate Time */}
            <div className="flex items-center justify-between bg-blue-50/80 dark:bg-blue-950/40 p-2 rounded-xl border border-blue-200 dark:border-blue-900/60">
              <span className="text-blue-900 dark:text-blue-200 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Pass Generate Time:</span>
              </span>
              <span className="font-mono font-black text-blue-700 dark:text-blue-300">
                {pass.generate_time || 'Recorded at issuance'}
              </span>
            </div>

            {/* Gate Out Time if Exited */}
            {isExited && (pass.gate_out_time || pass.out_time) && (
              <div className="flex items-center justify-between bg-rose-50/80 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200 dark:border-rose-900/60">
                <span className="text-rose-900 dark:text-rose-200 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Gate Out Time (Scanned):</span>
                </span>
                <span className="font-mono font-black text-rose-700 dark:text-rose-300">
                  {pass.gate_out_time || pass.out_time}
                </span>
              </div>
            )}

            {/* WhatsApp Alert & QR Strip */}
            <div className="flex flex-col gap-2 bg-emerald-50/90 dark:bg-emerald-950/40 p-2.5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <span className="text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-1.5 text-xs">
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp Alert (9741264364):</span>
                </span>
                <a
                  href={waSendUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-black text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                >
                  <span>+91 9741264364</span>
                  <span className="rounded bg-emerald-200 dark:bg-emerald-800 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-900 dark:text-emerald-100">
                    DISPATCHED
                  </span>
                </a>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/80 dark:border-emerald-800/60 text-[11px]">
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                  📷 Scannable QR Code URL:
                </span>
                <a
                  href={qrImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open QR Image</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {pass.reason && (
              <div className="flex items-start justify-between">
                <span className="text-slate-500 font-medium">Clearance Reason:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] text-right">
                  {pass.reason}
                </span>
              </div>
            )}

            {pass.departure_time && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Scheduled Departure:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {pass.departure_time}
                </span>
              </div>
            )}

            {pass.approved_by && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Authorized By:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {pass.approved_by}
                </span>
              </div>
            )}

            {pass.parent_contact && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Parent Contact:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {pass.parent_contact}
                </span>
              </div>
            )}

            {pass.vehicle_no && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Vehicle Plate:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">
                  {pass.vehicle_no}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 font-medium">Valid Window:</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {pass.valid_until || 'Today, 03:00 PM'}
              </span>
            </div>
          </div>

          <p className="mt-4 text-[10px] text-slate-400 text-center">
            Present this QR code to the Gate Guard at any campus exit perimeter.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap print:hidden">
          <div className="flex items-center gap-2">
            <a
              href={waSendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition hover:-translate-y-0.5 active:translate-y-0"
              title="Open WhatsApp chat with QR code image link and pass details for 9741264364"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send QR to WhatsApp (9741264364)</span>
            </a>
            
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              title="Copy WhatsApp alert text & QR link to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/25 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default QrPassModal;
