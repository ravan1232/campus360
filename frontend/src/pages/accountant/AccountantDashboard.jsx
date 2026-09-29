import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import TicketList from '../../components/tickets/TicketList';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Send,
  PlusCircle,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const AccountantDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [fees, setFees] = useState([]);
  const [tickets, setTickets] = useState([]);
  const { addToast } = useNotifications();

  const fetchData = async () => {
    try {
      const [statsRes, feesRes, ticketsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/fees'),
        api.get('/tickets')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (feesRes.success) setFees(feesRes.fees);
      if (ticketsRes.success) setTickets(ticketsRes.tickets);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onTicketCreated={fetchData}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Bursar & Financial Accounting
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tuition billing, payroll distributions, scholarship adjustments, and expenditure approvals.
            </p>
          </div>
          <button
            onClick={() => addToast('Exporting Q3 Financial Statement as PDF...', 'info', 'Ledger Export')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-brand-500" />
            <span>Export Statement</span>
          </button>
        </div>

        {/* Financial StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Invoiced"
            value={stats?.financialSummary?.totalInvoiced || '$145,050'}
            change="Academic Year 2026-27"
            trend="neutral"
            icon={CreditCard}
            gradient="from-blue-600 to-indigo-600"
          />
          <StatCard
            title="Total Collected"
            value={stats?.financialSummary?.totalCollected || '$130,200'}
            change="Processed through Gateway"
            trend="up"
            icon={DollarSign}
            gradient="from-emerald-600 to-teal-600"
          />
          <StatCard
            title="Outstanding Receivables"
            value={stats?.financialSummary?.pendingAmount || '$14,850'}
            change="Requires billing reminder"
            trend="down"
            icon={AlertCircle}
            gradient="from-amber-600 to-orange-600"
          />
          <StatCard
            title="Collection Ratio"
            value={stats?.financialSummary?.collectionRatio || '90%'}
            change="Target: > 88% by midterm"
            trend="up"
            icon={TrendingUp}
            gradient="from-purple-600 to-violet-600"
          />
        </div>

        {/* Cashflow Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Monthly Inflows vs Operational Payroll
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tuition receipts compared against staff monthly disbursements
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-lg">
              Solvent Reserve
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.cashFlowMonthly || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="collections" name="Fee Inflow" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="payroll" name="Staff Payroll" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tuition Ledger */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            Student Invoices & Receivables Ledger
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Direct ledger of active student charges and reconciliation
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Invoice #</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {fees.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {inv.invoice_no}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {inv.student_name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{inv.title}</td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-white">
                      ${Number(inv.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{inv.due_date}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cross-role Tickets (Fee disputes from Students, Financial approvals to Admin) */}
        <TicketList
          tickets={tickets}
          onTicketUpdated={fetchData}
          title="Fee Adjustment Requests & Requisitions"
        />
      </div>
    </DashboardLayout>
  );
};

export default AccountantDashboard;
