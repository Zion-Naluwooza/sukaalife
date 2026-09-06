'use client';

import React, { useState, useEffect } from 'react';
import {
  Smile,
  Heart,
  Zap,
  Activity,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  HeartPulse
} from 'lucide-react';
import { api, MoodLogItem } from '@/lib/api';
import VoiceDictationButton from './VoiceDictationButton';

interface TextFeelingModuleProps {
  patientId?: string;
  onCheckInComplete?: () => void;
}

const SYMPTOM_OPTIONS = [
  'Fatigue / Tiredness',
  'Dizziness / Lightheadedness',
  'Excessive Thirst',
  'Frequent Urination',
  'Shakiness / Tremors',
  'Headache',
  'Blurred Vision',
  'Sweating / Chills',
  'Numbness / Tingling in Feet',
  'Stomach Discomfort'
];

const MOOD_OPTIONS: Array<{
  key: MoodLogItem['mood'];
  label: string;
  emoji: string;
  color: string;
}> = [
  { key: 'VERY_GOOD', label: 'Energized & Great', emoji: '🌟', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300' },
  { key: 'GOOD', label: 'Feeling Good', emoji: '😊', color: 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300' },
  { key: 'NEUTRAL', label: 'Balanced / Okay', emoji: '😐', color: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300' },
  { key: 'TIRED', label: 'Fatigued & Sluggish', emoji: '🥱', color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300' },
  { key: 'STRESSED', label: 'Stressed / Anxious', emoji: '😰', color: 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300' },
  { key: 'DIZZY', label: 'Dizzy / Low Sugar', emoji: '😵', color: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300' },
  { key: 'UNWELL', label: 'Unwell / High Sugar', emoji: '🤒', color: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300' }
];

export default function TextFeelingModule({ patientId, onCheckInComplete }: TextFeelingModuleProps) {
  const [moodLogs, setMoodLogs] = useState<MoodLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [feelingText, setFeelingText] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodLogItem['mood']>('GOOD');
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getMoodLogs(patientId);
      setMoodLogs(res.moodLogs || []);
    } catch (err: any) {
      console.error('Failed to fetch mood logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [patientId]);

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feelingText.trim()) {
      setError('Please write a short description of how you are feeling.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.createMoodLog({
        feelingText: feelingText.trim(),
        mood: selectedMood,
        energyLevel,
        symptoms: selectedSymptoms.join(', '),
        notes: notes.trim() || undefined,
        patientId
      });

      setFeelingText('');
      setNotes('');
      setSelectedSymptoms([]);
      setEnergyLevel(4);
      setSelectedMood('GOOD');

      await fetchLogs();
      if (onCheckInComplete) onCheckInComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to record feeling check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await api.deleteMoodLog(id);
      setMoodLogs((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error('Failed to delete mood log:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Check-In Creation Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold">
              <HeartPulse className="h-3 w-3" /> Daily Qualitative Journal
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              How Are You Feeling Today?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Describe your physical sensations, energy, or glucose reactions in your own words.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheckInSubmit} className="space-y-5">
          {/* Primary Open-Ended Text Box with Voice Dictation */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Describe how you feel right now (Open Reflection) *
              </label>
              <VoiceDictationButton
                compact
                buttonLabel="Voice Dictate"
                placeholderContext="Speak in Luganda, Swahili, or English to record feelings"
                onTranscribe={(text) => setFeelingText((prev) => (prev ? `${prev} ${text}` : text))}
              />
            </div>
            <textarea
              rows={3}
              placeholder="e.g. Woke up feeling a bit shaky before breakfast, but perked up after drinking water and taking morning insulin... (or use the voice button above to dictate in Luganda/English)"
              value={feelingText}
              onChange={(e) => setFeelingText(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-purple-200 dark:border-zinc-700 bg-purple-50/20 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/15 resize-none transition-all placeholder:text-zinc-400"
              required
            />
          </div>

          {/* Quick Symptoms Multi-Select */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              Any Physical Symptoms? (Tap to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          

        

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Feelings Check-In...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Record Feelings & Mood Entry</span>
              </>
            )}
          </button>
        </form>
      </div>

    
    </div>
  );
}
