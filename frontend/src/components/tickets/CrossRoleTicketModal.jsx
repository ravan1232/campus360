import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Send, ArrowRight, ShieldAlert, FileText } from 'lucide-react';

const ROLE_OPTIONS = {
  student: [
    { label: 'Attendance Discrepancy', category: 'attendance', targetRole: 'teacher', hint: 'Directly routes to your subject teacher' },
    { label: 'Tuition / Fee Scholarship Issue', category: 'fee', targetRole: 'accountant', hint: 'Routes to Bursar / Finance department' },
    { label: 'School Bus / Transport Issue', category: 'transport', targetRole: 'admin', hint: 'Routes to Fleet Logistics & Admin' },
    { label: 'Technical / Portal Issue', category: 'technical', targetRole: 'admin', hint: 'Routes to IT Helpdesk' }
  ],
  teacher: [
    { label: 'Student Disciplinary / Academic Escalation', category: 'student_issue', targetRole: 'admin', hint: 'Routes to Principal / Dean of Students' },
    { label: 'Salary / Compensation Inquiry', category: 'salary', targetRole: 'accountant', hint: 'Routes to Accounts & Payroll' },
    { label: 'Formal Leave Application', category: 'leave', targetRole: 'admin', hint: 'Routes to Administrative Dean for approval' }
  ],
  driver: [
    { label: 'Vehicle Breakdown / Mechanical Inspection', category: 'vehicle', targetRole: 'admin', hint: 'Routes to Fleet Operations & Admin' },
    { label: 'Route Blockage / Traffic Emergency', category: 'route', targetRole: 'admin', hint: 'Routes to Transport Dispatcher' }
  ],
  gate: [
    { label: 'Campus Security Incident Alert', category: 'security', targetRole: 'admin', hint: 'Immediate high-priority broadcast to Admin' },
    { label: 'Unscheduled Visitor Approval', category: 'visitor', targetRole: 'teacher', hint: 'Routes to requested Host Faculty / Admin' }
  ],
  accountant: [
    { label: 'Capital Expenditure / Budget Approval', category: 'financial_approval', targetRole: 'admin', hint: 'Routes to Executive Board / Principal' },
    { label: 'Audit / Regulatory Discrepancy', category: 'financial_approval', targetRole: 'admin', hint: 'Routes to Institutional Leadership' }
  ],
  admin: [
    { label: 'Administrative Directive / General Ticket', category: 'general', targetRole: 'teacher', hint: 'Broadcast or assign to department' }
  ]
};

const CrossRoleTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const userRole = user?.role || 'student';
  const roleWorkflows = ROLE_OPTIONS[userRole] || ROLE_OPTIONS.student;

  const [selectedWorkflow, setSelectedWorkflow] = useState(roleWorkflows[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      addToast('Please provide both a subject and details.', 'warning', 'Missing Details');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/tickets', {
        target_role: selectedWorkflow.targetRole,
        category: selectedWorkflow.category,
        subject,
        description,
        priority: selectedWorkflow.category === 'security' ? 'urgent' : priority
      });

      if (res.success) {
        addToast(
          `Ticket ${res.ticket.ticket_number} dispatched to ${selectedWorkflow.targetRole.toUpperCase()}`,
          'success',
          'Ticket Routed Successfully'
        );
        setSubject('');
        setDescription('');
        setPriority('medium');
        onClose();
        if (onTicketCreated) onTicketCreated(res.ticket);
      } else {
        addToast(res.message || 'Failed to submit ticket', 'error');
      }
    } catch (err) {
      addToast('Network error while routing ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dispatch Cross-Role Workflow Ticket">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role Workflow selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Workflow Request Type ({userRole.toUpperCase()})
          </label>
          <div className="grid grid-cols-1 gap-2">
            {roleWorkflows.map((item, idx) => {
              const isSelected = selectedWorkflow.category === item.category;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedWorkflow(item)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-1 ring-brand-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <span className="inline-flex items-center text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-100/50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full">
                      → {item.targetRole.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.hint}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Target preview */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span>Routing to:</span>
            <span className="font-bold text-slate-900 dark:text-white capitalize">
              {selectedWorkflow.targetRole} Department
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-500 font-medium">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Subject Summary
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Bus R-14 brake pressure, Olympiad attendance excuse..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Detailed Explanation & Justification
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue, dates, reference numbers, or supporting details..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Routing Ticket...' : 'Dispatch Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CrossRoleTicketModal;
