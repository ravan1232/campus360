import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Send, Clock, UserCheck, Phone, AlertCircle, FileText } from 'lucide-react';

const HalfDayLeaveModal = ({ isOpen, onClose, onSubmitted }) => {
  const [reasonCategory, setReasonCategory] = useState('Medical Appointment');
  const [detailedReason, setDetailedReason] = useState('');
  const [departureTime, setDepartureTime] = useState('12:30 PM');
  const [transportMode, setTransportMode] = useState('Parent Vehicle Pickup');
  const [parentName, setParentName] = useState('Eleanor Montgomery');
  const [parentPhone, setParentPhone] = useState('+1-555-0999');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!detailedReason.trim()) {
      addToast('Please provide details for your half-day departure.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/tickets', {
        target_role: 'teacher',
        category: 'half_day_leave',
        subject: `Half-Day Leave: ${reasonCategory} (${departureTime})`,
        description: `${reasonCategory}: ${detailedReason}`,
        departure_time: departureTime,
        parent_confirmation: `${parentName} (${parentPhone})`,
        transport_mode: transportMode,
        priority: 'high'
      });

      if (res.success) {
        addToast(
          'Half-day leave request submitted to your Class Teacher for QR Pass approval.',
          'success',
          'Request Dispatched'
        );
        onClose();
        if (onSubmitted) onSubmitted();
      } else {
        addToast(res.message || 'Failed to submit request', 'error');
      }
    } catch (err) {
      addToast('Network error submitting half-day leave.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Half-Day Leave & Gate Outpass">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Class Teacher Sign-off Required
          </p>
          <p className="text-[11px] leading-relaxed text-blue-700/90 dark:text-blue-400">
            This request routes directly to your Class Teacher. Upon approval, an encrypted <strong>Digital QR Outpass</strong> will be generated for you to display at the campus exit gate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Reason Category
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
            >
              <option value="Medical Appointment">Medical / Doctor Appointment</option>
              <option value="Family Emergency">Urgent Family Matter</option>
              <option value="Inter-School Olympiad">Academic / Sports Competition</option>
              <option value="Personal Illness">Feeling Unwell / Infirmary Referral</option>
              <option value="Other Clearance">Other Authorized Reason</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Intended Departure Time
            </label>
            <input
              type="text"
              required
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              placeholder="e.g. 12:30 PM"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Detailed Reason & Context
          </label>
          <textarea
            required
            rows={3}
            value={detailedReason}
            onChange={(e) => setDetailedReason(e.target.value)}
            placeholder="Explain doctor's name, clinic appointment time, or emergency justification..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Mode of Campus Exit Transit
          </label>
          <select
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
          >
            <option value="Parent Vehicle Pickup">Parent / Guardian Vehicle Pickup</option>
            <option value="Pre-authorized Taxi/Cab">Pre-arranged Taxi with Parent Consent</option>
            <option value="Self Departure (Senior)">Self Walking / Public Transit</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Parent / Guardian Name
            </label>
            <input
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Parent Emergency Phone
            </label>
            <input
              type="text"
              required
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit to Class Teacher'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default HalfDayLeaveModal;
