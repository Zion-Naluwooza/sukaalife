'use client';

import React, { useState } from 'react';
import { Camera, Plus, CheckCircle2, Languages, Calendar, Scale, Clock, User, LogOut } from 'lucide-react';

export default function PatientApp() {
  // Navigation & Auth Flow States
  const [step, setStep] = useState<'signup' | 'login' | 'medical' | 'dashboard'>('signup');
  const [language, setLanguage] = useState('English');

  // Auth Form Fields
  const [authData, setAuthData] = useState({
    fullName: '',
    phone: '',
    email: '',
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
  const [schedules, setSchedules] = useState([
    { id: 1, type: 'medication', name: 'Regular Insulin (10 Units)', time: '08:00 AM' },
    { id: 2, type: 'feeding', name: 'Low Carb Breakfast Meal', time: '08:30 AM' },
  ]);

  // Logged Vitals History
  const [logs, setLogs] = useState([
    { id: 1, detail: 'Glucose: 115 mg/dL', time: '8:00 AM', verified: true },
  ]);

  // Handlers
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('login');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('medical');
  };

  const handleMedicalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('dashboard');
  };

  const handleLogVitals = (e: React.FormEvent) => {
    e.preventDefault();
    let detailStr = '';
    if (medicalData.diabetesType === 'type1') {
      if (!bloodGlucoseLevel) return;
      detailStr = `Blood Glucose: ${bloodGlucoseLevel} mg/dL`;
    } else {
      if (!hba1c || !bloodPressure) return;
      detailStr = `HbA1c: ${hba1c}% | BP: ${bloodPressure} mmHg`;
    }

    if (weight) {
      detailStr += ` | Weight: ${weight} kg`;
    }

    setLogs([{ id: Date.now(), detail: detailStr, time: 'Just now', verified: true }, ...logs]);
    setBloodGlucoseLevel('');
    setHba1c('');
    setBloodPressure('');
    setWeight('');
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleName || !scheduleTime) return;
    setSchedules([...schedules, { id: Date.now(), type: scheduleType, name: scheduleName, time: scheduleTime }]);
    setScheduleName('');
    setScheduleTime('');
    setShowScheduleModal(false);
  };

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
              onClick={() => setStep('login')} 
              className="p-2 bg-slate-200 rounded-xl hover:bg-slate-300 transition text-slate-700" 
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

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
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <input 
                type="email" required placeholder="patient@example.com"
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

            <button type="submit" className="w-full bg-[#B7E5DC] text-slate-900 font-extrabold py-3.5 rounded-2xl text-base shadow-sm hover:opacity-90 transition">
              Sign Up
            </button>
          </form>
          <p className="text-center text-xs text-slate-500">
            Already have an account? <button onClick={() => setStep('login')} className="text-purple-900 font-bold underline">Login</button>
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
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email / Phone</label>
              <input 
                type="text" required placeholder="Email or Phone Number"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input 
                type="password" required placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#B7E5DC]"
              />
            </div>

            <button type="submit" className="w-full bg-[#B7E5DC] text-slate-900 font-extrabold py-3.5 rounded-2xl text-base shadow-sm hover:opacity-90 transition">
              Login
            </button>
          </form>
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

            <button type="submit" className="w-full bg-[#B7E5DC] text-slate-900 font-extrabold py-3.5 rounded-2xl text-base shadow-sm hover:opacity-90 transition">
              Complete Medical Setup & Launch Dashboard
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
                <h2 className="text-xl font-extrabold text-slate-900">{authData.fullName || 'Patient Profile'}</h2>
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
                    type="number" required placeholder="e.g. 110"
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
                <button type="button" className="px-4 py-3 bg-[#DFD2F0]/40 border border-[#DFD2F0] rounded-2xl text-purple-950 font-bold text-xs flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-900" /> Photo Verify
                </button>
                <button type="submit" className="flex-1 bg-[#B7E5DC] text-slate-900 font-extrabold py-3 rounded-2xl text-sm shadow-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Save Log
                </button>
              </div>
            </form>

            {/* Schedules Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Medication & Meal Schedules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schedules.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 block">{item.name}</span>
                      <span className="text-purple-900 uppercase font-bold text-[10px]">{item.type}</span>
                    </div>
                    <span className="bg-[#DFD2F0] text-purple-950 px-2.5 py-1 rounded-xl font-bold">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Vitals History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Recorded History</h3>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-sm">{log.detail}</span>
                    <span className="bg-[#B7E5DC] text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-800" /> Verified
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs block">{log.time}</span>
                </div>
              ))}
            </div>
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
                  type="text" required placeholder="e.g. 02:00 PM"
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
                  className="w-1/2 py-3 bg-[#B7E5DC] text-slate-900 rounded-2xl font-extrabold text-sm shadow-sm hover:opacity-90"
                >
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