import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import TicketList from '../../components/tickets/TicketList';
import CrossRoleTicketModal from '../../components/tickets/CrossRoleTicketModal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bus,
  Users,
  Fuel,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldAlert,
  PlusCircle,
  Radio
} from 'lucide-react';

const DriverDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [roster, setRoster] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const { addToast } = useNotifications();

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/tickets')
      ]);

      if (statsRes.success) {
        setData(statsRes.data);
        if (statsRes.data.roster) setRoster(statsRes.data.roster);
      }
      if (ticketsRes.success) setTickets(ticketsRes.tickets);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleBoarded = (roll) => {
    setRoster(prev =>
      prev.map(item => {
        if (item.roll === roll) {
          const updated = !item.boarded;
          addToast(
            `${item.name} marked as ${updated ? 'Boarded' : 'Not Boarded'}`,
            updated ? 'success' : 'info'
          );
          return { ...item, boarded: updated };
        }
        return item;
      })
    );
  };

  const handleEmergencySOS = () => {
    addToast('EMERGENCY SOS BROADCASTED TO DISPATCH & CAMPUS ADMIN', 'urgent', 'SOS Triggered');
  };

  const boardedCount = roster.filter(r => r.boarded).length;

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onTicketCreated={fetchData}
    >
      <div className="space-y-8">
        {/* Header with SOS and Incident Report */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Transit Driver Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Vehicle: BUS-304 • Route: R-14 (North Metro - Campus Express)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Report Vehicle Issue</span>
            </button>
            <button
              onClick={handleEmergencySOS}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 animate-pulse transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>

        {/* 4 StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Vehicle Assignment"
            value="BUS-304"
            change="Volvo B7R Low-Floor"
            trend="neutral"
            icon={Bus}
            gradient="from-cyan-600 to-blue-600"
          />
          <StatCard
            title="Passengers Boarded"
            value={`${boardedCount} / 45`}
            change="Capacity: 84% utilized"
            trend="up"
            icon={Users}
            gradient="from-emerald-600 to-teal-600"
          />
          <StatCard
            title="Fuel Level"
            value="78%"
            change="Adequate for evening run"
            trend="neutral"
            icon={Fuel}
            gradient="from-amber-600 to-orange-600"
          />
          <StatCard
            title="Safety Status"
            value="Certified"
            change="Next check in 1,200 km"
            trend="up"
            icon={CheckCircle2}
            gradient="from-purple-600 to-violet-600"
          />
        </div>

        {/* Route Stops & Passenger Check-in Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stops Timeline */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-cyan-500" />
              Route R-14 Station Sequence
            </h3>

            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800 ml-2 mt-4 text-xs">
              {(data?.routeStops || []).map((stop) => (
                <div key={stop.id} className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                    stop.status === 'completed'
                      ? 'bg-emerald-500'
                      : stop.status === 'current'
                      ? 'bg-cyan-500 animate-ping'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`} />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {stop.name}
                    </span>
                    <span className="font-mono text-slate-400">{stop.time}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 capitalize">
                    Status: {stop.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Passenger Check-in Manifest */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  Scheduled Passenger Manifest
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tap to verify student boarding at stops
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 rounded-lg">
                Live Bus Roster
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-xl">Roll #</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Pickup Stop</th>
                    <th className="py-2.5 px-3 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {roster.map((p) => (
                    <tr key={p.roll} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono text-slate-500">{p.roll}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {p.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{p.stop}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleToggleBoarded(p.roll)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            p.boarded
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600'
                          }`}
                        >
                          {p.boarded ? 'Boarded ✓' : 'Mark Boarded'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Maintenance & Fleet Tickets */}
        <TicketList
          tickets={tickets}
          onTicketUpdated={fetchData}
          title="Vehicle Maintenance & Safety Tickets"
        />
      </div>

      <CrossRoleTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onTicketCreated={fetchData}
      />
    </DashboardLayout>
  );
};

export default DriverDashboard;
