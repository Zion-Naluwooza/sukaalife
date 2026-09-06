'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  BookOpen,
  MessageSquare,
  FileText,
  Award,
  LogOut,
  Building2,
  Loader2,
  Search
} from 'lucide-react';
import { api, authStorage } from '@/lib/api';
import SukaalifeLogo from '../components/sukaalifelogo';
import EducationCenter from '../components/EducationCenter';
import PatientQAModule from '../components/PatientQAModule';
import HealthReportModal from '../components/HealthReportModal';

type ActiveTab = 'qa' | 'education' | 'reports';

export default function SpecialistPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('qa');

  // Report Search State
  const [reportPatientId, setReportPatientId] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Auth & Session check
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      router.push('/patient');
      return;
    }

    const initSpecialist = async () => {
      try {
        setLoading(true);
        const res = await api.getMe();
        setCurrentUser(res.user);
        setProfile(res.profile);

        if (!res.profile || !res.profile.isProfileComplete) {
          router.push('/patient');
          return;
        }
      } catch (err) {
        console.error('Failed to load specialist profile:', err);
        router.push('/patient');
      } finally {
        setLoading(false);
      }
    };

    initSpecialist();
  }, [router]);

  const handleLogout = () => {
    authStorage.clearToken();
    router.push('/patient');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#BCE5D3]/20 flex flex-col items-center justify-center text-purple gap-3 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-purple" />
        <span className="text-sm font-bold">Loading Specialist Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground font-sans pb-16">
      
      {/* Top Navbar */}
      <nav className="bg-white dark:bg-zinc-900 border-b border-purple/15 px-6 py-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <SukaalifeLogo />
            </Link>
            <span className="hidden sm:inline-block text-xs font-black px-3 py-1 rounded-full bg-purple text-white">
              Specialist Suite
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  Dr
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1">
                    <span>{currentUser.fullName}</span>
                    <Award className="h-3.5 w-3.5 text-purple" />
                  </div>
                  <div className="text-[11px] text-foreground/70">
                    {profile?.specialty || 'Diabetes Specialist'}
                  </div>
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

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="space-y-8">
          {/* Specialist Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-purple/15 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#DFD2F0] text-purple flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground/60">Clinical Queue</div>
                <div className="text-xl font-black text-foreground">Active Triage</div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-purple/15 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-purple text-white flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground/60">Education Center</div>
                <div className="text-xl font-black text-foreground">Publisher Suite</div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-purple/15 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-secondary text-purple flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground/60">Affiliation</div>
                <div className="text-sm font-bold text-foreground truncate max-w-[180px]">
                  {profile?.hospitalAffiliation || 'Mulago Referral Hospital'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-purple/15 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'qa'
                  ? 'bg-purple text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-foreground/80 hover:bg-purple/10'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Patient Questions Queue</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('education')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'education'
                  ? 'bg-purple text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-foreground/80 hover:bg-purple/10'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Publish Education Resources</span>
            </button>

          </div>

          {/* Tab Views */}
          {activeTab === 'qa' && (
            <PatientQAModule userRole="SPECIALIST" />
          )}

          {activeTab === 'education' && (
            <EducationCenter userRole="SPECIALIST" currentUserId={currentUser?.id} />
          )}

          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-purple/15 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-purple text-white flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">
                    Inspect Patient Clinical Summary
                  </h2>
                  <p className="text-xs text-foreground/70">
                    Enter a patient ID or phone number to view their glycemic Time in Range, vitals history, and adherence report.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 max-w-lg">
                <input
                  type="text"
                  placeholder="Enter Patient ID (or leave blank for demo summary)"
                  value={reportPatientId}
                  onChange={(e) => setReportPatientId(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple"
                />
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-5 h-11 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span>Generate Report</span>
                </button>
              </div>

              {isReportModalOpen && (
                <HealthReportModal
                  isOpen={isReportModalOpen}
                  onClose={() => setIsReportModalOpen(false)}
                  patientId={reportPatientId.trim() || undefined}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
