import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  UserPlus,
  CreditCard,
  Bus,
  Bell,
  KeyRound,
  Shield,
  BookOpen,
  User,
  DollarSign,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Key
} from 'lucide-react';

const AdminDataCreationModal = ({ isOpen, onClose, initialTab = 'user', onDataCreated }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotifications();

  // Reference lists for dropdowns
  const [students, setStudents] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // ================= TAB 1: USER STATE =================
  const getInitialLoginId = (r) => {
    const num = Math.floor(1000 + Math.random() * 9000);
    switch (r) {
      case 'teacher': return `TCH-${num}`;
      case 'student': return `STD-${num}`;
      case 'driver': return `DRV-${num}`;
      case 'gate': return `SEC-${num}`;
      case 'accountant': return `ACC-${num}`;
      default: return `USR-${num}`;
    }
  };

  const [userRole, setUserRole] = useState('student');
  const [userLoginId, setUserLoginId] = useState(getInitialLoginId('student'));
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState(`Campus#${Math.floor(1000 + Math.random() * 9000)}`);
  const [userPhone, setUserPhone] = useState('+1-555-0100');
  const [department, setDepartment] = useState('Physics & Applied Sciences');
  const [specialization, setSpecialization] = useState('Grade 11-A Physics');
  const [employeeCode, setEmployeeCode] = useState('');
  const [grade, setGrade] = useState('Grade 11-A');
  const [rollNumber, setRollNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [busRoute, setBusRoute] = useState('Route 14 Express');
  const [vehicleNo, setVehicleNo] = useState('BUS-304');
  const [routeNo, setRouteNo] = useState('R-14');
  const [licenseNo, setLicenseNo] = useState('DL-98241-NY');
  const [gatePost, setGatePost] = useState('Main West Gate');
  const [shift, setShift] = useState('Morning Shift (06:00 - 14:00)');
  const [accountantTitle, setAccountantTitle] = useState('Bursar & Accounts Lead');
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // ================= TAB 2: FEE STATE =================
  const [feeStudentId, setFeeStudentId] = useState('');
  const [feeTitle, setFeeTitle] = useState('Annual Term Tuition Fee');
  const [feeAmount, setFeeAmount] = useState('1200.00');
  const [feeDueDate, setFeeDueDate] = useState('');
  const [feeStatus, setFeeStatus] = useState('pending');

  // ================= TAB 3: TRANSPORT STATE =================
  const [routeNumber, setRouteNumber] = useState('R-05');
  const [routeName, setRouteName] = useState('Metro Express - Campus Transit');
  const [busNumber, setBusNumber] = useState('BUS-205');
  const [busCapacity, setBusCapacity] = useState('45');
  const [routeDriverId, setRouteDriverId] = useState('');

  // ================= TAB 4: ANNOUNCEMENT STATE =================
  const [notifTargetRole, setNotifTargetRole] = useState('all');
  const [notifType, setNotifType] = useState('info');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  // ================= TAB 5: VISITOR PASS STATE =================
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('Campus Meeting / Academic Inquiry');
  const [visitorHost, setVisitorHost] = useState('Dr. Sarah Jenkins');
  const [visitorVehicle, setVisitorVehicle] = useState('Pedestrian Entry');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      setCreatedCredentials(null);
      // Fetch users to populate student and driver dropdowns
      api.get('/users').then((res) => {
        if (res.success && res.users) {
          setStudents(res.users.filter((u) => u.role === 'student'));
          setDrivers(res.users.filter((u) => u.role === 'driver'));
        }
      });
    }
  }, [isOpen]);

  const handleRoleSelect = (r) => {
    setUserRole(r);
    setUserLoginId(getInitialLoginId(r));
    if (r === 'student') setUserEmail('student.new@campus360.edu');
    else if (r === 'teacher') setUserEmail('teacher.new@campus360.edu');
    else if (r === 'driver') setUserEmail('driver.new@campus360.edu');
    else if (r === 'gate') setUserEmail('gate.new@campus360.edu');
    else setUserEmail('accountant.new@campus360.edu');
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Campus 360 Official Login Credentials:
Name: ${createdCredentials.name}
Role: ${createdCredentials.role.toUpperCase()}
Login ID: ${createdCredentials.loginId}
Email: ${createdCredentials.email}
Password: ${createdCredentials.password}
Portal URL: ${window.location.origin}/login`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Credentials copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  // Submit Handler: Add Member
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      addToast('Name and email are required.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/users', {
        name: userName.trim(),
        email: userEmail.trim(),
        loginId: userLoginId.trim(),
        role: userRole,
        password: userPassword.trim(),
        phone: userPhone.trim(),
        department,
        specialization,
        employeeCode: employeeCode || userLoginId,
        grade,
        rollNumber: rollNumber || userLoginId,
        parentName,
        parentPhone,
        busRoute,
        vehicleNo,
        routeNo,
        licenseNo,
        gatePost,
        shift,
        title: accountantTitle
      });
      if (res.success) {
        addToast(`Provisioned ${userName} as ${userRole.toUpperCase()} with Login ID ${res.user?.loginId || userLoginId}`, 'success', 'User Saved');
        setCreatedCredentials(res.loginCredentials || {
          name: userName,
          role: userRole,
          loginId: res.user?.loginId || userLoginId,
          email: userEmail,
          password: userPassword
        });
        if (onDataCreated) onDataCreated();
      } else {
        addToast(res.message || 'Failed to create user', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: Issue Fee Invoice
  const handleCreateFee = async (e) => {
    e.preventDefault();
    if (!feeTitle.trim() || !feeAmount) {
      addToast('Invoice title and amount are required.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/fees', {
        student_id: feeStudentId || (students[0]?.id || 1),
        title: feeTitle,
        total_amount: parseFloat(feeAmount),
        due_date: feeDueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: feeStatus
      });
      if (res.success) {
        addToast(`Fee invoice created and recorded in MySQL!`, 'success', 'Invoice Saved');
        setFeeTitle('Annual Term Tuition Fee');
        if (onDataCreated) onDataCreated();
        onClose();
      } else {
        addToast(res.message || 'Failed to issue fee', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving fee invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: Add Transport Route
  const handleCreateRoute = async (e) => {
    e.preventDefault();
    if (!routeNumber.trim() || !routeName.trim() || !busNumber.trim()) {
      addToast('Route code, name, and bus number are required.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/transport/routes', {
        route_number: routeNumber,
        route_name: routeName,
        bus_number: busNumber,
        capacity: parseInt(busCapacity),
        driver_id: routeDriverId || (drivers[0]?.id || null),
        status: 'on_route'
      });
      if (res.success) {
        addToast(`Route ${routeNumber} registered in MySQL fleet database!`, 'success', 'Fleet Line Saved');
        setRouteName('');
        if (onDataCreated) onDataCreated();
        onClose();
      } else {
        addToast(res.message || 'Failed to add route', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving route', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: Broadcast Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      addToast('Announcement title and message are required.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/notifications', {
        title: notifTitle,
        message: notifMessage,
        target_role: notifTargetRole,
        type: notifType
      });
      if (res.success) {
        addToast(`Broadcast sent to ${notifTargetRole.toUpperCase()} & saved to MySQL!`, 'success', 'Announcement Published');
        setNotifTitle('');
        setNotifMessage('');
        if (onDataCreated) onDataCreated();
        onClose();
      } else {
        addToast(res.message || 'Failed to publish announcement', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving announcement', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: Issue Visitor Pass
  const handleCreatePass = async (e) => {
    e.preventDefault();
    if (!visitorName.trim()) {
      addToast('Visitor name is required.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/gate/passes', {
        visitor_name: visitorName,
        visitor_phone: visitorPhone,
        purpose: visitorPurpose,
        host_name: visitorHost,
        vehicle_number: visitorVehicle
      });
      if (res.success) {
        addToast(`Visitor pass issued for ${visitorName} & stored in MySQL!`, 'success', 'Gate Entry Saved');
        setVisitorName('');
        setVisitorPhone('');
        if (onDataCreated) onDataCreated();
        onClose();
      } else {
        addToast(res.message || 'Failed to issue pass', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving pass', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Institutional Data Hub - Create Records" size="2xl">
      <div className="space-y-6">

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'user'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Campus Member</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fee')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'fee'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Fee Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transport')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'transport'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Bus Route</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('announcement')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'announcement'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Announcement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visitor')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition shrink-0 ${
              activeTab === 'visitor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Visitor Pass</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ADD CAMPUS MEMBER (STUDENT, TEACHER, STAFF) */}
        {/* ========================================================================= */}
        {activeTab === 'user' && (
          createdCredentials ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Member Successfully Provisioned!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Official login credentials have been assigned and recorded in the database.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2.5 font-mono text-xs shadow-inner">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-sans font-bold">MEMBER NAME</span>
                  <span className="font-bold text-white text-sm">{createdCredentials.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-sans font-bold">ASSIGNED ROLE</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600/80 text-white font-bold uppercase text-[10px]">
                    {createdCredentials.role}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-sans font-bold">LOGIN ID</span>
                  <span className="font-black text-cyan-400 text-sm tracking-wider">{createdCredentials.loginId}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-sans font-bold">LOGIN EMAIL</span>
                  <span className="text-slate-200">{createdCredentials.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans font-bold">ASSIGNED PASSWORD</span>
                  <span className="font-black text-emerald-400 text-sm tracking-wider">{createdCredentials.password}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The member can log into Campus 360 using either their <strong>Login ID</strong> or <strong>Email</strong> with the assigned password.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedCredentials(null);
                    setUserName('');
                    setUserEmail('');
                    setUserLoginId(getInitialLoginId(userRole));
                    setUserPassword(`Campus#${Math.floor(1000 + Math.random() * 9000)}`);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  + Add Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { r: 'student', label: 'Student', icon: User },
                  { r: 'teacher', label: 'Teacher', icon: BookOpen },
                  { r: 'driver', label: 'Driver', icon: Bus },
                  { r: 'gate', label: 'Gate Guard', icon: Shield },
                  { r: 'accountant', label: 'Accountant', icon: DollarSign }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.r}
                      type="button"
                      onClick={() => handleRoleSelect(item.r)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        userRole === item.r
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="alex@campus360.edu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="+1-555-0100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                {/* Role Specific Quick Field */}
                {userRole === 'teacher' && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Specialization</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Physics & Mechanics"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}

                {userRole === 'student' && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grade / Class</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="Grade 11-A"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}

                {userRole === 'driver' && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Commercial License #</label>
                    <input
                      type="text"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      placeholder="DL-NY-992014"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}

                {userRole === 'gate' && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Security Shift</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                      <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
                      <option value="Night Security (22:00 - 06:00)">Night Security (22:00 - 06:00)</option>
                    </select>
                  </div>
                )}

                {userRole === 'accountant' && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Title</label>
                    <input
                      type="text"
                      value={accountantTitle}
                      onChange={(e) => setAccountantTitle(e.target.value)}
                      placeholder="Bursar & Accounts Lead"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Assigned Login ID & Password Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Key size={14} /> Assigned Login Credentials ({userRole.toUpperCase()})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUserLoginId(getInitialLoginId(userRole))}
                      className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                      title="Generate new Login ID"
                    >
                      <RefreshCw size={11} /> New ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserPassword(`Campus#${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                      title="Generate new password"
                    >
                      <RefreshCw size={11} /> New Pass
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold mb-1">
                      ASSIGNED LOGIN ID (ID / ROLL / BADGE) *
                    </label>
                    <input
                      type="text"
                      required
                      value={userLoginId}
                      onChange={(e) => setUserLoginId(e.target.value)}
                      placeholder="e.g. TCH-8821 or STD-042"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-black text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold mb-1">
                      ASSIGNED PASSWORD *
                    </label>
                    <input
                      type="text"
                      required
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Detailed Role-Specific Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {userRole === 'teacher' && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Physics & Applied Sciences"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}

                {userRole === 'student' && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transit Bus Route</label>
                      <input
                        type="text"
                        value={busRoute}
                        onChange={(e) => setBusRoute(e.target.value)}
                        placeholder="Route 14 Express"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parent / Guardian Name</label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Eleanor Henderson"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Phone</label>
                      <input
                        type="text"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="+1-555-0999"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </>
                )}

                {userRole === 'driver' && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Vehicle No</label>
                      <input
                        type="text"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value)}
                        placeholder="BUS-304"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Route No</label>
                      <input
                        type="text"
                        value={routeNo}
                        onChange={(e) => setRouteNo(e.target.value)}
                        placeholder="R-14"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </>
                )}

                {userRole === 'gate' && (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Security Post Location</label>
                    <input
                      type="text"
                      value={gatePost}
                      onChange={(e) => setGatePost(e.target.value)}
                      placeholder="Main West Gate / East Delivery Gate"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}

                {userRole === 'accountant' && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Finance Office / Desk</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Bursar & Accounts Office"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition disabled:opacity-50"
              >
                {loading ? 'Saving Member to Database...' : `+ Provision ${userRole.toUpperCase()} Member with Credentials`}
              </button>
            </form>
          )
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ISSUE FEE INVOICE */}
        {/* ========================================================================= */}
        {activeTab === 'fee' && (
          <form onSubmit={handleCreateFee} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
                <select
                  value={feeStudentId}
                  onChange={(e) => setFeeStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roll_number || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Status</label>
                <select
                  value={feeStatus}
                  onChange={(e) => setFeeStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Title *</label>
                <input
                  type="text"
                  required
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  placeholder="e.g. Term 1 Tuition & Lab Fee"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  placeholder="1200.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={feeDueDate}
                  onChange={(e) => setFeeDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Recording Invoice...' : 'Record Fee Invoice to MySQL Database'}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ADD TRANSPORT ROUTE */}
        {/* ========================================================================= */}
        {activeTab === 'transport' && (
          <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Route Code *</label>
                <input
                  type="text"
                  required
                  value={routeNumber}
                  onChange={(e) => setRouteNumber(e.target.value)}
                  placeholder="R-14"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bus Number *</label>
                <input
                  type="text"
                  required
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  placeholder="BUS-304"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Route Name / Destination *</label>
                <input
                  type="text"
                  required
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g. North Metro - Campus Express"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Passenger Capacity</label>
                <input
                  type="number"
                  value={busCapacity}
                  onChange={(e) => setBusCapacity(e.target.value)}
                  placeholder="45"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assign Driver</label>
                <select
                  value={routeDriverId}
                  onChange={(e) => setRouteDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">-- None (Unassigned) --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Adding Route...' : 'Save Fleet Route to MySQL Database'}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BROADCAST ANNOUNCEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'announcement' && (
          <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
                <select
                  value={notifTargetRole}
                  onChange={(e) => setNotifTargetRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 capitalize"
                >
                  <option value="all">Broadcast to Entire Campus (All)</option>
                  <option value="teacher">Faculty & Teachers Only</option>
                  <option value="student">Students & Parents Only</option>
                  <option value="driver">Transport Drivers Only</option>
                  <option value="gate">Security & Gate Guards Only</option>
                  <option value="accountant">Accounts & Bursars Only</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Urgency Level</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="info">Informational (Blue)</option>
                  <option value="success">Success / Achievement (Green)</option>
                  <option value="warning">Notice / Warning (Amber)</option>
                  <option value="urgent">Urgent / Emergency Alert (Red)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Science Fair Registration Open / Winter Term Schedule"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Message Content *</label>
                <textarea
                  rows="3"
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Full bulletin description..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Broadcasting...' : 'Publish Announcement to MySQL Database'}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ISSUE VISITOR PASS */}
        {/* ========================================================================= */}
        {activeTab === 'visitor' && (
          <form onSubmit={handleCreatePass} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Johnathan Vance"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="+1-555-0811"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Host Faculty / Department</label>
                <input
                  type="text"
                  value={visitorHost}
                  onChange={(e) => setVisitorHost(e.target.value)}
                  placeholder="Dr. Sarah Jenkins / Science Dept"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle Plate / Mode</label>
                <input
                  type="text"
                  value={visitorVehicle}
                  onChange={(e) => setVisitorVehicle(e.target.value)}
                  placeholder="NY-882-K / Pedestrian"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  value={visitorPurpose}
                  onChange={(e) => setVisitorPurpose(e.target.value)}
                  placeholder="Official Academic Review / Vendor Meeting"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Generating Pass...' : 'Issue Visitor Pass to MySQL Database'}
            </button>
          </form>
        )}

      </div>
    </Modal>
  );
};

export default AdminDataCreationModal;
