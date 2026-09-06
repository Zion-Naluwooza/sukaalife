'use client';

import React from 'react';
import { Flame, Activity, TrendingUp, CheckCircle2, HeartPulse, Smile, Clock } from 'lucide-react';
import { WeeklySummaryData } from '@/lib/api';

interface WeeklySummaryCardProps {
  summary: WeeklySummaryData | null;
  loading?: boolean;
}

export default function WeeklySummaryCard({ summary, loading }: WeeklySummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-16 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  const streak = summary?.streakDays || 0;
  const totalLogs = summary?.totalLogsThisWeek || 0;
  const breakdown = summary?.breakdown || {
    glucoseLogs: 0,
    bpAndHbA1cLogs: 0,
    medicationReminders: 0,
    moodCheckIns: 0,
  };
  const daily = summary?.dailyActivity || [];

  // Find max daily count for relative bar height
  const maxCount = Math.max(...daily.map((d) => d.total), 4);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
      {/* Header with Streak */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-700" /> Weekly Activity Summary
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Your diabetes routine & adherence for this week</p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl shadow-xs">
          <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-bounce" />
          <span className="text-xs font-black text-amber-900">
            {streak} {streak === 1 ? 'Day' : 'Days'} Streak
          </span>
        </div>
      </div>

      {/* Metric Breakdown Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-teal-50/70 border border-teal-200/70 rounded-2xl text-center space-y-1">
          <span className="text-lg font-black text-teal-900 block">{breakdown.glucoseLogs}</span>
          <span className="text-[11px] font-bold text-teal-800 flex items-center justify-center gap-1">
            <HeartPulse className="w-3 h-3 text-teal-700" /> Glucose Logs
          </span>
        </div>

        <div className="p-3 bg-[#DFD2F0]/40 border border-[#DFD2F0] rounded-2xl text-center space-y-1">
          <span className="text-lg font-black text-purple-950 block">{breakdown.moodCheckIns}</span>
          <span className="text-[11px] font-bold text-purple-900 flex items-center justify-center gap-1">
            <Smile className="w-3 h-3 text-purple-800" /> Mood Checks
          </span>
        </div>

        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl text-center space-y-1">
          <span className="text-lg font-black text-cyan-950 block">{breakdown.medicationReminders}</span>
          <span className="text-[11px] font-bold text-cyan-800 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-cyan-700" /> Reminders
          </span>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
          <span className="text-lg font-black text-emerald-950 block">{totalLogs}</span>
          <span className="text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-700" /> Total Logs
          </span>
        </div>
      </div>

      {/* 7-Day Visual Activity Graph */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
          Daily Log Frequency (Mon - Sun)
        </span>
        <div className="grid grid-cols-7 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 items-end min-h-[110px]">
          {daily.map((item, idx) => {
            const heightPercent = item.total === 0 ? 8 : Math.max(18, Math.round((item.total / maxCount) * 100));
            const isToday = new Date().toISOString().startsWith(item.date);

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-black text-slate-700">{item.total > 0 ? item.total : '-'}</span>
                <div className="w-full max-w-[28px] bg-slate-200 rounded-lg overflow-hidden h-14 flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-500 ${
                      item.total > 0
                        ? isToday
                          ? 'bg-teal-700 shadow-sm'
                          : 'bg-teal-500'
                        : 'bg-slate-300'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-black ${
                    isToday ? 'text-teal-900 bg-teal-100 px-1.5 py-0.5 rounded-md font-extrabold' : 'text-slate-500'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
