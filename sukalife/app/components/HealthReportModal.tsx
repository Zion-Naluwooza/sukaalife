'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  X,
  Activity,
  Pill,
  Smile,
  ShieldCheck,
  Stethoscope,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api, HealthReportData } from '@/lib/api';

interface HealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  patientName?: string;
}

export default function HealthReportModal({
  isOpen,
  onClose,
  patientId,
}: HealthReportModalProps) {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [report, setReport] = useState<HealthReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key press & prevent background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.generateHealthReport({ patientId, range });
      setReport(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate health summary report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, range, patientId]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 print:p-0 print:bg-white print:fixed"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Fixed Floating Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] h-11 w-11 rounded-full bg-black/85 hover:bg-black text-white flex items-center justify-center shadow-2xl border border-white/25 transition-all print:hidden cursor-pointer hover:scale-105 active:scale-95"
        title="Close Report (Esc)"
        aria-label="Close Report"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-purple/20 overflow-hidden my-4 sm:my-8 print:border-none print:shadow-none print:my-0 print:w-full print:max-w-none">
        
        {/* Sticky Top Control Bar */}
        <div className="sticky top-0 z-30 p-4 sm:p-5 bg-purple text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">Clinical Health Summary Report</h2>
              <p className="text-xs text-white/80">Structured for clinician review and doctor consultations</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Range Toggle */}
            <div className="flex bg-black/25 p-1 rounded-xl text-xs font-bold">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    range === r ? 'bg-white text-purple shadow-xs' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / PDF</span>
            </button>

            {/* In-bar Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white text-purple text-xs font-black flex items-center gap-1 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 sm:p-10 space-y-8 bg-white dark:bg-zinc-900 text-foreground print:p-8 print:text-black">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-foreground/60 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple" />
              <span className="text-sm font-bold">Generating clinical health summary...</span>
            </div>
          ) : error || !report ? (
            <div className="p-6 rounded-2xl bg-red-50 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error || 'Unable to load report.'}</span>
            </div>
          ) : (
            <>
              {/* Report Header & Patient Info */}
              <div className="border-b-2 border-purple/15 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif text-2xl font-bold text-foreground">
                      Sukaa<span className="italic text-purple">life</span>
                    </span>
                    <span className="text-xs text-foreground/50">| Clinical Diabetes Management</span>
                  </div>
                  <h1 className="text-xl font-black text-foreground">
                    {report.reportTitle}
                  </h1>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    Generated: {new Date(report.generatedAt).toLocaleString()} • Period: Past{' '}
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </p>
                </div>

                {/* Patient Summary Box */}
                <div className="bg-secondary/20 p-4 rounded-2xl border border-purple/15 text-xs space-y-1 min-w-[240px]">
                  <div className="font-black text-foreground text-sm">
                    {report.patient.fullName}
                  </div>
                  <div>Phone: <span className="font-semibold">{report.patient.phone}</span></div>
                  <div>
                    Diagnosis: <span className="font-bold text-purple">{report.patient.diabetesType.replace('_', ' ')}</span>
                    {report.patient.diagnosisYear && ` (Since ${report.patient.diagnosisYear})`}
                  </div>
                  {report.patient.latestHba1c && (
                    <div>Baseline HbA1c: <span className="font-bold">{report.patient.latestHba1c}%</span></div>
                  )}
                  {report.patient.latestBP && (
                    <div>Baseline Blood Pressure: <span className="font-bold">{report.patient.latestBP} mmHg</span></div>
                  )}
                </div>
              </div>

              {/* Statistical Metrics: Time in Range & Glucose */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground/70 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple" />
                  <span>Glycemic Control & Time in Range (TIR)</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-[#DFD2F0]/50 border border-purple/20">
                    <div className="text-[11px] font-bold text-purple">Time in Range</div>
                    <div className="text-2xl font-black text-purple mt-1">
                      {report.stats.timeInRangePercent}%
                    </div>
                    <div className="text-[10px] text-foreground/60">70 - 140 mg/dL Target</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-secondary/20 border border-purple/15">
                    <div className="text-[11px] font-bold text-foreground/70">Average Glucose</div>
                    <div className="text-2xl font-black text-foreground mt-1">
                      {report.stats.avgGlucose || '--'} <span className="text-xs font-normal text-foreground/60">mg/dL</span>
                    </div>
                    <div className="text-[10px] text-foreground/60">{report.stats.totalReadings} Total Logs</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-secondary/20 border border-purple/15">
                    <div className="text-[11px] font-bold text-foreground/70">Min Glucose</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {report.stats.minGlucose || '--'} <span className="text-xs font-normal text-foreground/60">mg/dL</span>
                    </div>
                    <div className="text-[10px] text-foreground/60">Lowest Reading</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-secondary/20 border border-purple/15">
                    <div className="text-[11px] font-bold text-foreground/70">Max Glucose</div>
                    <div className="text-2xl font-black text-rose-700 mt-1">
                      {report.stats.maxGlucose || '--'} <span className="text-xs font-normal text-foreground/60">mg/dL</span>
                    </div>
                    <div className="text-[10px] text-foreground/60">Peak Reading</div>
                  </div>
                </div>

                {/* TIR Distribution Progress Bar */}
                {report.stats.totalReadings > 0 && (
                  <div className="p-4 rounded-2xl border border-purple/15 bg-secondary/10 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Glucose Breakdown Distribution</span>
                      <span>{report.stats.totalReadings} Readings</span>
                    </div>

                    <div className="h-4 rounded-full overflow-hidden flex bg-slate-200">
                      {report.stats.inRangeCount > 0 && (
                        <div
                          style={{ width: `${(report.stats.inRangeCount / report.stats.totalReadings) * 100}%` }}
                          className="bg-emerald-500"
                          title={`In Range: ${report.stats.inRangeCount}`}
                        />
                      )}
                      {report.stats.elevatedCount > 0 && (
                        <div
                          style={{ width: `${(report.stats.elevatedCount / report.stats.totalReadings) * 100}%` }}
                          className="bg-amber-400"
                          title={`Elevated: ${report.stats.elevatedCount}`}
                        />
                      )}
                      {report.stats.highCount > 0 && (
                        <div
                          style={{ width: `${(report.stats.highCount / report.stats.totalReadings) * 100}%` }}
                          className="bg-rose-500"
                          title={`High: ${report.stats.highCount}`}
                        />
                      )}
                      {report.stats.lowCount > 0 && (
                        <div
                          style={{ width: `${(report.stats.lowCount / report.stats.totalReadings) * 100}%` }}
                          className="bg-red-600"
                          title={`Low: ${report.stats.lowCount}`}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-[11px] pt-1 text-foreground/70">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span>In Range (70-140): {report.stats.inRangeCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span>Elevated (141-199): {report.stats.elevatedCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <span>High (≥200): {report.stats.highCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                        <span>Low (&lt;70): {report.stats.lowCount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Medication Schedules & Active Regimen */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground/70 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-purple" />
                  <span>Current Medication & Meal Schedules</span>
                </h3>

                {report.schedules.length === 0 ? (
                  <p className="text-xs text-foreground/60 italic">No scheduled reminders registered.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.schedules.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-purple/15 bg-secondary/15 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-foreground">{s.name}</span>
                        <span className="font-semibold text-purple">{s.time} ({s.type})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Symptoms & Feelings Trend */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground/70 flex items-center gap-2">
                  <Smile className="h-4 w-4 text-purple" />
                  <span>Recent Feelings & Symptom Logs</span>
                </h3>

                {report.moodSummary.recentMoods.length === 0 ? (
                  <p className="text-xs text-foreground/60 italic">No feelings logged during this period.</p>
                ) : (
                  <div className="space-y-2">
                    {report.moodSummary.recentMoods.slice(0, 5).map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-purple/15 bg-secondary/15 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-purple mr-2">[{m.mood}]</span>
                          <span className="italic text-foreground">"{m.feelingText || m.symptoms || 'Check-in'}"</span>
                        </div>
                        <span className="text-[10px] text-foreground/60 shrink-0">
                          {new Date(m.loggedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Consultation History */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground/70 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-purple" />
                  <span>Clinical Notes & Doctor Advice History</span>
                </h3>

                {report.consultations.length === 0 ? (
                  <p className="text-xs text-foreground/60 italic">No consultation records on file.</p>
                ) : (
                  <div className="space-y-3">
                    {report.consultations.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-purple/15 bg-secondary/15 text-xs space-y-1.5"
                      >
                        <div className="flex justify-between font-bold text-foreground">
                          <span>{c.doctorName || 'Attending Physician'} ({c.clinicName || 'Clinic'})</span>
                          <span className="text-foreground/60 font-normal">{new Date(c.visitDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-foreground/80 leading-relaxed">{c.doctorAdvice}</p>
                        {c.prescriptions && (
                          <div className="text-[11px] text-purple font-semibold">
                            Prescriptions: {c.prescriptions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Report Footer & Bottom Close Button */}
              <div className="pt-8 border-t border-purple/15 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-foreground/70">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center gap-1 text-purple font-bold">
                    <ShieldCheck className="h-4 w-4" /> Official Sukaalife Clinical Summary
                  </div>
                  <div>Report ID: SUKAA-REP-{report.patient.id.slice(0, 8).toUpperCase()}</div>
                </div>

                <div className="flex items-center gap-3 print:hidden">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-2xl bg-purple hover:bg-purple/90 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
