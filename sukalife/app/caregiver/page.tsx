'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartHandshake,
  Users,
  Plus,
  LogOut,
  Droplet,
  Camera,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { api, authStorage } from '@/lib/api';
import SukaalifeLogo from '../components/sukaalifelogo';
import CaregiverLinkingModal from '../components/CaregiverLinkingModal';
import DailyChecklist from '../components/DailyChecklist';
import TextFeelingModule from '../components/TextFeelingModule';
import LiveCameraVerification from '../components/LiveCameraVerification';
import HealthReportModal from '../components/HealthReportModal';

export default function CaregiverPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [assignedPatients, setAssignedPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Quick Vital Log on Behalf State
  const [glucoseInput, setGlucoseInput] = useState('');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [loggingVital, setLoggingVital] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const res = await api.getMe();
      setCurrentUser(res.user);

      if (!res.profile || !res.profile.isProfileComplete) {
        router.push('/patient');
        return;
      }

      const patients = res.assignedPatients || [];
      setAssignedPatients(patients);
      if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].patient.id);
      }
    } catch (err) {
      console.error('Failed to load caregiver data:', err);
      router.push('/patient');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      router.push('/patient');
      return;
    }
    fetchSessionData();
  }, [router]);

  const handleLogout = () => {
    authStorage.clearToken();
    router.push('/patient');
  };

  const selectedPatient = assignedPatients.find((p) => p.patient.id === selectedPatientId)?.patient;

  const handleLogVitalOnBehalf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !glucoseInput) return;

    try {
      setLoggingVital(true);
      await api.logVitals({
        bloodGlucoseLevel: parseFloat(glucoseInput),
        photoUrl: capturedPhotoUrl || undefined
      });

      setGlucoseInput('');
      setCapturedPhotoUrl(null);
      setLogSuccess(true);
      setTimeout(() => setLogSuccess(false), 3000);
      await fetchSessionData();
    } catch (err: any) {
      console.error('Failed to log vitals on behalf:', err);
    } finally {
      setLoggingVital(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#BCE5D3]/20 flex flex-col items-center justify-center text-purple gap-3 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-purple" />
        <span className="text-sm font-bold">Loading Family & Caregiver Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground font-sans pb-16">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-zinc-900 border-b border-purple/15 px-6 py-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <SukaalifeLogo />
            </Link>
            <span className="hidden sm:inline-block text-xs font-black px-3 py-1 rounded-full bg-purple text-white">
              Caregiver Hub
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  <HeartHandshake className="h-4 w-4" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-foreground">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-foreground/70">Family Caregiver</div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="h-9 px-3.5 rounded-xl border border-purple/20 hover:bg-purple/10 text-purple text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Dependents Switcher Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-purple/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple" />
            <span className="text-xs font-black uppercase tracking-wider text-foreground/70">
              Assigned Family Members ({assignedPatients.length})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {assignedPatients.map((rel) => {
              const isSelected = selectedPatientId === rel.patient.id;
              return (
                <button
                  key={rel.patient.id}
                  type="button"
                  onClick={() => setSelectedPatientId(rel.patient.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple text-white shadow-md'
                      : 'bg-slate-100 dark:bg-zinc-800 text-foreground hover:bg-purple/10'
                  }`}
                >
                  {rel.patient.fullName}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsLinkModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-dashed border-purple text-purple hover:bg-purple/10 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Link Another Patient</span>
            </button>
          </div>
        </div>

        {assignedPatients.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-purple/15 shadow-xl max-w-lg mx-auto">
            <HeartHandshake className="h-14 w-14 text-purple mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground">
              No Patients Linked Yet
            </h3>
            <p className="text-xs sm:text-sm text-foreground/70 mt-2">
              Pair with your parent, child, or family member using their 6-digit connection code or registered phone number.
            </p>
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(true)}
              className="mt-6 px-6 py-3 rounded-2xl bg-purple hover:bg-purple/90 text-white text-xs font-black inline-flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Link Patient Account
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Patient Details Banner */}
            {selectedPatient && (
              <div className="bg-gradient-to-r from-purple via-purple/95 to-purple text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" /> Managing On Behalf Of
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black">{selectedPatient.fullName}</h2>
                  <p className="text-xs sm:text-sm text-white/80">
                    Phone: {selectedPatient.phone} • Type:{' '}
                    {selectedPatient.patientProfile?.diabetesType?.replace('_', ' ') || 'Diabetes Management'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white text-purple text-xs font-black flex items-center gap-2 shadow-md hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Health Report</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Log Vitals on Behalf Form & Daily Checklist Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form on Behalf */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-purple/15 shadow-xl space-y-5 lg:col-span-1">
                <div className="flex items-center gap-3 pb-3 border-b border-purple/10">
                  <div className="h-10 w-10 rounded-xl bg-purple text-white flex items-center justify-center">
                    <Droplet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Log Glucose for {selectedPatient?.fullName?.split(' ')[0]}
                    </h3>
                    <p className="text-[11px] text-foreground/60">Record current strip measurement</p>
                  </div>
                </div>

                {logSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Glucose reading recorded successfully!</span>
                  </div>
                )}

                <form onSubmit={handleLogVitalOnBehalf} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/80 mb-1">
                      Blood Glucose Level (mg/dL) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 112"
                      value={glucoseInput}
                      onChange={(e) => setGlucoseInput(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple"
                      required
                    />
                  </div>

                  {/* Camera Photo Strip Capture */}
                  <div>
                    <label className="block text-xs font-bold text-foreground/80 mb-1">
                      Test Strip Photo Verification
                    </label>
                    {capturedPhotoUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-purple/30">
                        <img src={capturedPhotoUrl} alt="Captured strip" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCapturedPhotoUrl(null)}
                          className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="w-full h-11 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 hover:bg-purple/5 text-foreground text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Camera className="h-4 w-4 text-purple" />
                        <span>Launch Camera Verification</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loggingVital}
                    className="w-full h-11 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loggingVital ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span>Save Vital Log for Patient</span>
                  </button>
                </form>
              </div>

              {/* Dynamic Daily Checklist for Dependent */}
              <div className="lg:col-span-2">
                <DailyChecklist patientId={selectedPatientId || undefined} />
              </div>
            </div>

            {/* Feelings & Mood Module on Behalf */}
            <div className="pt-2">
              <TextFeelingModule patientId={selectedPatientId || undefined} />
            </div>
          </div>
        )}

        {/* Modals */}
        {isLinkModalOpen && (
          <CaregiverLinkingModal
            isOpen={isLinkModalOpen}
            onClose={() => setIsLinkModalOpen(false)}
            userRole="CAREGIVER"
            onLinkSuccess={fetchSessionData}
          />
        )}

        {isCameraOpen && (
          <LiveCameraVerification
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCaptureComplete={(url) => setCapturedPhotoUrl(url)}
          />
        )}

        {isReportOpen && (
          <HealthReportModal
            isOpen={isReportOpen}
            onClose={() => setIsReportOpen(false)}
            patientId={selectedPatientId || undefined}
          />
        )}
      </main>
    </div>
  );
}
