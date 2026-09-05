'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Plus,
  CheckCircle2,
  Languages,
  Calendar,
  Scale,
  Clock,
  User,
  LogOut,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { api, authStorage } from '@/lib/api';

interface ScheduleItem {
  id: string | number;
  type: 'medication' | 'feeding';
  name: string;
  time: string;
}

interface VitalLogItem {
  id: string | number;
  detail: string;
  time: string;
  verified: boolean;
}

export default function PatientApp() {
  // Navigation & Auth Flow States
  const [step, setStep] = useState<'signup' | 'login' | 'medical' | 'dashboard'>('signup');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Current Patient User Info
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    fullName: string;
    email?: string;
    phone?: string;
  }>({
    fullName: '',
  });

  // Auth Form Fields (Sign Up)
  const [authData, setAuthData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  // Login Form Fields
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  // Medical Profile Fields
  const [medicalData, setMedicalData] = useState({
    emergencyContactName: '',
    emergencyContactPhone: '',
    diagnosisYear: '',
    diabetesType: 'type1' as 'type1' | 'type2',
    gender: 'Female',
    dateOfBirth: '',
  });

  // Dynamic Vital Logging Fields
  const [bloodGlucoseLevel, setBloodGlucoseLevel] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [weight, setWeight] = useState('');

  // Dashboard Modals & Schedules
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<'medication' | 'feeding'>('medication');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Logged Vitals History
  const [logs, setLogs] = useState<VitalLogItem[]>([]);

  // Helper to format timestamps for vitals history
  const formatLogTime = (dateStr?: string | Date): string => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Load patient data from backend if already authenticated
  const loadUserData = useCallback(async () => {
    try {
      const data = await api.getMe();
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          fullName: data.user.fullName,
          phone: data.user.phone,
          email: data.user.email,
        });

        if (data.profile && data.profile.isProfileComplete) {
          setMedicalData({
            emergencyContactName: data.profile.emergencyContactName || '',
            emergencyContactPhone: data.profile.emergencyContactPhone || '',
            diagnosisYear: data.profile.diagnosisYear ? String(data.profile.diagnosisYear) : '',
            diabetesType: data.profile.diabetesType === 'TYPE_2' ? 'type2' : 'type1',
            gender: data.profile.gender || 'Female',
            dateOfBirth: data.profile.dateOfBirth ? data.profile.dateOfBirth.split('T')[0] : '',
          });

          // Populate vitals history
          if (data.vitalLogs && data.vitalLogs.length > 0) {
            setLogs(
              data.vitalLogs.map((l: any) => ({
                id: l.id,
                detail: l.detail,
                time: formatLogTime(l.loggedAt),
                verified: l.verified ?? true,
              }))
            );
          }

          // Populate schedules
          if (data.schedules && data.schedules.length > 0) {
            setSchedules(
              data.schedules.map((s: any) => ({
                id: s.id,
                type: s.type.toLowerCase() === 'feeding' ? 'feeding' : 'medication',
                name: s.name,
                time: s.time,
              }))
            );
          }

          setStep('dashboard');
        } else {
          setStep('medical');
        }
      }
    } catch (err: any) {
      // If token expired or invalid, reset
      authStorage.clearToken();
      setStep('login');
    } finally {
      setInitLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = authStorage.getToken();
    if (token) {
      loadUserData();
    } else {
      setInitLoading(false);
    }
  }, [loadUserData]);

  // Clear notices after 5 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Handlers
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.register(authData);
      setCurrentUser({
        id: res.userId,
        fullName: res.fullName,
        phone: authData.phone,
        email: authData.email,
      });
      setSuccessMessage('Account created successfully! Please complete your medical setup.');
      setStep('medical');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.login(loginData);
      setCurrentUser({
        id: res.userId,
        fullName: res.fullName,
        email: res.email,
        phone: res.phone,
      });

      if (res.isProfileComplete) {
        await loadUserData();
        setStep('dashboard');
      } else {
        setStep('medical');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await api.saveMedicalProfile({
        emergencyContactName: medicalData.emergencyContactName,
        emergencyContactPhone: medicalData.emergencyContactPhone,
        diagnosisYear: medicalData.diagnosisYear,
        diabetesType: medicalData.diabetesType === 'type1' ? 'TYPE_1' : 'TYPE_2',
        gender: medicalData.gender,
        dateOfBirth: medicalData.dateOfBirth,
        bloodGlucoseLevel: medicalData.diabetesType === 'type1' ? bloodGlucoseLevel : undefined,
        hba1c: medicalData.diabetesType === 'type2' ? hba1c : undefined,
        bloodPressure: medicalData.diabetesType === 'type2' ? bloodPressure : undefined,
        weight: weight || undefined,
      });

      setSuccessMessage('Medical profile saved successfully!');
      await loadUserData();
      setStep('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save medical profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (medicalData.diabetesType === 'type1' && !bloodGlucoseLevel) {
      setErrorMessage('Please enter your blood glucose level.');
      return;
    }
    if (medicalData.diabetesType === 'type2' && (!hba1c || !bloodPressure)) {
      setErrorMessage('Please enter your HbA1c and blood pressure.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.logVitals({
        bloodGlucoseLevel: medicalData.diabetesType === 'type1' ? bloodGlucoseLevel : undefined,
        hba1c: medicalData.diabetesType === 'type2' ? hba1c : undefined,
        bloodPressure: medicalData.diabetesType === 'type2' ? bloodPressure : undefined,
        weight: weight || undefined,
      });

      if (res.log) {
        setLogs((prev) => [
          {
            id: res.log.id,
            detail: res.log.detail,
            time: formatLogTime(res.log.loggedAt),
            verified: res.log.verified,
          },
          ...prev,
        ]);
      }

      setBloodGlucoseLevel('');
      setHba1c('');
      setBloodPressure('');
      setWeight('');
      setSuccessMessage('Vital log recorded successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to log vitals.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleName || !scheduleTime) return;

    setLoading(true);
    try {
      const res = await api.createSchedule({
        type: scheduleType,
        name: scheduleName,
        time: scheduleTime,
      });

      if (res.schedule) {
        setSchedules((prev) => [
          {
            id: res.schedule.id,
            type: res.schedule.type.toLowerCase() === 'feeding' ? 'feeding' : 'medication',
            name: res.schedule.name,
            time: res.schedule.time,
          },
          ...prev,
        ]);
      }

      setScheduleName('');
      setScheduleTime('');
      setShowScheduleModal(false);
      setSuccessMessage('Schedule added!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string | number) => {
    try {
      await api.deleteSchedule(String(id));
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      setSuccessMessage('Schedule removed.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove schedule.');
    }
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setCurrentUser({ fullName: '' });
    setLoginData({ identifier: '', password: '' });
    setAuthData({ fullName: '', phone: '', email: '', password: '' });
    setLogs([]);
    setSchedules([]);
    setStep('login');
  };

  if (initLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
          <p className="text-sm font-bold text-slate-600">Loading Sukaalife...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[90%] max-w-[90%] mx-auto min-h-screen bg-slate-50 py-8 font-sans text-slate-800">
      
      {/* App Navigation Bar */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sukaalife</h1>
          <p className="text-sm text-slate-500 mt-1">Patient Portal</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-[#DFD2F0] px-4 py-2 rounded-xl shadow-sm text-sm text-slate-900 font-medium">
            <Languages className="w-4 h-4 text-purple-900" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold text-slate-900 text-sm"
            >
              <option>English</option>
              <option>Luganda</option>
              <option>Kiswahili</option>
              <option>Lusoga</option>
              <option>Lugbara</option>
              <option>Acholi</option>
              <option>Runyankole</option>
            </select>
          </div>

          {step === 'dashboard' && (
            <button 
              onClick={handleLogout} 
              className="p-2 bg-slate-200 rounded-xl hover:bg-red-100 hover:text-red-700 transition text-slate-700" 
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Global Alerts Banner */}
      {errorMessage && (
        <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium flex-1">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-xs font-bold text-red-600 underline">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="max-w-xl mx-auto mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium flex-1">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-xs font-bold text-emerald-600 underline">Dismiss</button>
        </div>
      )}

      {/* STEP 1: AUTHENTICATION - SIGN UP */}
      {step === 'signup' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Create Patient Account</h2>
            <p className="text-sm text-slate-500">Sign up to manage your diabetes care profile.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input 
                type="text" required placeholder="e.g. Sharitah Nanteza"
                value={authData.fullName} onChange={(e) => setAuthData({ ...authData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input 
                type="tel" required placeholder="e.g. +256 770 947655"
                value={authData.phone} onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input 
                type="email" placeholder="patient@example.com"
                value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input 
                type="password" required placeholder="••••••••"
                value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#B7E5DC] text-slate-900 font-extrabold py-3.5 rounded-2xl text-base shadow-sm hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <p className="text-center text-xs text-slate-500">
            Already have an account? <button onClick={() => { setErrorMessage(null); setStep('login'); }} className="text-purple-900 font-bold underline">Login</button>
          </p>
        </div>
      )}

      {/* STEP 2: AUTHENTICATION - LOGIN */}
      {step === 'login' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Patient Login</h2>
            <p className="text-sm text-slate-500">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email / Phone Number</label>
              <input 
                type="text" required placeholder="e.g. +256... or patient@example.com"
                value={loginData.identifier}
                onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input 
                type="password" required placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#B7E5DC] text-slate-900 font-extrabold py-3.5 rounded-2xl text-base shadow-sm hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don&apos;t have an account? <button onClick={() => { setErrorMessage(null); setStep('signup'); }} className="text-purple-900 font-bold underline">Create Account</button>
          </p>
        </div>
      )}

      {/* STEP 3: MEDICAL INFORMATION FORM */}
      {step === 'medical' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Medical Setup</h2>
            <p className="text-sm text-slate-500">Provide emergency contacts and diabetes diagnostic details.</p>
          </div>

          <form onSubmit={handleMedicalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Contact Name</label>
                <input 
                  type="text" required placeholder="Caregiver / Relative Name"
                  value={medicalData.emergencyContactName} onChange={(e) => setMedicalData({ ...medicalData, emergencyContactName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Emergency Contact Phone</label>
                <input 
                  type="tel" required placeholder="+256..."
                  value={medicalData.emergencyContactPhone} onChange={(e) => setMedicalData({ ...medicalData, emergencyContactPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diabetes Type</label>
                <select 
                  value={medicalData.diabetesType} onChange={(e) => setMedicalData({ ...medicalData, diabetesType: e.target.value as 'type1' | 'type2' })}
                  className="w-full bg-[#DFD2F0]/40 border border-[#DFD2F0] font-bold text-slate-900 rounded-2xl px-4 py-3 text-sm outline-none cursor-pointer"
                >
                  <option value="type1">Type 1 Diabetes</option>
                  <option value="type2">Type 2 Diabetes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diagnosis Year</label>
                <input 
                  type="number" required placeholder="e.g. 2020"
                  value={medicalData.diagnosisYear} onChange={(e) => setMedicalData({ ...medicalData, diagnosisYear: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender</label>
                <select 
                  value={medicalData.gender} onChange={(e) => setMedicalData({ ...medicalData, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none cursor-pointer"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date of Birth</label>
                <input 
                  type="date" required
                  value={medicalData.dateOfBirth} onChange={(e) => setMedicalData({ ...medicalData, dateOfBirth: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#B7E5DC] text-slate-900 font-extrabold py-3.5 rounded-2xl text-base shadow-sm hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Saving Setup...' : 'Complete Medical Setup & Launch Dashboard'}
            </button>
          </form>
        </div>
      )}

      {/* STEP 4: PATIENT DASHBOARD */}
      {step === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Profile Summary Banner */}
            <div className="bg-[#DFD2F0]/40 border border-[#DFD2F0] p-6 rounded-3xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{currentUser.fullName || 'Patient Profile'}</h2>
                <p className="text-xs text-purple-900 font-bold mt-1">
                  {medicalData.diabetesType === 'type1' ? 'Type 1 Diabetes (Daily Glucose Tracking)' : 'Type 2 Diabetes (Quarterly HbA1c & Blood Pressure Tracking)'}
                </p>
              </div>
              <button 
                onClick={() => setShowScheduleModal(true)} 
                className="bg-[#B7E5DC] text-slate-900 px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-sm hover:opacity-90 transition"
              >
                <Clock className="w-4 h-4" /> Add Schedule
              </button>
            </div>

            {/* DYNAMIC VITAL ENTRY FORM */}
            <form onSubmit={handleLogVitals} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Log Vitals ({medicalData.diabetesType === 'type1' ? 'Type 1' : 'Type 2'})
              </h3>

              {/* Dynamic Inputs Based on Diabetes Type */}
              {medicalData.diabetesType === 'type1' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Glucose Level (mg/dL)</label>
                  <input 
                    type="number" step="0.1" required placeholder="e.g. 110"
                    value={bloodGlucoseLevel} onChange={(e) => setBloodGlucoseLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">HbA1c (%)</label>
                    <input 
                      type="number" step="0.1" required placeholder="e.g. 6.8"
                      value={hba1c} onChange={(e) => setHba1c(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Blood Pressure (mmHg)</label>
                    <input 
                      type="text" required placeholder="e.g. 120/80"
                      value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                    />
                  </div>
                </div>
              )}

              {/* Optional Weight Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg) <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  type="number" step="0.1" placeholder="e.g. 68.5"
                  value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setSuccessMessage('Photo verification captured locally.')}
                  className="px-4 py-3 bg-[#DFD2F0]/40 hover:bg-[#DFD2F0]/70 transition border border-[#DFD2F0] rounded-2xl text-purple-950 font-bold text-xs flex items-center gap-2"
                >
                  <Camera className="w-5 h-5 text-purple-900" /> Photo Verify
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-[#B7E5DC] text-slate-900 font-extrabold py-3 rounded-2xl text-sm shadow-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save Log
                </button>
              </div>
            </form>

            {/* Schedules Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Medication & Meal Schedules</h3>
              {schedules.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No schedules added yet. Click &quot;Add Schedule&quot; above to create reminders.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schedules.map((item) => (
                    <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs group">
                      <div>
                        <span className="font-extrabold text-slate-900 block">{item.name}</span>
                        <span className="text-purple-900 uppercase font-bold text-[10px]">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#DFD2F0] text-purple-950 px-2.5 py-1 rounded-xl font-bold">{item.time}</span>
                        <button 
                          onClick={() => handleDeleteSchedule(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-red-600"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Vitals History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Recorded History</h3>
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No vital logs recorded yet. Use the form to record your first entry.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900 text-sm">{log.detail}</span>
                      <span className="bg-[#B7E5DC] text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-800" /> {log.verified ? 'Verified' : 'Logged'}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs block">{log.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ADD SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-slate-900 text-lg">Add Schedule</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Schedule Type</label>
                <select 
                  value={scheduleType} onChange={(e) => setScheduleType(e.target.value as 'medication' | 'feeding')}
                  className="w-full bg-[#DFD2F0]/40 border border-[#DFD2F0] font-bold text-slate-900 rounded-2xl px-4 py-3 text-sm outline-none cursor-pointer"
                >
                  <option value="medication">Medication</option>
                  <option value="feeding">Feeding / Meal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name / Description</label>
                <input 
                  type="text" required placeholder={scheduleType === 'medication' ? 'e.g. Metformin 500mg' : 'e.g. Low sugar dinner'}
                  value={scheduleName} onChange={(e) => setScheduleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Schedule Time</label>
                <input 
                  type="text" required placeholder="e.g. 08:00 AM"
                  value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" onClick={() => setShowScheduleModal(false)}
                  className="w-1/2 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-1/2 py-3 bg-[#B7E5DC] text-slate-900 rounded-2xl font-extrabold text-sm shadow-sm hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}