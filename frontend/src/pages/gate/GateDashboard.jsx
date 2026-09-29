import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import TicketList from '../../components/tickets/TicketList';
import Modal from '../../components/common/Modal';
import QrPassModal from '../../components/qr/QrPassModal';
import QrScannerModal from '../../components/qr/QrScannerModal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  ShieldCheck,
  UserPlus,
  LogOut,
  AlertTriangle,
  Clock,
  Car,
  Phone,
  CheckCircle2,
  Users,
  QrCode,
  Scan,
  Bus,
  BookOpen,
  Eye,
  FileCheck
} from 'lucide-react';

const GateDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [passes, setPasses] = useState([]);
  const [qrPasses, setQrPasses] = useState([]);
  const [scanLogs, setScanLogs] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Modals
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [viewingPass, setViewingPass] = useState(null);

  // QR Generator Form State
  const [qrType, setQrType] = useState('student_outpass');
  const [holderName, setHolderName] = useState('');
  const [holderId, setHolderId] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleType, setVehicleType] = useState('School Transit Bus');
  const [reason, setReason] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [departureTime, setDepartureTime] = useState('12:30 PM');

  const { addToast } = useNotifications();

  const fetchData = async () => {
    try {
      const [statsRes, passesRes, qrPassesRes, logsRes, ticketsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/gate/passes'),
        api.get('/gate/qr/passes'),
        api.get('/gate/qr/logs'),
        api.get('/tickets')
      ]);

      if (statsRes.success) setData(statsRes.data);
      if (passesRes.success) setPasses(passesRes.passes);
      if (qrPassesRes.success) setQrPasses(qrPassesRes.passes);
      if (logsRes.success) setScanLogs(logsRes.logs);
      if (ticketsRes.success) setTickets(ticketsRes.tickets);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateQrPass = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/gate/qr/generate', {
        type: qrType,
        holder_name: holderName,
        holder_id: holderId,
        vehicle_no: vehicleNo,
        vehicle_type: vehicleType,
        reason,
        departure_time: departureTime,
        parent_contact: parentContact
      });

      if (res.success) {
        addToast(`Generated ${res.pass.title} (${res.pass.token})`, 'success', 'QR Pass Minted');
        setIsQrGeneratorOpen(false);
        setViewingPass(res.pass);
        // Reset form
        setHolderName('');
        setHolderId('');
        setVehicleNo('');
        setReason('');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to generate QR pass.', 'error');
    }
  };

  const handleCheckOut = async (passId) => {
    try {
      const res = await api.patch(`/gate/passes/${passId}/checkout`, {});
      if (res.success) {
        addToast(res.message, 'info', 'Visitor Checked Out');
        fetchData();
      }
    } catch (err) {
      addToast('Error checking out visitor', 'error');
    }
  };

  const activeVisitors = passes.filter(p => p.status === 'active');

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onTicketCreated={fetchData}>
      <div className="space-y-8">
        
        {/* Header & QR Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Gate Security & QR Access Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Station: Main West Gate • Officer in Charge: Officer Vikram Singh
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition"
            >
              <Scan className="w-4 h-4" />
              <span>Scan & Verify QR Code</span>
            </button>

            <button
              onClick={() => setIsQrGeneratorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate Universal QR Pass</span>
            </button>
          </div>
        </div>

        {/* 4 StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Campus Visitors"
            value={activeVisitors.length}
            change="Currently inside perimeter"
            trend="neutral"
            icon={Users}
            gradient="from-emerald-600 to-teal-600"
          />
          <StatCard
            title="Total Entries Today"
            value="342"
            change="Vehicles & Pedestrians"
            trend="up"
            icon={ShieldCheck}
            gradient="from-blue-600 to-indigo-600"
          />
          <StatCard
            title="Student Outpasses"
            value={`${qrPasses.filter(q => q.type === 'student_outpass').length} Issued`}
            change="Class Teacher verified"
            trend="neutral"
            icon={Clock}
            gradient="from-purple-600 to-violet-600"
          />
          <StatCard
            title="Security Status"
            value="Code Green"
            change="All gates secure & logged"
            trend="up"
            icon={CheckCircle2}
            gradient="from-cyan-600 to-sky-600"
          />
        </div>

        {/* Universal Digital QR Pass Registry */}
        <div className="card p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                Active Universal QR Passes (Students, Teachers & Vehicles)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any pass to inspect or present high-resolution barcode
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl">
              {qrPasses.length} Registered Passes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {qrPasses.map((p) => {
              const isExited = p.status === 'exited';
              return (
                <div
                  key={p.id || p.token}
                  onClick={() => setViewingPass(p)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        p.type === 'student_outpass'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : p.type === 'vehicle'
                          ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {p.type.replace('_', ' ')}
                      </span>

                      <span className={`text-[10px] font-bold ${isExited ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {isExited ? 'Exited' : 'Active'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {p.holder_name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {p.reason || p.purpose || p.title}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400 font-bold">{p.token}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View QR
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Gate Exit & Scan Audit Logs */}
        <div className="card p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                Live Gate Logout & Scan Audit Trail
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified timestamps when students, staff, or vehicles exit the perimeter
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Pass / Token</th>
                  <th className="py-2.5 px-3">Holder / Entity</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3 rounded-r-xl">Security Gate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {scanLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {log.token}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {log.holder_name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{log.type}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{log.scanned_at}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{log.gate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Dispatch & Tickets */}
        <TicketList
          tickets={tickets}
          onTicketUpdated={fetchData}
          title="Perimeter Security Alerts & Host Approvals"
        />

      </div>

      {/* QR Scanner Console Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={() => fetchData()}
      />

      {/* QR Pass Viewer / Print Modal */}
      <QrPassModal
        isOpen={!!viewingPass}
        onClose={() => setViewingPass(null)}
        pass={viewingPass}
      />

      {/* Universal QR Pass Generator Modal */}
      <Modal
        isOpen={isQrGeneratorOpen}
        onClose={() => setIsQrGeneratorOpen(false)}
        title="Issue Universal QR Access Pass"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateQrPass} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Pass Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'student_outpass', label: 'Student Outpass' },
                { id: 'vehicle', label: 'Vehicle Transit' },
                { id: 'teacher', label: 'Faculty Pass' },
                { id: 'visitor', label: 'Visitor Permit' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQrType(t.id)}
                  className={`p-2 rounded-xl text-center font-bold text-[11px] border transition ${
                    qrType === t.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Holder / Driver Full Name
              </label>
              <input
                type="text"
                required
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="e.g. Aiden Montgomery, Driver Robert"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Roll / Employee / ID Code
              </label>
              <input
                type="text"
                value={holderId}
                onChange={(e) => setHolderId(e.target.value)}
                placeholder="STD-042 or EMP-109"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {qrType === 'vehicle' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle License Plate
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="BUS-304 or KA-01-AB-1234"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Class
                </label>
                <input
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  placeholder="School Transit Bus / Contractor Van"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Clearance Reason / Purpose
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Half-Day Medical Departure, Scheduled Transit Route, Guest Lecture"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          {qrType === 'student_outpass' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Exit Time
                </label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="12:30 PM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Emergency Phone
                </label>
                <input
                  type="text"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="+1-555-0999"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsQrGeneratorOpen(false)}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25"
            >
              Generate QR Pass
            </button>
          </div>
        </form>
      </Modal>

    </DashboardLayout>
  );
};

export default GateDashboard;
