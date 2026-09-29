import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import TicketList from '../../components/tickets/TicketList';
import AdminDataCreationModal from '../../components/admin/AdminDataCreationModal';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  Users,
  CreditCard,
  Bus,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Power,
  Bell,
  KeyRound,
  Eye,
  Copy,
  Check,
  Key,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState('user');
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
  const [copiedModal, setCopiedModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const openCreationModal = (tabName) => {
    setModalInitialTab(tabName);
    setIsDataModalOpen(true);
  };

  const { addToast } = useNotifications();

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes, usersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/tickets'),
        api.get('/users')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ticketsRes.success) setTickets(ticketsRes.tickets);
      if (usersRes.success) setUsersList(usersRes.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/users/${userId}/status`, {});
      if (res.success) {
        addToast(res.message, 'info', 'Status Updated');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName}?`)) return;
    try {
      const res = await api.delete(`/users/${userId}`);
      if (res.success) {
        addToast(`Removed ${userName}`, 'warning');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to delete user', 'error');
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesRole = userFilter === 'all' || u.role === userFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onTicketCreated={fetchData}
    >
      <div className="space-y-8">
        
        {/* Page Header with Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Executive Institutional Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Full control across academics, staff roster, financial health, logistics, and perimeter security.
            </p>
          </div>

          {/* Quick Action Button Hub */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openCreationModal('user')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Member</span>
            </button>

            <button
              onClick={() => openCreationModal('fee')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>+ Issue Fee</span>
            </button>

            <button
              onClick={() => openCreationModal('transport')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/25 transition"
            >
              <Bus className="w-3.5 h-3.5" />
              <span>+ Add Route</span>
            </button>

            <button
              onClick={() => openCreationModal('announcement')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/25 transition"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>+ Announcement</span>
            </button>

            <button
              onClick={() => openCreationModal('visitor')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 transition"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>+ Visitor Pass</span>
            </button>
          </div>
        </div>

        {/* 5 Dynamic KPI StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            title="Total Students"
            value={stats?.kpis?.[0]?.value ?? usersList.filter(u => u.role === 'student').length}
            change="Registered in MySQL"
            trend="up"
            icon={Users}
            gradient="from-blue-600 to-indigo-600"
          />
          <StatCard
            title="Faculty & Staff"
            value={`${stats?.kpis?.[1]?.value ?? usersList.filter(u => u.role !== 'student').length} Members`}
            change="Active roster"
            trend="neutral"
            icon={Layers}
            gradient="from-purple-600 to-violet-600"
          />
          <StatCard
            title="Fee Collections"
            value={stats?.kpis?.[2]?.value ?? '100%'}
            change="Recorded Invoices"
            trend="up"
            icon={CreditCard}
            gradient="from-emerald-600 to-teal-600"
          />
          <StatCard
            title="Active Fleet"
            value={stats?.kpis?.[3]?.value ?? '0 Active'}
            change="Registered fleet lines"
            trend="neutral"
            icon={Bus}
            gradient="from-cyan-600 to-sky-600"
          />
          <StatCard
            title="Open Tickets"
            value={stats?.kpis?.[4]?.value ?? tickets.filter(t => t.status === 'open').length}
            change="Cross-role workflow"
            trend="down"
            icon={AlertCircle}
            gradient="from-amber-600 to-rose-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Financial Health: Tuition Inflows vs Operating Costs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Monthly figures in USD ($)
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-lg">
                YTD Positive
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueAnalytics || []}>
                  <defs>
                    <linearGradient id="colorTuition" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="tuition"
                    name="Tuition Inflow"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTuition)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExp)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Weekly Campus Attendance Rate
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Aggregate student presence %
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.attendanceTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[85, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val}%`, 'Attendance']}
                  />
                  <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Central Cross-Role Ticket Dispatch Queue */}
        <TicketList
          tickets={tickets}
          onTicketUpdated={fetchData}
          title="Institutional Workflow & Grievance Dispatch Queue"
        />

        {/* Multi-Role User Management Section */}
        <div className="card p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                Campus User Accounts & Access Registry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage Teachers, Drivers, Students, Gate Guards, and Accountants
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-44"
                />
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                {['all', 'teacher', 'driver', 'student', 'gate', 'accountant'].map((rf) => (
                  <button
                    key={rf}
                    onClick={() => setUserFilter(rf)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                      userFilter === rf
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {rf === 'gate' ? 'Gate' : rf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850/60 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">User Name</th>
                  <th className="py-3 px-4">Assigned Login ID</th>
                  <th className="py-3 px-4">Role Classification</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Role Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No members registered under this filter. Click <span className="font-bold text-blue-600 dark:text-blue-400">+ Add Member</span> above to provision accounts.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const displayLoginId = u.loginId || u.login_id || (u.role === 'admin' ? 'ADM-001' : 'ID-AUTO');
                    let roleSpecificInfo = '';
                    if (u.role === 'student') roleSpecificInfo = `${u.grade || 'Grade 11-A'} · ${u.busRoute || 'Route 14'}`;
                    else if (u.role === 'teacher') roleSpecificInfo = `${u.department || 'Physics & STEM'} ${u.specialization ? `(${u.specialization})` : ''}`;
                    else if (u.role === 'driver') roleSpecificInfo = `${u.vehicleNo || 'BUS-304'} · ${u.routeNo || 'Route 14'}`;
                    else if (u.role === 'gate') roleSpecificInfo = `${u.gatePost || 'Main West Gate'} · ${u.shift || 'Morning'}`;
                    else if (u.role === 'accountant') roleSpecificInfo = `${u.title || 'Bursar Lead'} · ${u.department || 'Finance'}`;
                    else roleSpecificInfo = u.department || 'Executive Directorate';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                            {u.name ? u.name[0] : 'U'}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{u.phone || '+1-555-0100'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-mono font-black text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                            <Key size={11} className="text-blue-500" />
                            {displayLoginId}
                          </span>
                        </td>
                        <td className="py-3 px-4 capitalize font-bold text-blue-600 dark:text-blue-400">
                          {u.role === 'gate' ? 'Gate Guard' : u.role}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                          {roleSpecificInfo}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                          }`}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedUserForModal(u);
                                setCopiedModal(false);
                              }}
                              title="View Login Credentials & Profile Details"
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u.id)}
                              title="Toggle Active / Inactive"
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Delete user"
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Institutional Data Creation Modal */}
      <AdminDataCreationModal
        isOpen={isDataModalOpen}
        initialTab={modalInitialTab}
        onClose={() => setIsDataModalOpen(false)}
        onDataCreated={() => fetchData()}
      />

      {/* Member Credentials & Profile Details Inspection Modal */}
      {selectedUserForModal && (
        <Modal
          isOpen={!!selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          title={`Member Credentials & Profile: ${selectedUserForModal.name}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans font-bold">MEMBER NAME</span>
                <span className="font-bold text-white text-sm">{selectedUserForModal.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans font-bold">ASSIGNED ROLE</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-600/80 text-white font-bold uppercase text-[10px]">
                  {selectedUserForModal.role === 'gate' ? 'GATE GUARD' : selectedUserForModal.role?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans font-bold">LOGIN ID</span>
                <span className="font-black text-cyan-400 text-sm tracking-wider">
                  {selectedUserForModal.loginId || selectedUserForModal.login_id || (selectedUserForModal.role === 'admin' ? 'ADM-001' : 'N/A')}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans font-bold">OFFICIAL EMAIL</span>
                <span className="text-slate-200">{selectedUserForModal.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans font-bold">ASSIGNED PASSWORD</span>
                <span className="font-black text-emerald-400 text-sm tracking-wider">
                  {selectedUserForModal.password || 'password123'}
                </span>
              </div>
            </div>

            {/* Profile Detail Roster */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">PHONE NUMBER</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUserForModal.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">STATUS</span>
                <span className="font-bold text-emerald-600 capitalize">{selectedUserForModal.status || 'active'}</span>
              </div>
              {selectedUserForModal.department && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">DEPARTMENT / DESK</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUserForModal.department}</span>
                </div>
              )}
              {selectedUserForModal.grade && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">ENROLLED GRADE</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUserForModal.grade}</span>
                </div>
              )}
              {selectedUserForModal.vehicleNo && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">ASSIGNED BUS</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUserForModal.vehicleNo}</span>
                </div>
              )}
              {selectedUserForModal.gatePost && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">SECURITY POST</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUserForModal.gatePost}</span>
                </div>
              )}
              {selectedUserForModal.parentName && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">PARENT / GUARDIAN</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUserForModal.parentName} ({selectedUserForModal.parentPhone || ''})</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const idText = selectedUserForModal.loginId || selectedUserForModal.login_id || 'ADM-001';
                  const text = `Campus 360 Official Login Credentials:
Name: ${selectedUserForModal.name}
Role: ${selectedUserForModal.role?.toUpperCase()}
Login ID: ${idText}
Email: ${selectedUserForModal.email}
Password: ${selectedUserForModal.password || 'password123'}
Portal URL: ${window.location.origin}/login`;
                  navigator.clipboard.writeText(text);
                  setCopiedModal(true);
                  addToast('Credentials copied to clipboard!', 'success');
                  setTimeout(() => setCopiedModal(false), 3000);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition"
              >
                {copiedModal ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedModal ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserForModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

    </DashboardLayout>
  );
};

export default AdminDashboard;
