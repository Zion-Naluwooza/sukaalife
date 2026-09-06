'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Pill,
  Utensils,
  Target,
  Loader2,
  CalendarCheck,
  ShieldCheck,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import { api, DailyChecklistData, ChecklistTaskItem } from '@/lib/api';

interface DailyChecklistProps {
  patientId?: string;
  onTaskToggled?: () => void;
  onOpenGoals?: () => void;
  onOpenVitals?: () => void;
}

export default function DailyChecklist({
  patientId,
  onTaskToggled,
  onOpenGoals,
  onOpenVitals
}: DailyChecklistProps) {
  const [data, setData] = useState<DailyChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Verification Confirmation Modal State
  const [confirmingTask, setConfirmingTask] = useState<ChecklistTaskItem | null>(null);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const res = await api.getDailyChecklist(patientId);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load daily checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, [patientId]);

  const executeToggle = async (task: ChecklistTaskItem) => {
    if (!data) return;

    // Optimistic UI update
    const prevTasks = [...data.tasks];
    const updatedTasks = prevTasks.map((t) =>
      t.key === task.key ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const newCompletedCount = updatedTasks.filter((t) => t.isCompleted).length;
    const newProgress = Math.round((newCompletedCount / updatedTasks.length) * 100);

    setData({
      ...data,
      tasks: updatedTasks,
      completedCount: newCompletedCount,
      progressPercent: newProgress
    });

    setConfirmingTask(null);

    try {
      setTogglingKey(task.key);
      await api.toggleDailyTask({
        taskKey: task.key,
        taskTitle: task.title,
        taskType: task.type,
        patientId
      });
      if (onTaskToggled) onTaskToggled();
    } catch (err: any) {
      console.error('Toggle error, rolling back:', err);
      setData({ ...data, tasks: prevTasks });
    } finally {
      setTogglingKey(null);
    }
  };

  const handleTaskClick = (task: ChecklistTaskItem) => {
    // If already completed, toggle directly or prompt to reset
    if (task.isCompleted) {
      executeToggle(task);
      return;
    }

    // Require explicit verification confirmation dialog to prevent blind bulk ticking
    setConfirmingTask(task);
  };

  const getTaskIcon = (type: string, category?: string) => {
    if (type === 'SCHEDULE') {
      return category === 'medication' ? (
        <Pill className="h-4 w-4 text-purple" />
      ) : (
        <Utensils className="h-4 w-4 text-emerald-700" />
      );
    }
    if (type === 'GOAL') {
      return <Target className="h-4 w-4 text-purple" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-amber-700" />;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-purple/15 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-purple/10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-purple text-white flex items-center justify-center shadow-md">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DFD2F0] text-purple text-[11px] font-black">
              <ShieldCheck className="h-3 w-3" /> Verified Routine Compliance
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              Today's Care Checklist
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70">
              Verified tracking for medication reminders, daily goals & fasting routines.
            </p>
          </div>
        </div>

        {/* Progress Pill / Circular Stats */}
        {data && (
          <div className="flex items-center gap-3 bg-secondary/20 p-3 rounded-2xl border border-purple/15 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-xs font-black text-foreground">
                {data.completedCount} of {data.totalCount} Complete
              </div>
              <div className="text-[11px] font-bold text-purple">
                {data.progressPercent}% Daily Score
              </div>
            </div>
            <div className="relative h-10 w-10 flex items-center justify-center">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple transition-all duration-500 ease-out"
                  strokeDasharray={`${data.progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-foreground">
                {data.progressPercent}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Checklist Task Items */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-foreground/60 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-purple" />
          <span className="text-xs font-bold">Compiling verified daily checklist...</span>
        </div>
      ) : !data || data.tasks.length === 0 ? (
        <div className="py-12 text-center text-foreground/60 border-2 border-dashed border-purple/20 rounded-2xl">
          <CalendarCheck className="h-10 w-10 mx-auto text-purple/40 mb-2" />
          <p className="text-sm font-bold text-foreground">All caught up for today!</p>
          <p className="text-xs text-foreground/60 mt-1">Add medication reminders or health goals to generate daily routine items.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.tasks.map((task) => {
            const isToggling = togglingKey === task.key;

            return (
              <div
                key={task.key}
                onClick={() => handleTaskClick(task)}
                className={`group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none ${
                  task.isCompleted
                    ? 'bg-emerald-50/50 border-emerald-300 opacity-85'
                    : 'bg-secondary/15 border-purple/15 hover:border-purple/40 hover:bg-secondary/25 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Interactive Check Box */}
                  <div className="shrink-0 transition-transform active:scale-90">
                    {isToggling ? (
                      <Loader2 className="h-5 w-5 animate-spin text-purple" />
                    ) : task.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-700 fill-emerald-100" />
                    ) : (
                      <Circle className="h-5 w-5 text-purple/40 group-hover:text-purple" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold truncate transition-colors ${
                          task.isCompleted
                            ? 'line-through text-foreground/50 font-normal'
                            : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/60 mt-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        {getTaskIcon(task.type, task.category)}
                        <span className="capitalize">{task.category.toLowerCase()}</span>
                      </span>
                      <span>•</span>
                      <span className="font-bold text-foreground/80">
                        {task.timeOrFreq}
                      </span>
                      {task.isCompleted && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.2 rounded-md">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="shrink-0 pl-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      task.type === 'SCHEDULE'
                        ? 'bg-[#DFD2F0] text-purple'
                        : task.type === 'GOAL'
                        ? 'bg-purple text-white'
                        : 'bg-secondary text-purple'
                    }`}
                  >
                    {task.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VERIFICATION CONFIRMATION MODAL (PREVENTS BLIND TICKING) */}
      {confirmingTask && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmingTask(null);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-purple/20">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-[#DFD2F0] text-purple flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-base">
                    Routine Task Confirmation
                  </h3>
                  <p className="text-xs text-foreground/60">
                    Verify compliance before marking complete
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmingTask(null)}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-foreground/60 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/20 border border-purple/15 space-y-2">
              <span className="text-xs font-black text-foreground block">
                {confirmingTask.title}
              </span>
              <div className="flex items-center gap-2 text-xs text-foreground/70">
                <Clock className="h-3.5 w-3.5 text-purple" />
                <span>Scheduled for: <strong>{confirmingTask.timeOrFreq}</strong></span>
              </div>
              <p className="text-xs text-foreground/80 pt-1">
                {confirmingTask.type === 'SCHEDULE'
                  ? 'Confirm that you have taken your medication or consumed your prescribed meal for this scheduled time.'
                  : 'Confirm that you have completed this wellness activity as planned.'}
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmingTask(null)}
                className="w-1/3 py-3 border border-purple/20 text-foreground rounded-2xl font-bold text-xs hover:bg-purple/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeToggle(confirmingTask)}
                className="w-2/3 py-3 bg-purple hover:bg-purple/90 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm & Mark Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
