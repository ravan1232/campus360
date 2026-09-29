import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Bus,
  ShieldCheck,
  FileText,
  LifeBuoy,
  ClipboardList,
  AlertTriangle,
  UserCheck,
  GraduationCap
} from 'lucide-react';

const MENU_ITEMS = {
  admin: [
    { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Student & Staff Roster', icon: Users },
    { id: 'analytics', label: 'Institutional Financials', icon: CreditCard },
    { id: 'fleet', label: 'Fleet & Logistics', icon: Bus },
    { id: 'tickets', label: 'Cross-Role Workflows', icon: FileText }
  ],
  teacher: [
    { id: 'overview', label: 'Classroom Hub', icon: LayoutDashboard },
    { id: 'attendance', label: 'Take Attendance', icon: CalendarCheck },
    { id: 'students', label: 'Student Performance', icon: GraduationCap },
    { id: 'tickets', label: 'Grievance / Leave Requests', icon: FileText }
  ],
  student: [
    { id: 'overview', label: 'My Academic Portal', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance Record', icon: CalendarCheck },
    { id: 'fees', label: 'Tuition & Fee Status', icon: CreditCard },
    { id: 'transport', label: 'Live Bus Route', icon: Bus },
    { id: 'tickets', label: 'Support & Tickets', icon: LifeBuoy }
  ],
  accountant: [
    { id: 'overview', label: 'Bursar Financials', icon: LayoutDashboard },
    { id: 'fees', label: 'Invoices & Dues', icon: CreditCard },
    { id: 'disputes', label: 'Fee Adjustment Requests', icon: FileText },
    { id: 'payroll', label: 'Payroll & Approvals', icon: ClipboardList }
  ],
  driver: [
    { id: 'overview', label: 'Driver Console', icon: LayoutDashboard },
    { id: 'route', label: 'Route & Scheduled Stops', icon: Bus },
    { id: 'roster', label: 'Passenger Manifest', icon: UserCheck },
    { id: 'maintenance', label: 'Maintenance Log', icon: AlertTriangle }
  ],
  gate: [
    { id: 'overview', label: 'Security Station', icon: LayoutDashboard },
    { id: 'passes', label: 'Visitor Registry', icon: ShieldCheck },
    { id: 'alerts', label: 'Security Dispatch', icon: AlertTriangle }
  ]
};

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const role = user?.role || 'admin';
  const items = MENU_ITEMS[role] || MENU_ITEMS.admin;

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800 p-4 hidden md:flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Navigation Menu
          </p>
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/50 dark:from-brand-950/40 dark:to-slate-900 border border-brand-200/60 dark:border-brand-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Campus 360 Core
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
            Academic Term 2026-27 is currently active.
          </p>
        </div>
      </div>

      {/* Footer Role Info */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="capitalize">{user?.role} Access Mode</span>
        <span className="font-mono text-[10px]">v1.0-prod</span>
      </div>
    </aside>
  );
};

export default Sidebar;
