import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import TicketList from '../../components/tickets/TicketList';
import QrPassModal from '../../components/qr/QrPassModal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  BookOpen,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Send,
  Calendar,
  QrCode,
  UserCheck,
  Eye,
  ShieldCheck
} from 'lucide-react';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [halfDayLeaves, setHalfDayLeaves] = useState([]);
  const [viewingQrPass, setViewingQrPass] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotifications();

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes, leavesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/tickets'),
        api.get('/tickets/half-day-leaves')
      ]);

      if (statsRes.success) {
        setData(statsRes.data);
        if (statsRes.data.students) setStudents(statsRes.data.students);
      }
      if (ticketsRes.success) setTickets(ticketsRes.tickets);
      if (leavesRes.success) setHalfDayLeaves(leavesRes.leaves);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAttendanceToggle = async (studentId, newStatus) => {
    try {
      const res = await api.post('/attendance/mark', { studentId, status: newStatus });
      if (res.success) {
        setStudents(prev =>
          prev.map(s => (s.id === studentId ? { ...s, status: newStatus } : s))
        );
        addToast(`Marked ${res.student.name} as ${newStatus}`, 'success', 'Attendance Updated');
      }
    } catch (err) {
      addToast('Failed to update attendance', 'error');
    }
  };

  const handleApproveLeave = async (leaveId) => {
    setApprovingId(leaveId);
    try {
      const res = await api.patch(`/tickets/half-day-leaves/${leaveId}/approve`, {});
      if (res.success) {
        addToast(`Approved half-day outpass! Generated token ${res.qrPass.token}`, 'success', 'QR Pass Issued');
        setViewingQrPass(res.qrPass);
        fetchData();
      } else {
        addToast(res.message || 'Failed to approve outpass.', 'error');
      }
    } catch (err) {
      addToast('Error processing outpass approval.', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const pendingLeaves = halfDayLeaves.filter(l => l.status === 'pending_teacher');

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onTicketCreated={fetchData}>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Classroom & Faculty Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Active Term: {data?.teacherProfile?.department || 'Department of Physics & STEM'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <CalendarCheck className="w-4 h-4" />
            <span>Leave Balance: {data?.teacherProfile?.leaveBalance || '8 Days'}</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Classes Scheduled"
            value="3 Sessions"
            change="Next: Period 1 (08:30)"
            trend="neutral"
            icon={BookOpen}
            gradient="from-blue-600 to-indigo-600"
          />
          <StatCard
            title="Class Attendance"
            value={data?.attendanceRate || '94.2%'}
            change="+1.5% this week"
            trend="up"
            icon={CalendarCheck}
            gradient="from-emerald-600 to-teal-600"
          />
          <StatCard
            title="Student Roster"
            value={students.length || 6}
            change="Grade 11-A Physics"
            trend="neutral"
            icon={FileCheck}
            gradient="from-purple-600 to-violet-600"
          />
          <StatCard
            title="Outpass Requests"
            value={`${pendingLeaves.length} Pending`}
            change="Half-day exit applications"
            trend={pendingLeaves.length > 0 ? "down" : "up"}
            icon={QrCode}
            gradient="from-amber-600 to-orange-600"
          />
        </div>

        {/* Student Half-Day Leave Approvals & QR Outpass Section */}
        <div className="card p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                Student Half-Day Leave Requests & Gate QR Approvals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contacted by students for medical, family, or urgent reasons. Approving mints official QR outpass for gate logout.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl">
              {pendingLeaves.length} Action Required
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {halfDayLeaves.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No active student half-day leave requests.
              </p>
            ) : (
              halfDayLeaves.map((leave) => {
                const isApproved = leave.status === 'approved' || leave.status === 'exited';
                return (
                  <div key={leave.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {leave.student_name}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          ({leave.roll})
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          leave.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : leave.status === 'exited'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                        }`}>
                          {leave.status === 'approved' ? 'QR Outpass Active' : leave.status === 'exited' ? 'Exited Gate' : 'Pending Teacher Sign-off'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <strong>Reason:</strong> {leave.reason}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                        <span>Exit Time: <strong className="text-blue-600 dark:text-blue-400">{leave.departure_time}</strong></span>
                        <span>•</span>
                        <span>Transit: {leave.transport_mode}</span>
                        <span>•</span>
                        <span>Parent: {leave.parent_confirmation}</span>
                        {leave.qr_token && (
                          <>
                            <span>•</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              Token: {leave.qr_token}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-center">
                      {!isApproved ? (
                        <button
                          disabled={approvingId === leave.id}
                          onClick={() => handleApproveLeave(leave.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{approvingId === leave.id ? 'Minting QR...' : 'Approve & Issue QR Outpass'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setViewingQrPass({
                            token: leave.qr_token,
                            type: 'student_outpass',
                            title: 'Student Half-Day Digital Outpass',
                            holder_name: leave.student_name,
                            holder_id: leave.roll,
                            reason: leave.reason,
                            departure_time: leave.departure_time,
                            approved_by: leave.teacher_name,
                            parent_contact: leave.parent_confirmation,
                            valid_until: 'Today, 03:00 PM',
                            status: leave.status
                          })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Outpass QR</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Schedule & Attendance Marker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-500" />
              Today's Lecture Timetable
            </h3>
            <div className="space-y-3">
              {(data?.schedule || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{item.subject}</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">{item.room}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">{item.period}</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">Topic: {item.topic}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-500" />
                  Quick Attendance Marker (Grade 11-A)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tap status to record real-time daily presence
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                Active Session
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-xl">Roll #</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Avg Att.</th>
                    <th className="py-2.5 px-3 rounded-r-xl text-right">Today's Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono text-slate-500">{student.roll}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {student.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{student.attendance}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleAttendanceToggle(student.id, 'present')}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                              student.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleAttendanceToggle(student.id, 'late')}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                              student.status === 'late'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-600'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleAttendanceToggle(student.id, 'absent')}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                              student.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Assigned Workflow Tickets */}
        <TicketList
          tickets={tickets}
          onTicketUpdated={fetchData}
          title="Student Inquiries & Departmental Tickets"
        />

      </div>

      {/* QR Pass Viewer Modal */}
      <QrPassModal
        isOpen={!!viewingQrPass}
        onClose={() => setViewingQrPass(null)}
        pass={viewingQrPass}
      />

    </DashboardLayout>
  );
};

export default TeacherDashboard;
