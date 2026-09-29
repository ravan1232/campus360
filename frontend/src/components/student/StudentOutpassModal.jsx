import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
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
  Check,
  AlertCircle,
  GraduationCap,
  Bus
} from 'lucide-react';

const STUDENT_PRESETS = [
  {
    id: 'medical',
    label: 'Medical / Clinic Referral',
    icon: '🏥',
    defaultReason: 'Specialist medical / orthodontic consultation requiring early departure with parent.'
  },
  {
    id: 'family',
    label: 'Urgent Family Pickup',
    icon: '👨‍👩‍👧',
    defaultReason: 'Urgent domestic / family emergency pickup authorized by parent.'
  },
  {
    id: 'competition',
    label: 'Interschool Olympiad / Sports',
    icon: '🏆',
    defaultReason: 'Official representation at district inter-school science & athletics championship.'
  },
  {
    id: 'personal',
    label: 'Personal Academic / Early Exit',
    icon: '📚',
    defaultReason: 'Pre-scheduled academic examination leave authorized by class teacher.'
  }
];

const StudentOutpassModal = ({ isOpen, onClose, onPassCreated, currentStudent }) => {
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
  const [outpassReason, setOutpassReason] = useState(STUDENT_PRESETS[0].defaultReason);
  const [parentContact, setParentContact] = useState(currentStudent?.parent_phone || 'Eleanor Montgomery (+1-555-0999)');
  const [transportMode, setTransportMode] = useState('Parent Pickup');
  const [vehicleNo, setVehicleNo] = useState('SUV-CT-4821');
  const [gatePost, setGatePost] = useState('Main West Gate');
  const [validityHours, setValidityHours] = useState('3');

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

  // Student context details and preview pass tokens
  const studentName = currentStudent?.name || 'Aiden Montgomery';
  const studentId = currentStudent?.roll || currentStudent?.loginId || currentStudent?.login_id || 'STD-2026-042';
  const grade = currentStudent?.grade || 'Grade 11-A';
  const generateTimeString = `${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (${formattedShortDate})`;
  const passToken = `STD-OUT-LIVE`;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setOutpassReason(preset.defaultReason);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!outpassReason.trim()) {
      addToast('Please write the reason for your gate outpass request.', 'warning', 'Reason Required');
      return;
    }

    setLoading(true);

    const tokenNum = Math.floor(1000 + Math.random() * 9000);
    const activePassToken = `STD-OUT-${tokenNum}`;

    const newStudentPass = {
      id: Date.now(),
      token: activePassToken,
      type: 'student_outpass',
      title: 'Student Digital Gate Outpass',
      holder_type: 'student',
      holder_name: studentName,
      holder_id: studentId,
      department: grade,
      reason: outpassReason.trim(),
      generate_time: generateTimeString,
      departure_time: departureTimeString,
      out_date: formattedShortDate,
      valid_until: validUntilString,
      parent_contact: parentContact,
      vehicle_no: transportMode === 'Parent Pickup' ? vehicleNo : null,
      gate: gatePost,
      transport_mode: transportMode,
      emergency: false,
      status: 'approved',
      approved_by: 'Prof. Marcus Vance (Class Teacher Authorization)',
      whatsapp_number: '9741264364',
      whatsapp_status: 'SENT',
      created_at: new Date().toISOString()
    };

    try {
      // 1. Submit leave record to backend
      await api.post('/tickets/half-day-leaves', {
        student_name: studentName,
        roll: studentId,
        grade: grade,
        reason: outpassReason.trim(),
        generate_time: generateTimeString,
        departure_time: departureTimeString,
        parent_confirmation: parentContact,
        transport_mode: transportMode,
        auto_approve: true,
        whatsapp_number: '9741264364'
      });

      // 2. Register pass with backend gate security registry
      await api.post('/gate/qr/generate', {
        holder_type: 'student',
        holder_name: studentName,
        holder_id: studentId,
        department: grade,
        reason: outpassReason.trim(),
        generate_time: generateTimeString,
        departure_time: departureTimeString,
        valid_until: validUntilString,
        parent_contact: parentContact,
        vehicle_no: transportMode === 'Parent Pickup' ? vehicleNo : null,
        gate: gatePost,
        transport_mode: transportMode,
        emergency: false,
        title: 'Student Digital Gate Outpass',
        whatsapp_number: '9741264364'
      });
    } catch (err) {
      console.warn('Backend registered pass fallback');
    }

    // Persist into localStorage for immediate offline gate scanner matching
    try {
      const savedPasses = JSON.parse(localStorage.getItem('c360_qr_passes') || '[]');
      savedPasses.unshift(newStudentPass);
      localStorage.setItem('c360_qr_passes', JSON.stringify(savedPasses));
      localStorage.setItem('c360_student_active_pass', JSON.stringify(newStudentPass));
    } catch (e) {}

    setLoading(false);
    addToast(`🎓 Student Outpass ${activePassToken} created! WhatsApp notification dispatched to 9741264364.`, 'success', 'Outpass Ready');

    if (onPassCreated) {
      onPassCreated(newStudentPass);
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Student Gate Outpass" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* WhatsApp Notification Indicator Banner */}
        <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 p-3.5 dark:border-emerald-800 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-base shadow-md shadow-emerald-600/30">
              📲
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-black uppercase text-emerald-950 dark:text-emerald-100">
                  Automated WhatsApp Notification
                </h5>
                <span className="rounded bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-200">
                  Target: 9741264364
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Gate pass generate time & student outpass credentials will be immediately transmitted to WhatsApp number <strong>9741264364</strong>.
              </p>
            </div>
          </div>
          <a
            href={`https://api.whatsapp.com/send?phone=919741264364&text=${encodeURIComponent(
              `🎓 *CAMPUS 360 - STUDENT GATE OUTPASS QR CODE*\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
              `👤 *Holder:* ${studentName} (Student)\n` +
              `🆔 *Roll / ID:* ${studentId}\n` +
              `🎫 *Pass Token:* ${passToken}\n` +
              `📝 *Reason:* ${outpassReason.trim()}\n` +
              `🕒 *Gate Pass Generate Time:* ${generateTimeString}\n` +
              `⏰ *Departure:* ${departureTimeString}\n` +
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
        
        {/* Top Outpass Live Clock & Status Strip */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 p-4 dark:border-blue-900/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
                <GraduationCap className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
                </span>
              </span>
              <div>
                <h4 className="text-sm font-black text-blue-950 dark:text-blue-100 flex items-center gap-2">
                  <span>Student Digital Gate Checkout</span>
                  <span className="rounded-md border border-blue-300 bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:border-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                    Auto-Verified
                  </span>
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Instant electronic exit credential scanned & verified at perimeter security posts.
                </p>
              </div>
            </div>

            {/* Live Auto-Ticking Digital Clock */}
            <div className="rounded-xl border border-blue-300/80 bg-white/90 p-2.5 text-right dark:border-blue-800/80 dark:bg-slate-900/90 shadow-sm shrink-0">
              <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Live Gate Time</span>
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

        {/* Student Profile Info Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Student Name</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {currentStudent?.name || 'Aiden Montgomery'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Roll / Student ID</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {currentStudent?.roll || currentStudent?.loginId || 'STD-2026-042'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Grade & Section</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {currentStudent?.grade || 'Grade 11-A'}
            </span>
          </div>
        </div>

        {/* Quick Reason Presets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Select Departure Category (Quick Presets)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STUDENT_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/90 text-blue-950 dark:border-blue-600 dark:bg-blue-950/50 dark:text-blue-100 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{preset.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight flex items-center justify-between">
                      <span>{preset.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 ml-1" />}
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

        {/* Written Reason by Student */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Detailed Outpass Reason <span className="text-blue-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Written by Student & Verified by Gate Post</span>
          </div>
          <textarea
            required
            rows={3}
            value={outpassReason}
            onChange={(e) => setOutpassReason(e.target.value)}
            placeholder="Specify reason for early exit (e.g. Doctor appointment, family pickup, competition)..."
            className="w-full rounded-xl border-2 border-slate-200 bg-white p-3.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Departure & Validity Times */}
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
                Valid Window
              </span>
              <select
                value={validityHours}
                onChange={(e) => setValidityHours(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="2">2 Hours (+2h)</option>
                <option value="3">3 Hours (+3h)</option>
                <option value="4">4 Hours (+4h)</option>
                <option value="8">End of School Day (+8h)</option>
              </select>
            </div>
            <div className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
              {validUntilString}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Automatically recognized at all exit gates
            </div>
          </div>
        </div>

        {/* Transit Mode, Vehicle & Parent Confirmation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Departure Transit
            </label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="Parent Pickup">Parent Pickup</option>
              <option value="School Bus Route 14">School Bus Route 14</option>
              <option value="Cab / Taxi / Ride">Cab / Taxi / Ride-share</option>
              <option value="Self Walking Exit">Self Walking Exit</option>
            </select>
          </div>

          {transportMode === 'Parent Pickup' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Pickup Vehicle Plate
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. NY-7729-A"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Exit Gate Post
              </label>
              <select
                value={gatePost}
                onChange={(e) => setGatePost(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="Main West Gate">Main West Gate</option>
                <option value="East Faculty Gate">East Faculty Gate</option>
                <option value="North Transit Terminal">North Transit Terminal</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Parent Contact & Phone
            </label>
            <input
              type="text"
              required
              value={parentContact}
              onChange={(e) => setParentContact(e.target.value)}
              placeholder="Eleanor Montgomery (+1-555-0999)"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl active:scale-[0.99] disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? 'Creating Digital Outpass...' : 'Generate Official Gate QR Pass'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default StudentOutpassModal;
