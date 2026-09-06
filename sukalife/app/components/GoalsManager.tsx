'use client';

import React, { useState } from 'react';
import {
  Target,
  Trophy,
  Plus,
  CheckCircle2,
  Trash2,
  Flame,
  Award,
  Star,
  Loader2,
  X,
  MessageSquareQuote,
  Smile,
  Zap,
  Dumbbell
} from 'lucide-react';
import { HealthGoalItem, AchievementItem, api } from '@/lib/api';

interface GoalsManagerProps {
  goals: HealthGoalItem[];
  achievements: AchievementItem[];
  onRefresh: () => void;
  showToast: (msg: string, isError?: boolean) => void;
  patientId?: string;
}

export default function GoalsManager({ goals, achievements, onRefresh, showToast }: GoalsManagerProps) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reflection Check-in Modal State
  const [selectedGoalForReflection, setSelectedGoalForReflection] = useState<HealthGoalItem | null>(null);
  const [reflectionNote, setReflectionNote] = useState('');
  const [effortLevel, setEffortLevel] = useState<'EASY' | 'NORMAL' | 'CHALLENGING'>('NORMAL');
  const [submittingCheckin, setSubmittingCheckin] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('7');
  const [unit, setUnit] = useState('times');
  const [category, setCategory] = useState<'GLUCOSE' | 'MEDICATION' | 'EXERCISE' | 'DIET' | 'GENERAL'>('GLUCOSE');

  const todayDate = new Date().toISOString().split('T')[0];

  const presets = [
    { title: 'Check Glucose 2x Daily', targetValue: 14, unit: 'checks', category: 'GLUCOSE' as const },
    { title: 'Take Morning & Evening Medicine', targetValue: 14, unit: 'doses', category: 'MEDICATION' as const },
    { title: 'Take 30-min Brisk Walk / Jogging', targetValue: 4, unit: 'walks', category: 'EXERCISE' as const },
    { title: 'Low-Sugar Traditional Meals', targetValue: 7, unit: 'days', category: 'DIET' as const },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setTargetValue(String(p.targetValue));
    setUnit(p.unit);
    setCategory(p.category);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetValue) return;

    setLoading(true);
    try {
      await api.createGoal({
        title,
        targetValue: parseInt(targetValue, 10),
        unit,
        category,
        frequencyPerWeek: parseInt(targetValue, 10)
      });

      showToast('Weekly health goal added successfully!');
      setTitle('');
      setTargetValue('7');
      setShowGoalModal(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to create goal.', true);
    } finally {
      setLoading(false);
    }
  };

  // Check if a goal has already been logged today
  const hasLoggedToday = (goal: HealthGoalItem): boolean => {
    if (!goal.logs || goal.logs.length === 0) return false;
    return goal.logs.some((l) => l.date === todayDate);
  };

  const openReflectionModal = (goal: HealthGoalItem) => {
    if (hasLoggedToday(goal)) {
      showToast('You have already logged progress for this goal today. Come back tomorrow!', true);
      return;
    }
    setSelectedGoalForReflection(goal);
    setReflectionNote('');
    setEffortLevel('NORMAL');
  };

  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForReflection) return;

    try {
      setSubmittingCheckin(true);
      await api.updateGoalProgress(selectedGoalForReflection.id, {
        incrementBy: 1,
        reflectionNote: reflectionNote.trim() || undefined,
        effortLevel
      });
      showToast(`Logged today's check-in for "${selectedGoalForReflection.title}"!`);
      setSelectedGoalForReflection(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to record goal progress.', true);
    } finally {
      setSubmittingCheckin(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGoal(id);
      showToast('Goal removed.');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete goal.', true);
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'trophy':
        return <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-rose-500 fill-rose-400" />;
      case 'award':
        return <Award className="w-5 h-5 text-purple fill-purple/30" />;
      default:
        return <Star className="w-5 h-5 text-purple fill-purple/40" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Weekly Goals Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-purple/15 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple/10 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-purple" />
              <span>Weekly Health Goals</span>
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70">
              Track custom weekly targets with daily reflections and verified habit milestones.
            </p>
          </div>

          <button
            onClick={() => setShowGoalModal(true)}
            className="px-4 py-2.5 bg-purple hover:bg-purple/90 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Weekly Goal</span>
          </button>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-10 space-y-3 bg-purple/5 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-purple/20">
            <Target className="w-10 h-10 text-purple/40 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">No active weekly health goals</p>
              <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                Set goals like &quot;Jog 3 days a week&quot; or &quot;Log fasting glucose 7 days&quot; to build consistency.
              </p>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="text-xs font-black text-purple hover:underline"
            >
              + Create your first goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const currentProgress = g.currentProgress || 0;
              const percent = Math.min(100, Math.round((currentProgress / (g.targetValue || 1)) * 100));
              const isDone = g.isCompleted || currentProgress >= g.targetValue;
              const isLoggedToday = hasLoggedToday(g);
              const todayLog = g.logs?.find((l) => l.date === todayDate);

              return (
                <div
                  key={g.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    g.isCompleted
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-zinc-800/60 border-purple/15 hover:border-purple/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-foreground">{g.title}</span>
                        {g.isCompleted ? (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Goal Completed
                          </span>
                        ) : isLoggedToday ? (
                          <span className="bg-[#DFD2F0] text-purple text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-purple" /> Logged Today
                          </span>
                        ) : null}
                      </div>

                      <span className="text-[11px] font-bold text-foreground/60 uppercase mt-0.5 block">
                        #{g.category} • Progress: {g.currentProgress} of {g.targetValue} {g.unit} this week
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isDone && (
                        isLoggedToday ? (
                          <div className="px-3.5 py-2 bg-slate-200/80 dark:bg-zinc-700 text-foreground/60 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed" title="Next check-in available tomorrow">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Logged for Today</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openReflectionModal(g)}
                            className="px-4 py-2 bg-purple hover:bg-purple/90 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Check-in Today (+1)</span>
                          </button>
                        )
                      )}

                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1.5 text-foreground/40 hover:text-red-600 transition cursor-pointer"
                        title="Remove Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-foreground/70">
                      <span>{percent}% Completed</span>
                      <span>{g.targetValue - currentProgress > 0 ? `${g.targetValue - currentProgress} remaining this week` : 'Target Reached!'}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDone ? 'bg-emerald-600' : 'bg-purple'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Today's Reflection Snippet / Recent History */}
                  {todayLog ? (
                    <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-purple/15 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-black text-purple">
                        <span className="flex items-center gap-1">
                          <MessageSquareQuote className="h-3.5 w-3.5" /> Today&apos;s Reflection Note:
                        </span>
                        <span className="text-foreground/50 text-[10px]">Effort: {todayLog.effortLevel || 'Normal'}</span>
                      </div>
                      <p className="text-foreground/80 italic text-xs">
                        &quot;{todayLog.reflectionNote || 'Milestone achieved.'}&quot;
                      </p>
                    </div>
                  ) : g.logs && g.logs.length > 0 ? (
                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-purple/10 text-xs space-y-1">
                      <div className="text-[10px] font-bold text-foreground/60">
                        Latest check-in ({g.logs[0].date}):
                      </div>
                      <p className="text-foreground/75 italic text-xs line-clamp-1">
                        &quot;{g.logs[0].reflectionNote}&quot;
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unlocked Achievements Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-purple/15 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Achievements & Milestone Badges</h3>
        </div>

        {achievements.length === 0 ? (
          <p className="text-xs text-foreground/60 italic">Complete daily logs and goals to unlock milestone badges.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-4 bg-[#DFD2F0]/40 border border-purple/20 rounded-2xl flex items-center gap-3.5 shadow-2xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-800 border border-purple/20 flex items-center justify-center shrink-0 shadow-xs">
                  {getBadgeIcon(ach.iconName)}
                </div>
                <div>
                  <span className="text-xs font-black text-foreground block">{ach.title}</span>
                  <span className="text-[11px] text-foreground/70 leading-tight block">{ach.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: DAILY GOAL REFLECTION PROMPT */}
      {selectedGoalForReflection && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedGoalForReflection(null);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-purple/20">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#DFD2F0] text-purple px-2.5 py-0.5 rounded-full inline-block">
                  Daily Habit Check-in
                </span>
                <h3 className="font-black text-foreground text-lg">
                  {selectedGoalForReflection.title}
                </h3>
                <p className="text-xs text-foreground/70">
                  Log today&apos;s activity ({todayDate}). Check-in is limited to once per day.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGoalForReflection(null)}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-foreground/60 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCheckin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-foreground uppercase mb-1.5">
                  How did you achieve this goal today? *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Jogged 25 minutes around the compound, felt energetic, and drank 2 glasses of water..."
                  value={reflectionNote}
                  onChange={(e) => setReflectionNote(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-foreground uppercase mb-1.5">
                  How was your effort / energy level?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEffortLevel('EASY')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      effortLevel === 'EASY'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800 text-foreground/70 border-purple/15'
                    }`}
                  >
                    <Smile className="h-4 w-4 text-emerald-600" />
                    <span>Easy / Great</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEffortLevel('NORMAL')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      effortLevel === 'NORMAL'
                        ? 'bg-[#DFD2F0] text-purple border-purple shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800 text-foreground/70 border-purple/15'
                    }`}
                  >
                    <Zap className="h-4 w-4 text-purple" />
                    <span>Normal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEffortLevel('CHALLENGING')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      effortLevel === 'CHALLENGING'
                        ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800 text-foreground/70 border-purple/15'
                    }`}
                  >
                    <Dumbbell className="h-4 w-4 text-amber-600" />
                    <span>Challenging</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForReflection(null)}
                  className="w-1/3 py-3 border border-purple/20 text-foreground rounded-2xl font-bold text-xs hover:bg-purple/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCheckin}
                  className="w-2/3 py-3 bg-purple hover:bg-purple/90 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingCheckin ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Today&apos;s Check-in (+1)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE GOAL MODAL */}
      {showGoalModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGoalModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-purple/20">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-foreground text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-purple" /> Set Weekly Health Goal
              </h3>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-foreground/60 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-foreground/60 uppercase">Quick Presets</span>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2.5 rounded-xl border border-purple/15 bg-secondary/15 hover:bg-secondary/30 text-left text-xs font-bold text-foreground transition cursor-pointer"
                  >
                    <span className="block truncate">{p.title}</span>
                    <span className="text-[10px] text-purple font-black block mt-0.5">
                      {p.targetValue} {p.unit}/wk
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30-min Jogging or Low-sugar diet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Target Days / Times *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. times, walks, days"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground cursor-pointer"
                >
                  <option value="GLUCOSE">Blood Glucose</option>
                  <option value="MEDICATION">Medication & Insulin</option>
                  <option value="EXERCISE">Exercise & Walking</option>
                  <option value="DIET">Diet & Nutrition</option>
                  <option value="GENERAL">General Wellness</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="w-1/2 py-3 border border-purple/20 text-foreground rounded-2xl font-bold text-xs hover:bg-purple/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-3 bg-purple hover:bg-purple/90 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
