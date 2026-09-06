'use client';

import React, { useState } from 'react';
import {
  Smile,
  BatteryCharging,
  AlertTriangle,
  Plus,
  Clock,
  Loader2,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { MoodLogItem, api } from '@/lib/api';

interface MoodTrackerProps {
  moodLogs: MoodLogItem[];
  onRefresh: () => void;
  showToast: (msg: string, isError?: boolean) => void;
}

const MOOD_OPTIONS = [
  { value: 'VERY_GOOD', label: 'Very Good', emoji: '😄', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
  { value: 'GOOD', label: 'Good', emoji: '🙂', color: 'bg-teal-50 border-teal-300 text-teal-900' },
  { value: 'NEUTRAL', label: 'Okay / Neutral', emoji: '😐', color: 'bg-slate-50 border-slate-300 text-slate-800' },
  { value: 'TIRED', label: 'Tired / Low Energy', emoji: '🥱', color: 'bg-amber-50 border-amber-300 text-amber-900' },
  { value: 'STRESSED', label: 'Stressed / Anxious', emoji: '😰', color: 'bg-purple-50 border-purple-300 text-purple-900' },
  { value: 'DIZZY', label: 'Dizzy / Shaky', emoji: '😵', color: 'bg-orange-50 border-orange-300 text-orange-900' },
  { value: 'UNWELL', label: 'Unwell / Sick', emoji: '🤒', color: 'bg-rose-50 border-rose-300 text-rose-900' },
];

const COMMON_SYMPTOMS = [
  'Shakiness',
  'Excessive Sweating',
  'Extreme Thirst',
  'Frequent Urination',
  'Headache',
  'Brain Fog',
  'Fatigue',
  'Blurred Vision',
  'Dry Mouth',
];

export default function MoodTracker({ moodLogs, onRefresh, showToast }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState('GOOD');
  const [energyLevel, setEnergyLevel] = useState(4);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createMoodLog({
        mood: selectedMood,
        energyLevel,
        symptoms: selectedSymptoms,
        notes: notes.trim() || undefined,
      });

      showToast('Daily mood & feeling check-in recorded!');
      setSelectedSymptoms([]);
      setNotes('');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save mood check-in.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMoodLog(id);
      showToast('Mood check-in removed.');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete mood log.', true);
    }
  };

  const getMoodDisplay = (moodVal: string) => {
    return MOOD_OPTIONS.find((m) => m.value === moodVal) || {
      label: moodVal,
      emoji: '🙂',
      color: 'bg-slate-50 border-slate-200 text-slate-800',
    };
  };

  const formatLogDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? 'Recent'
      : d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Check-In Form (Left 2 cols) */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Smile className="w-4 h-4 text-teal-700" /> Daily Mood & Feeling Check-In
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Track how your emotions, energy, and symptoms correlate with your glucose</p>
        </div>

        <form onSubmit={handleSaveMood} className="space-y-5">
          {/* Mood Selector Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">How are you feeling right now?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((opt) => {
                const isSelected = selectedMood === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedMood(opt.value)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/30 font-black text-teal-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-bold'
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy Level 1-5 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-teal-700" /> Energy Level
              </label>
              <span className="text-xs font-black text-teal-900 bg-teal-100 px-2 py-0.5 rounded-lg">
                {energyLevel} / 5
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergyLevel(lvl)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-black transition cursor-pointer ${
                    energyLevel >= lvl
                      ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  ⚡ {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Symptom Tags Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">Any notable physical symptoms?</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SYMPTOMS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-100 border-purple-300 text-purple-950 font-black shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sym} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qualitative Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">Personal Reflection / Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Felt a bit dizzy after lunch; rested for 20 minutes."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-3 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Record Check-In
          </button>
        </form>
      </div>

      {/* Mood History List (Right 1 col) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col">
        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-teal-700" /> Recent Check-Ins
        </h3>

        {moodLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">No mood check-ins recorded yet.</p>
        ) : (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {moodLogs.map((log) => {
              const info = getMoodDisplay(log.mood);
              return (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 group hover:border-teal-200 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{info.emoji}</span>
                      <span className="text-xs font-black text-slate-900">{info.label}</span>
                      {log.energyLevel && (
                        <span className="text-[10px] font-black text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded-md">
                          ⚡ {log.energyLevel}/5
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="opacity-40 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-red-600"
                      title="Delete Check-In"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {log.symptoms && (
                    <div className="flex flex-wrap gap-1">
                      {log.symptoms.split(',').map((s, i) => (
                        <span
                          key={i}
                          className="bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {log.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-100">
                      &quot;{log.notes}&quot;
                    </p>
                  )}

                  <span className="text-[10px] text-slate-400 block">{formatLogDate(log.loggedAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
