import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  UserPlus, Shield, BookOpen, User, Bus, KeyRound, DollarSign, CheckCircle2,
  Copy, Check, RefreshCw, Key, Mail, Lock, ShieldCheck
} from 'lucide-react';

const UserCreationModal = ({ isOpen, onClose, onUserCreated }) => {
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

  const [role, setRole] = useState('teacher');
  const [loginId, setLoginId] = useState(getInitialLoginId('teacher'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(`Campus#${Math.floor(1000 + Math.random() * 9000)}`);
  const [phone, setPhone] = useState('+1-555-0199');

  // Role specific fields
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
  const [shift, setShift] = useState('Morning Shift');
  const [title, setTitle] = useState('Bursar & Accounts Officer');

  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const { addToast } = useNotifications();

  const handleGeneratePassword = () => {
    const newPass = `Campus#${Math.floor(1000 + Math.random() * 9000)}`;
    setPassword(newPass);
  };

  const handleGenerateLoginId = () => {
    setLoginId(getInitialLoginId(role));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setLoginId(getInitialLoginId(newRole));
    if (newRole === 'student') setEmail('student.new@campus360.edu');
    else if (newRole === 'teacher') setEmail('teacher.new@campus360.edu');
    else if (newRole === 'driver') setEmail('driver.new@campus360.edu');
    else if (newRole === 'gate') setEmail('gate.new@campus360.edu');
    else setEmail('accountant.new@campus360.edu');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addToast('Please provide both name and email.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        loginId: loginId.trim(),
        password: password.trim(),
        phone: phone.trim(),
        role,
        department,
        specialization,
        employeeCode: employeeCode || loginId,
        grade,
        rollNumber: rollNumber || loginId,
        parentName,
        parentPhone,
        busRoute,
        vehicleNo,
        routeNo,
        licenseNo,
        gatePost,
        shift,
        title
      };

      const res = await api.post('/users', payload);

      if (res.success) {
        addToast(`Provisioned new ${role.toUpperCase()} account for ${name}`, 'success', 'User Registered');
        setCreatedCredentials(res.loginCredentials || {
          name,
          role,
          loginId: res.user?.loginId || `${role.slice(0,3).toUpperCase()}-2026-9921`,
          email,
          password
        });
        if (onUserCreated) onUserCreated(res.user);
      } else {
        addToast(res.message || 'Failed to create user', 'error');
      }
    } catch (err) {
      addToast('Network error creating user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCreatedCredentials(null);
    setName('');
    setEmail('');
    setPassword(`Campus#${Math.floor(1000 + Math.random() * 9000)}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Campus Member" maxWidth="max-w-xl">
      {createdCredentials ? (
        /* Credential Display Card upon successful creation */
        <div className="space-y-5 py-2">
          <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/50 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Member Successfully Provisioned!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Official login credentials have been generated and saved to the database.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 font-mono text-xs shadow-inner">
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
              <span className="text-slate-400 font-sans font-bold">GENERATED LOGIN ID</span>
              <span className="font-black text-cyan-400 text-sm tracking-wider">{createdCredentials.loginId}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-sans font-bold">LOGIN EMAIL</span>
              <span className="text-slate-200">{createdCredentials.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans font-bold">TEMPORARY PASSWORD</span>
              <span className="font-black text-emerald-400 text-sm tracking-wider">{createdCredentials.password}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The member can log into Campus 360 using either their <strong>Login ID</strong> or <strong>Email</strong> along with the temporary password.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCopyCredentials}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
            </button>
            <button
              onClick={handleClose}
              className="btn-secondary px-6 py-3 font-bold"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* User Provisioning Form */
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          
          {/* Role Selector Grid */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Select Member Role
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'teacher', label: 'Teacher', icon: BookOpen, color: 'text-blue-600' },
                { id: 'student', label: 'Student', icon: User, color: 'text-emerald-600' },
                { id: 'driver', label: 'Driver', icon: Bus, color: 'text-cyan-600' },
                { id: 'gate', label: 'Gate Guard', icon: KeyRound, color: 'text-rose-600' },
                { id: 'accountant', label: 'Accountant', icon: DollarSign, color: 'text-amber-600' }
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleChange(r.id)}
                    className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${r.color}`} />
                    <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="input"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Official Campus Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus360.edu"
                className="input"
              />
            </div>
          </div>

          {/* Assigned Login ID & Password Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Key size={14} /> Assigned Login Credentials ({role.toUpperCase()})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateLoginId}
                  className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                  title="Generate new Login ID"
                >
                  <RefreshCw size={11} /> New ID
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                  title="Generate new password"
                >
                  <RefreshCw size={11} /> New Pass
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold mb-1">
                  LOGIN ID (ID / ROLL / BADGE) *
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. TCH-8821 or STD-042"
                  className="input py-1.5 px-3 font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 text-[10px] block font-bold mb-1">
                  LOGIN PASSWORD *
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input py-1.5 px-3 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Role-Specific Fields */}
          {role === 'teacher' && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Academic Department</label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="input"
                    placeholder="e.g. Physics & Applied Sciences"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Subject / Assigned Class</label>
                  <input
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="input"
                    placeholder="Grade 11-A Physics"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'student' && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Assigned Grade / Class</label>
                  <input
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="input"
                    placeholder="e.g. Grade 11-A"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Transit Bus Route</label>
                  <input
                    value={busRoute}
                    onChange={(e) => setBusRoute(e.target.value)}
                    className="input"
                    placeholder="Route 14 Express"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Parent / Guardian Name</label>
                  <input
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="input"
                    placeholder="e.g. Eleanor Montgomery"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Parent Contact Phone</label>
                  <input
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="input"
                    placeholder="+1-555-0999"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'driver' && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Assigned Bus Number</label>
                  <input
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="input"
                    placeholder="BUS-304"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Transit Route Code</label>
                  <input
                    value={routeNo}
                    onChange={(e) => setRouteNo(e.target.value)}
                    className="input"
                    placeholder="Route 14 Express"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Commercial Driver License #</label>
                <input
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="input"
                  placeholder="DL-NY-992014"
                />
              </div>
            </div>
          )}

          {role === 'gate' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Security Station Post</label>
                <input
                  value={gatePost}
                  onChange={(e) => setGatePost(e.target.value)}
                  className="input"
                  placeholder="Main West Gate / East Perimeter"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Security Shift Timing</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="input"
                >
                  <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                  <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
                  <option value="Night Security (22:00 - 06:00)">Night Security (22:00 - 06:00)</option>
                </select>
              </div>
            </div>
          )}

          {role === 'accountant' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Official Title / Role</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Chief Bursar & Finance Lead"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Finance Office / Desk</label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input"
                  placeholder="Bursar & Accounts Office"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Registering...' : `+ Provision ${role.toUpperCase()} Member`}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default UserCreationModal;
