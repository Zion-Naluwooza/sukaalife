'use client';

import React, { useState } from 'react';
import {
  Target,
  Trophy,
  Plus,
  CheckCircle2,
  Trash2,
  Sparkles,
  Flame,
  Award,
  Star,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { HealthGoalItem, AchievementItem, api } from '@/lib/api';

interface GoalsManagerProps {
  goals: HealthGoalItem[];
  achievements: AchievementItem[];
  onRefresh: () => void;
  showToast: (msg: string, isError?: boolean) => void;
}

export default function GoalsManager({ goals, achievements, onRefresh, showToast }: GoalsManagerProps) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('7');
  const [unit, setUnit] = useState('times');
  const [category, setCategory] = useState<'GLUCOSE' | 'MEDICATION' | 'EXERCISE' | 'DIET' | 'GENERAL'>('GLUCOSE');

  const presets = [
    { title: 'Check Glucose 2x Daily', targetValue: 14, unit: 'checks', category: 'GLUCOSE' as const },
    { title: 'Take Morning & Evening Medicine', targetValue: 14, unit: 'doses', category: 'MEDICATION' as const },
    { title: 'Take 30-min Brisk Walk', targetValue: 4, unit: 'walks', category: 'EXERCISE' as const },
    { title: 'Low-Sugar Healthy Meals', targetValue: 7, unit: 'days', category: 'DIET' as const },
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

  const handleIncrement = async (goal: HealthGoalItem) => {
    setUpdatingId(goal.id);
    try {
      await api.updateGoalProgress(goal.id, { incrementBy: 1 });
      onRefresh();
      if (goal.currentProgress + 1 >= goal.targetValue) {
        showToast(`🎉 Congratulations! You completed: "${goal.title}"`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update goal progress.', true);
    } finally {
      setUpdatingId(null);
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
        return <Award className="w-5 h-5 text-teal-600 fill-teal-400" />;
      default:
        return <Star className="w-5 h-5 text-purple-600 fill-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Goals Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-700" /> Weekly Health Goals
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Stay consistent with weekly milestones</p>
          </div>

          <button
            onClick={() => setShowGoalModal(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Set Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">No weekly goals set yet.</p>
            <button
              onClick={() => setShowGoalModal(true)}
              className="text-xs font-black text-teal-800 hover:underline inline-flex items-center gap-1"
            >
              Choose a preset or create your first goal <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((g) => {
              const percent = Math.min(100, Math.round((g.currentProgress / g.targetValue) * 100));
              const isDone = g.isCompleted || g.currentProgress >= g.targetValue;

              return (
                <div
                  key={g.id}
                  className={`p-4 rounded-2xl border transition ${
                    isDone ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{g.title}</span>
                        {isDone && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Done
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-purple-900 uppercase">
                        {g.category} • {g.currentProgress} / {g.targetValue} {g.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isDone && (
                        <button
                          onClick={() => handleIncrement(g)}
                          disabled={updatingId === g.id}
                          className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          {updatingId === g.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '+1 Log'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                        title="Remove Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? 'bg-emerald-600' : 'bg-teal-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unlocked Achievements Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Achievements & Badges</h3>
        </div>

        {achievements.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Complete daily logs and goals to unlock milestone badges.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-3.5 bg-gradient-to-r from-amber-50/50 to-orange-50/40 border border-amber-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs"
              >
                <div className="w-10 h-10 rounded-2xl bg-white border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
                  {getBadgeIcon(ach.iconName)}
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">{ach.title}</span>
                  <span className="text-[11px] text-slate-600 leading-tight block">{ach.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-700" /> Set Weekly Health Goal
            </h3>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-slate-500 uppercase">Quick Presets</span>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 rounded-xl text-left text-[11px] font-bold text-slate-800 transition"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check glucose twice daily"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weekly Target</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="7"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="times / logs"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#DFD2F0]/40 border border-[#DFD2F0] font-black text-slate-900 rounded-2xl px-4 py-2.5 text-sm outline-none cursor-pointer"
                >
                  <option value="GLUCOSE">Blood Glucose</option>
                  <option value="MEDICATION">Medication</option>
                  <option value="EXERCISE">Exercise / Walking</option>
                  <option value="DIET">Diet & Nutrition</option>
                  <option value="GENERAL">General Wellness</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="w-1/2 py-3 border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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
