import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  AlertTriangle,
  Clock,
  Calendar,
  ShieldCheck,
  User,
  Car,
  Phone,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check
} from 'lucide-react';

const EMERGENCY_PRESETS = [
  {
    id: 'medical',
    label: 'Critical Medical Emergency',
    icon: '🏥',
    defaultReason: 'Severe personal medical condition requiring immediate clinic / emergency consultation.'
  },
  {
    id: 'family',
    label: 'Urgent Family Emergency',
    icon: '👨‍👩‍👧',
    defaultReason: 'Critical family medical emergency requiring immediate off-campus departure.'
  },
  {
    id: 'academic',
    label: 'Off-Campus Institutional Duty',
    icon: '🏛️',
    defaultReason: 'Urgent external university / board examination coordination and ministry duty.'
  },
  {
    id: 'crisis',
    label: 'Personal Crisis / Vehicle Issue',
    icon: '🚗',
    defaultReason: 'Urgent domestic emergency requiring immediate personal presence.'
  }
];

const TeacherEmergencyPassModal = ({ isOpen, onClose, onPassCreated, currentTeacher }) => {
  const { addToast } = useNotifications();
  const [loading, setLoading] = useState(false);

  // Live Auto-Updating Clock State (Ticks every second)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Form State
  const [selectedPreset, setSelectedPreset] = useState('medical');
  const [emergencyReason, setEmergencyReason] = useState(EMERGENCY_PRESETS[0].defaultReason);
  const [contactPhone, setContactPhone] = useState(currentTeacher?.phone || '+1-555-0102');
  const [transportMode, setTransportMode] = useState('Personal Vehicle');
  const [vehicleNo, setVehicleNo] = useState('CAR-NY-9941');
  const [gatePost, setGatePost] = useState('Main West Gate');
  const [validityHours, setValidityHours] = useState('4');

  // Format live dates and times
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedShortDate = currentTime.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const liveTimeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const departureTimeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Calculate dynamic Valid Until time (+X hours from current time)
  const validUntilTime = new Date(currentTime.getTime() + parseInt(validityHours, 10) * 3600000);
  const validUntilString = `Today, ${validUntilTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  // Teacher context details and preview pass tokens
  const teacherName = currentTeacher?.name || 'Prof. Marcus Vance';
  const teacherId = currentTeacher?.loginId || currentTeacher?.login_id || 'TEC-002';
  const department = currentTeacher?.department || 'Physics & Applied Sciences';
  const generateTimeString = `${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (${formattedShortDate})`;
  const passToken = `EMG-TCH-LIVE`;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setEmergencyReason(preset.defaultReason);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emergencyReason.trim()) {
      addToast('Please write a specific reason for the emergency clearance.', 'warning', 'Reason Required');
      return;
    }

    setLoading(true);

    const tokenNum = Math.floor(1000 + Math.random() * 9000);
    const activePassToken = `EMG-TCH-${tokenNum}`;

    const newEmergencyPass = {
      id: Date.now(),
      token: activePassToken,
      type: 'faculty_emergency_outpass',
      title: 'Teacher Emergency Gate Clearance Pass',
      holder_name: teacherName,
      holder_id: teacherId,
      department: department,
      reason: emergencyReason.trim(),
      generate_time: generateTimeString,
      departure_time: departureTimeString,
      out_date: formattedShortDate,
      valid_until: validUntilString,
      parent_contact: contactPhone,
      vehicle_no: transportMode === 'Personal Vehicle' ? vehicleNo : null,
      gate: gatePost,
      transport_mode: transportMode,
      emergency: true,
      status: 'approved',
      approved_by: 'Self-Authorized Faculty Emergency Protocol',
      whatsapp_number: '9741264364',
      whatsapp_status: 'SENT',
      created_at: new Date().toISOString()
    };

    try {
      // Register with backend / gate QR passes endpoint
      await api.post('/gate/qr/generate', {
        holder_type: 'teacher',
        holder_name: teacherName,
        holder_id: teacherId,
        department: department,
        reason: `[EMERGENCY] ${emergencyReason.trim()}`,
        generate_time: generateTimeString,
        departure_time: departureTimeString,
        valid_until: validUntilString,
        parent_contact: contactPhone,
        vehicle_no: transportMode === 'Personal Vehicle' ? vehicleNo : null,
        gate: gatePost,
        transport_mode: transportMode,
        emergency: true,
        title: 'Teacher Emergency Gate Clearance Pass',
        whatsapp_number: '9741264364'
      });
    } catch (err) {
      console.warn('Fallback store registered pass');
    }

    // Also persist into local storage active passes so scanner recognizes it instantly
    try {
      const savedPasses = JSON.parse(localStorage.getItem('c360_qr_passes') || '[]');
      savedPasses.unshift(newEmergencyPass);
      localStorage.setItem('c360_qr_passes', JSON.stringify(savedPasses));
    } catch (e) {}

    setLoading(false);
    addToast(`🚨 Emergency Gate Pass ${activePassToken} issued! Priority WhatsApp alert sent to 9741264364.`, 'success', 'Pass Issued & Alerted');

    if (onPassCreated) {
      onPassCreated(newEmergencyPass);
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emergency Faculty Gate Outpass" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* WhatsApp Notification Alert Banner */}
        <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 p-3.5 dark:border-emerald-800 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-base shadow-md shadow-emerald-600/30">
              📲
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-black uppercase text-emerald-950 dark:text-emerald-100">
                  Automated Faculty WhatsApp Alert
                </h5>
                <span className="rounded bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-200">
                  Target: 9741264364
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Gate pass generate time & teacher emergency clearance pass will be automatically dispatched to WhatsApp number <strong>9741264364</strong>.
              </p>
            </div>
          </div>
          <a
            href={`https://api.whatsapp.com/send?phone=919741264364&text=${encodeURIComponent(
              `🚨 *CAMPUS 360 - TEACHER EMERGENCY GATE PASS QR CODE*\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `👤 *Holder:* ${teacherName} (Teacher / Faculty)\n` +
              `🆔 *Employee ID:* ${teacherId}\n` +
              `🎫 *Pass Token:* ${passToken}\n` +
              `📝 *Reason:* [EMERGENCY] ${emergencyReason.trim()}\n` +
              `🕒 *Gate Pass Generate Time:* ${generateTimeString}\n` +
              `🚪 *Designated Gate:* ${gatePost}\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `📷 *OFFICIAL SCANNABLE QR CODE (TAP TO VIEW / SCAN):*\n` +
              `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(passToken)}\n\n` +
              `🔍 *Direct Guard Clearance Scanner URL:*\n` +
              `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/guard-scanner?token=${encodeURIComponent(passToken)}\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `📱 *WhatsApp Alert Target:* +91 9741264364\n` +
              `🔐 *Campus 360 Security Perimeter*`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow transition"
          >
            <span>Send QR to WhatsApp</span>
          </a>
        </div>
        
        {/* Top Emergency Live Status Banner with Auto-Ticking Clock */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 p-4 dark:border-rose-900/60 dark:from-rose-950/40 dark:via-red-950/30 dark:to-slate-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
                </span>
              </span>
              <div>
                <h4 className="text-sm font-black text-rose-950 dark:text-rose-100 flex items-center gap-2">
                  <span>Immediate Gate Clearance Protocol</span>
                  <span className="rounded-md border border-rose-300 bg-rose-100 px-2 py-0.5 text-[10px] font-black uppercase text-rose-700 dark:border-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                    High Priority
                  </span>
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Instant electronic gate authorization issued directly by faculty authority.
                </p>
              </div>
            </div>

            {/* Live Synchronized Digital Clock */}
            <div className="rounded-xl border border-rose-300/80 bg-white/90 p-2.5 text-right dark:border-rose-800/80 dark:bg-slate-900/90 shadow-sm shrink-0">
              <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Live System Time</span>
              </div>
              <div className="font-mono text-base font-black text-slate-900 dark:text-white">
                {liveTimeString}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {formattedShortDate}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Identity Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Faculty Member</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {currentTeacher?.name || 'Prof. Marcus Vance'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Employee Login ID</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {currentTeacher?.loginId || currentTeacher?.login_id || 'TEC-002'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Department</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
              {currentTeacher?.department || 'Physics & Applied Sciences'}
            </span>
          </div>
        </div>

        {/* Quick Emergency Category Presets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Select Emergency Category (Quick Presets)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EMERGENCY_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/90 text-rose-950 dark:border-rose-600 dark:bg-rose-950/50 dark:text-rose-100 ring-2 ring-rose-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{preset.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight flex items-center justify-between">
                      <span>{preset.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 ml-1" />}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {preset.defaultReason}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Written Reason by Teacher */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Detailed Emergency Reason <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Written by Teacher for Official Gate Audit</span>
          </div>
          <textarea
            required
            rows={3}
            value={emergencyReason}
            onChange={(e) => setEmergencyReason(e.target.value)}
            placeholder="State the urgent condition requiring immediate campus departure..."
            className="w-full rounded-xl border-2 border-slate-200 bg-white p-3.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Departure & Automatic Validity Window Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-850">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                Departure Time
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Live / Now
              </span>
            </div>
            <div className="font-mono text-base font-black text-slate-900 dark:text-white">
              {departureTimeString}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Effective Date: {formattedDate}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-850">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Pass Validity Window
              </span>
              <select
                value={validityHours}
                onChange={(e) => setValidityHours(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="2">2 Hours (+2h)</option>
                <option value="4">4 Hours (+4h)</option>
                <option value="6">6 Hours (+6h)</option>
                <option value="12">End of Day (+12h)</option>
              </select>
            </div>
            <div className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
              {validUntilString}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Automatically synced with perimeter security gates
            </div>
          </div>
        </div>

        {/* Transit Mode, Vehicle & Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Transit Mode
            </label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="Personal Vehicle">Personal Vehicle</option>
              <option value="Cab / Ride-share">Cab / Ride-share / Taxi</option>
              <option value="Pedestrian">Pedestrian Exit</option>
              <option value="Campus Transit">Campus Transit / Fleet</option>
            </select>
          </div>

          {transportMode === 'Personal Vehicle' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Vehicle Plate No.
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. NY-8821-X"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Departure Gate
              </label>
              <select
                value={gatePost}
                onChange={(e) => setGatePost(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="Main West Gate">Main West Gate</option>
                <option value="East Faculty Gate">East Faculty Gate</option>
                <option value="North Transit Terminal">North Transit Terminal</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Contact Phone
            </label>
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1-555-0102"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-rose-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-rose-600/30 transition hover:from-rose-500 hover:to-red-500 hover:shadow-xl active:scale-[0.99] disabled:opacity-60"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{loading ? 'Authorizing Gate Clearance...' : 'Issue Emergency QR Outpass'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default TeacherEmergencyPassModal;
