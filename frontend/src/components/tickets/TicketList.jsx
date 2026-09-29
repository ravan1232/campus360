import React, { useState } from 'react';
import Badge from '../common/Badge';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCircle2, Clock, XCircle, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';

const TicketList = ({ tickets = [], onTicketUpdated, title = "Cross-Role Workflow Queue" }) => {
  const { addToast } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      const res = await api.patch(`/tickets/${ticketId}/status`, {
        status: newStatus,
        resolution_notes: `Status updated to ${newStatus} by current user.`
      });

      if (res.success) {
        addToast(`Ticket status marked as ${newStatus}`, 'success');
        if (onTicketUpdated) onTicketUpdated(res.ticket);
      } else {
        addToast(res.message || 'Failed to update ticket', 'error');
      }
    } catch (err) {
      addToast('Error updating ticket status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active cross-department tickets and grievance requests
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
          {['all', 'open', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                filter === st
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No workflow tickets found in this view.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-2 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {ticket.ticket_number}
                  </span>
                  <Badge variant={ticket.priority}>{ticket.priority}</Badge>
                  <Badge variant={ticket.status}>{ticket.status.replace('_', ' ')}</Badge>

                  {/* Flow Route */}
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    <span className="capitalize">{ticket.sender_role}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="capitalize font-semibold text-brand-600 dark:text-brand-400">
                      {ticket.target_role}
                    </span>
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {ticket.subject}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {ticket.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>From: {ticket.sender_name || ticket.sender_role}</span>
                  <span>•</span>
                  <span>Category: {ticket.category}</span>
                </div>
              </div>

              {/* Right Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                {ticket.status !== 'resolved' && (
                  <button
                    disabled={updatingId === ticket.id}
                    onClick={() => handleStatusChange(ticket.id, 'resolved')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                )}

                {ticket.status === 'open' && (
                  <button
                    disabled={updatingId === ticket.id}
                    onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    In Progress
                  </button>
                )}

                {ticket.status !== 'rejected' && ticket.status !== 'resolved' && (
                  <button
                    disabled={updatingId === ticket.id}
                    onClick={() => handleStatusChange(ticket.id, 'rejected')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketList;
