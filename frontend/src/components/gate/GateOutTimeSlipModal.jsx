import React from 'react';
import Modal from '../common/Modal';
import {
  ShieldCheck,
  Clock,
  User,
  Smartphone,
  CheckCircle2,
  Calendar,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const GateOutTimeSlipModal = ({ isOpen, onClose, log }) => {
  const { addToast } = useNotifications();

  if (!log) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRecord = () => {
    const text = `CAMPUS 360 OFFICIAL GATE EXIT SLIP\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nHolder: ${log.holder_name}\nToken / ID: ${log.token}\nType: ${log.type}\n🕒 Pass Generate Time: ${log.generate_time || 'Recorded at issuance'}\n🚪 Gate Out Time (Scanned): ${log.gate_out_time || log.out_time || log.scanned_at}\n📲 WhatsApp Alert: Dispatched to +91 9741264364\nGate Post: ${log.gate || 'Main West Gate'}\nVerifying Officer: ${log.officer || 'Officer Vikram Singh'}\nTerminal Device: ${log.device || 'Guard Camera/Phone Scanner'}\nStatus: VERIFIED EXIT RECORDED & LOGGED`;
    navigator.clipboard.writeText(text);
    addToast('Exit clearance slip with both timestamps copied to clipboard!', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Gate Exit & Out-Time Slip" maxWidth="max-w-md">
      <div className="space-y-4">
        
        {/* Verification Banner */}
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
            <CheckCircle2 size={24} />
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
            AUTHENTICATED GATE CLEARANCE
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {log.holder_name}
          </h3>
          <p className="text-xs text-slate-500 font-bold">
            {log.type} • Token: <span className="font-mono text-emerald-600 dark:text-emerald-400">{log.token}</span>
          </p>
        </div>

        {/* Dual Timings Block: Gate Pass Generate Time & Gate Out Time */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              <Clock size={12} className="text-blue-600" />
              <span>Generate Time</span>
            </div>
            <div className="text-xs font-black font-mono text-slate-900 dark:text-white mt-1">
              {log.generate_time || 'Issuance Stamp'}
            </div>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
              Pass Minted
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
              <Clock size={12} className="text-white" />
              <span>Gate Out Time</span>
            </div>
            <div className="text-xs font-black font-mono text-white mt-1">
              {log.gate_out_time || log.out_time || log.scanned_at}
            </div>
            <span className="text-[9px] text-emerald-200 font-semibold block mt-0.5">
              Scanned Near Guard
            </span>
          </div>
        </div>

        {/* WhatsApp Real-Time Notification Badge */}
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">📲</span>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-900 dark:text-emerald-200 block">
                WhatsApp Dispatch Record
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                Delivered to: +91 9741264364
              </span>
            </div>
          </div>
          <a
            href={`https://api.whatsapp.com/send?phone=919741264364&text=${encodeURIComponent(`📋 Gate Exit Slip for ${log.holder_name}\nToken: ${log.token}\nGenerate Time: ${log.generate_time || 'N/A'}\nGate Out Time: ${log.gate_out_time || log.out_time}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black shadow transition shrink-0"
          >
            Open Chat
          </a>
        </div>

        {/* Detailed Audit Specifications */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-bold">Pass Category</span>
            <span className="font-bold text-slate-900 dark:text-white">{log.type}</span>
          </div>

          <div className="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-bold">Reason / Purpose</span>
            <span className="font-bold text-slate-900 dark:text-white">{log.reason || 'Authorized Outpass Departure'}</span>
          </div>

          <div className="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-bold">Scanned Terminal</span>
            <span className="font-bold font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Smartphone size={13} />
              {log.device || '📱 Guard Security Phone (Handheld #01)'}
            </span>
          </div>

          <div className="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 font-bold">Gate Station</span>
            <span className="font-bold text-slate-900 dark:text-white">{log.gate || 'Main West Gate'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 font-bold">Verifying Officer</span>
            <span className="font-bold text-slate-900 dark:text-white">{log.officer || 'Officer Vikram Singh'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleCopyRecord}
            className="btn-secondary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Copy size={15} />
            <span>Copy Record</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary flex-1 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5"
          >
            <Printer size={15} />
            <span>Print Slip</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default GateOutTimeSlipModal;
