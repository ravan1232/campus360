import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import TicketList from '../../components/tickets/TicketList';
import CrossRoleTicketModal from '../../components/tickets/CrossRoleTicketModal';
import HalfDayLeaveModal from '../../components/tickets/HalfDayLeaveModal';
import QrPassModal from '../../components/qr/QrPassModal';
import LiveBusTracker from '../../components/transport/LiveBusTracker';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Bus,
  CheckCircle2,
  Clock,
  PlusCircle,
  MapPin,
  Phone,
  FileText,
  QrCode,
  ShieldCheck,
  Eye,
  LogOut
} from 'lucide-react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [fees, setFees] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [halfDayLeaves, setHalfDayLeaves] = useState([]);

  // Modals
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isHalfDayModalOpen, setIsHalfDayModalOpen] = useState(false);
  const [viewingOutpass, setViewingOutpass] = useState(null);
  const [payingId, setPayingId] = useState(null);

  const { addToast } = useNotifications();

  const fetchData = async () => {
    try {
      const [statsRes, feesRes, ticketsRes, leavesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/fees'),
        api.get('/tickets'),
        api.get('/tickets/half-day-leaves')
      ]);

      if (statsRes.success) setData(statsRes.data);
      if (feesRes.success) setFees(feesRes.fees);
      if (ticketsRes.success) setTickets(ticketsRes.tickets);
      if (leavesRes.success) setHalfDayLeaves(leavesRes.leaves);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayFee = async (invoiceNo) => {
    setPayingId(invoiceNo);
    try {
      const res = await api.post('/fees/pay', {
        invoiceId: invoiceNo,
        paymentMethod: 'Student Online Portal Card'
      });
      if (res.success) {
        addToast(`Payment of $${res.fee.total_amount} processed!`, 'success', 'Invoice Paid');
        fetchData();
      }
    } catch (err) {
      addToast('Payment processing failed', 'error');
    } finally {
      setPayingId(null);
    }
  };

  const pendingAmount = fees.reduce((acc, f) => (f.status === 'pending' ? acc + Number(f.total_amount) : acc), 0);
  const approvedOutpass = halfDayLeaves.find(l => l.status === 'approved');

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onTicketCreated={fetchData}
    >
      <div className="space-y-8">
        
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Student Scholar Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Roll: STD-2026-042 • Grade 11 - Section A • STEM Scholar
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsHalfDayModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/25 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Apply for Half-Day Leave</span>
            </button>

            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Raise Ticket</span>
            </button>
          </div>
        </div>

        {/* Active Approved Gate Outpass Banner (if approved by teacher) */}
        {approvedOutpass && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-blue-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Approved Digital QR Exit Outpass Ready!
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 uppercase">
                    Ready For Gate
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Signed off by {approvedOutpass.teacher_name} • Token: <strong className="font-mono">{approvedOutpass.qr_token}</strong> • Valid today until 03:00 PM
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewingOutpass({
                token: approvedOutpass.qr_token,
                type: 'student_outpass',
                title: 'Student Half-Day Digital Outpass',
                holder_name: approvedOutpass.student_name,
                holder_id: approvedOutpass.roll,
                reason: approvedOutpass.reason,
                departure_time: approvedOutpass.departure_time,
                approved_by: approvedOutpass.teacher_name,
                parent_contact: approvedOutpass.parent_confirmation,
                valid_until: 'Today, 03:00 PM',
                status: 'approved'
              })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition shrink-0"
            >
              <Eye className="w-4 h-4" />
              <span>Display Gate QR Outpass</span>
            </button>
          </div>
        )}

        {/* 4 StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Attendance Score"
            value={data?.studentProfile?.overallAttendance || '94.5%'}
            change="Compliant (> 85% requirement)"
            trend="up"
            icon={CalendarCheck}
            gradient="from-emerald-600 to-teal-600"
          />
          <StatCard
            title="Cumulative GPA"
            value={data?.studentProfile?.gpa || '3.88'}
            change="Dean's High Honors List"
            trend="up"
            icon={GraduationCap}
            gradient="from-blue-600 to-indigo-600"
          />
          <StatCard
            title="Tuition Dues"
            value={`$${pendingAmount.toLocaleString()}`}
            change={pendingAmount > 0 ? "Term 2 due Oct 15" : "All fees cleared"}
            trend={pendingAmount > 0 ? "down" : "up"}
            icon={CreditCard}
            gradient="from-amber-600 to-orange-600"
          />
          <StatCard
            title="Assigned Bus"
            value="Route R-14"
            change="Bus-304 live GPS tracking"
            trend="neutral"
            icon={Bus}
            gradient="from-cyan-600 to-sky-600"
          />
        </div>

        {/* Live Bus Location Tracker Component */}
        <LiveBusTracker />

        {/* Course Performance & Grades */}
        <div className="card p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            Enrolled Courses & Academic Standing
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Current semester course roster and instructor reviews
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Subject</th>
                  <th className="py-2.5 px-3">Instructor</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3 rounded-r-xl">Term Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.subjects || []).map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {sub.name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{sub.instructor}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {sub.attendance}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded-md font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                        {sub.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tuition Invoices & Payment Gateway */}
        <div className="card p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                Tuition & Institutional Invoices
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Online payment gateway with instant receipt generation
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {fees.map((inv) => (
              <div key={inv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {inv.invoice_no}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      inv.status === 'paid'
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <h5 className="text-sm font-semibold text-slate-800 dark:text-white mt-1">
                    {inv.title}
                  </h5>
                  <p className="text-xs text-slate-400">Due: {inv.due_date}</p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-base font-extrabold text-slate-800 dark:text-white">
                      ${Number(inv.total_amount).toLocaleString()}
                    </p>
                    {inv.paid_amount > 0 && (
                      <p className="text-[10px] text-emerald-600 font-medium">
                        Paid: ${Number(inv.paid_amount).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {inv.status !== 'paid' ? (
                    <button
                      disabled={payingId === inv.invoice_no}
                      onClick={() => handlePayFee(inv.invoice_no)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      {payingId === inv.invoice_no ? 'Processing...' : 'Pay Online Now'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Filed Grievance / Workflow Tickets */}
        <TicketList
          tickets={tickets}
          onTicketUpdated={fetchData}
          title="My Filed Support Tickets & Appeals"
        />

      </div>

      {/* Ticket Modal */}
      <CrossRoleTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onTicketCreated={fetchData}
      />

      {/* Half-Day Leave Modal */}
      <HalfDayLeaveModal
        isOpen={isHalfDayModalOpen}
        onClose={() => setIsHalfDayModalOpen(false)}
        onSubmitted={fetchData}
      />

      {/* QR Outpass Display Modal */}
      <QrPassModal
        isOpen={!!viewingOutpass}
        onClose={() => setViewingOutpass(null)}
        pass={viewingOutpass}
      />

    </DashboardLayout>
  );
};

export default StudentDashboard;
