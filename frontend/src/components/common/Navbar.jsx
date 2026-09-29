import React, { useState } from 'react';
import { useAuth, getRoleDefaultPath } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from './Badge';
import CrossRoleTicketModal from '../tickets/CrossRoleTicketModal';
import {
  GraduationCap,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  PlusCircle,
  Shield,
  BookOpen,
  User,
  DollarSign,
  Bus,
  KeyRound
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_ICONS = {
  admin: Shield,
  teacher: BookOpen,
  student: User,
  accountant: DollarSign,
  driver: Bus,
  gate: KeyRound
};

const Navbar = ({ onTicketCreated }) => {
  const { user, logout, quickLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleRoleSwitch = async (targetRole) => {
    setIsRoleMenuOpen(false);
    const res = await quickLogin(targetRole);
    if (res.success) {
      navigate(getRoleDefaultPath(targetRole));
    }
  };

  const CurrentRoleIcon = ROLE_ICONS[user?.role] || Shield;

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-600 dark:from-white dark:via-brand-300 dark:to-indigo-400 bg-clip-text text-transparent">
                  Campus 360
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                  ERP Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Unified Academic & Operations Portal
              </p>
            </div>
          </div>

          {/* Center/Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Cross-Role Action Button */}
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>New Workflow Ticket</span>
            </button>

            {/* Active Role Workspace Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all text-xs font-medium"
              >
                <CurrentRoleIcon className="w-4 h-4 text-brand-500" />
                <Badge variant={user?.role}>{user?.role}</Badge>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role Workspace
                    </p>
                  </div>
                  {['admin', 'teacher', 'student', 'accountant', 'driver', 'gate'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors capitalize ${
                        user?.role === role ? 'text-brand-600 dark:text-brand-400 font-bold bg-brand-50/50 dark:bg-brand-950/30' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {role === 'admin' && <Shield className="w-3.5 h-3.5 text-purple-500" />}
                        {role === 'teacher' && <BookOpen className="w-3.5 h-3.5 text-blue-500" />}
                        {role === 'student' && <User className="w-3.5 h-3.5 text-emerald-500" />}
                        {role === 'accountant' && <DollarSign className="w-3.5 h-3.5 text-amber-500" />}
                        {role === 'driver' && <Bus className="w-3.5 h-3.5 text-cyan-500" />}
                        {role === 'gate' && <KeyRound className="w-3.5 h-3.5 text-rose-500" />}
                        {role} Portal
                      </span>
                      {user?.role === role && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                      Notifications & Alerts
                    </span>
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                      {unreadCount} unread
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-center text-slate-400">
                        No notifications to show.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors text-left ${
                            !notif.is_read ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {notif.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 ml-2">
                              {notif.time || 'New'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* User Profile Avatar & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {user?.title || user?.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cross-role ticket modal */}
      <CrossRoleTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onTicketCreated={onTicketCreated}
      />
    </>
  );
};

export default Navbar;
