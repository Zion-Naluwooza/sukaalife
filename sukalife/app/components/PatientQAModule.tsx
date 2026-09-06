'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  AlertTriangle,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Loader2,
  HelpCircle,
  Plus
} from 'lucide-react';
import { api, PatientQuestionItem } from '@/lib/api';

interface PatientQAModuleProps {
  userRole?: 'PATIENT' | 'SPECIALIST' | 'CAREGIVER' | string;
  patientId?: string;
}

const QA_CATEGORIES = [
  'GENERAL',
  'MEDICATION_DOSAGE',
  'DIET_NUTRITION',
  'SYMPTOMS_FEELINGS',
  'FOOT_CARE',
  'PREGNANCY_DIABETES',
  'EXERCISE_SPORTS'
];

export default function PatientQAModule({ userRole = 'PATIENT', patientId }: PatientQAModuleProps) {
  const [questions, setQuestions] = useState<PatientQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Patient Ask Form
  const [showAskForm, setShowAskForm] = useState(false);
  const [askTitle, setAskTitle] = useState('');
  const [askText, setAskText] = useState('');
  const [askCategory, setAskCategory] = useState('GENERAL');
  const [askUrgency, setAskUrgency] = useState<'LOW' | 'NORMAL' | 'URGENT' | 'EMERGENCY'>('NORMAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  // Specialist Answer Form
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  const isSpecialist = userRole === 'SPECIALIST';

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.getQuestions();
      setQuestions(res.questions || []);
      if (res.questions?.length && !expandedId) {
        setExpandedId(res.questions[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load Q&A:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAskError(null);

    if (!askTitle.trim() || !askText.trim()) {
      setAskError('Please provide both a subject and question description.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.askQuestion({
        title: askTitle.trim(),
        questionText: askText.trim(),
        category: askCategory,
        urgency: askUrgency,
        patientId
      });

      setAskTitle('');
      setAskText('');
      setAskUrgency('NORMAL');
      setShowAskForm(false);
      await fetchQuestions();
    } catch (err: any) {
      setAskError(err.message || 'Failed to submit question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    if (!answerDraft.trim()) return;

    try {
      setIsAnswering(true);
      await api.answerQuestion(questionId, { answerText: answerDraft.trim() });
      setAnswerDraft('');
      setAnsweringQuestionId(null);
      await fetchQuestions();
    } catch (err: any) {
      console.error('Failed to answer question:', err);
    } finally {
      setIsAnswering(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'URGENT':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-[#DFD2F0] text-purple border-purple/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-purple/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-purple text-white flex items-center justify-center shadow-md">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DFD2F0] text-purple text-[11px] font-black">
              <Stethoscope className="h-3 w-3" /> Specialist Clinical Q&A
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {isSpecialist ? 'Specialist Clinical Triage Queue' : 'Ask a Diabetes Specialist'}
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70">
              {isSpecialist
                ? 'Review and answer prioritized patient inquiries regarding diabetes management.'
                : 'Directly ask verified endocrinologists and certified diabetes educators.'}
            </p>
          </div>
        </div>

        {!isSpecialist && (
          <button
            type="button"
            onClick={() => setShowAskForm(!showAskForm)}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            {showAskForm ? 'Close Form' : <><Plus className="h-4 w-4" /> Ask New Question</>}
          </button>
        )}
      </div>

      {/* Patient Ask Form */}
      {showAskForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-purple/20 shadow-xl animate-in fade-in duration-200">
          <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple" />
            <span>Submit a Question to Specialist Panel</span>
          </h3>

          {askError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs">
              {askError}
            </div>
          )}

          <form onSubmit={handleAskSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Question Subject / Summary *
              </label>
              <input
                type="text"
                placeholder="e.g. Shakiness after taking morning 10 units Lantus insulin..."
                value={askTitle}
                onChange={(e) => setAskTitle(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Category
                </label>
                <select
                  value={askCategory}
                  onChange={(e) => setAskCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground cursor-pointer"
                >
                  {QA_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Urgency Level
                </label>
                <select
                  value={askUrgency}
                  onChange={(e: any) => setAskUrgency(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground cursor-pointer"
                >
                  <option value="LOW">Low (General Advice)</option>
                  <option value="NORMAL">Normal (Within 24 Hours)</option>
                  <option value="URGENT">Urgent (Prioritized Review)</option>
                  <option value="EMERGENCY">Emergency (Requires Immediate Help)</option>
                </select>
              </div>
            </div>

            {/* Emergency Warning Banner */}
            {askUrgency === 'EMERGENCY' && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <div className="font-bold mb-0.5">Emergency Medical Caution:</div>
                  <p>
                    If you are experiencing severe hypoglycemia (confusion, seizures) or diabetic ketoacidosis (vomiting, extreme dehydration), please proceed immediately to the nearest hospital casualty (e.g. Mulago Referral Hospital) or contact emergency services (+256 911 / ambulance).
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Detailed Question Description *
              </label>
              <textarea
                rows={4}
                placeholder="Include your recent blood glucose numbers, symptoms, when you last took meals or insulin..."
                value={askText}
                onChange={(e) => setAskText(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAskForm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-foreground/70 hover:bg-purple/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-black flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Send to Specialist Queue</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions Queue List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-foreground/60 gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-purple" />
          <span className="text-xs font-bold">Loading clinical inquiries...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center text-foreground/60 bg-white dark:bg-zinc-900 rounded-3xl border border-purple/15 p-8">
          <MessageSquare className="h-12 w-12 mx-auto text-purple/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No questions in queue</h3>
          <p className="text-xs text-foreground/60 mt-1 max-w-sm mx-auto">
            {isSpecialist
              ? 'All patient questions have been resolved.'
              : 'You have not submitted any questions yet. Click "Ask New Question" above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const isExpanded = expandedId === q.id;
            const hasAnswers = q.answers && q.answers.length > 0;

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-purple/15 shadow-sm overflow-hidden transition-all"
              >
                {/* Question Row Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-purple/5 flex items-start justify-between gap-4 select-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getUrgencyBadge(
                          q.urgency
                        )}`}
                      >
                        {q.urgency}
                      </span>
                      <span className="text-[10px] font-bold text-foreground/70 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                        {q.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          hasAnswers
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {hasAnswers ? '✓ Answered' : '⏳ Pending Review'}
                      </span>
                      <span className="text-[11px] text-foreground/50 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-foreground">
                      {q.title}
                    </h3>

                    {q.patient && (
                      <p className="text-xs text-foreground/70 font-medium">
                        Asked by: <span className="font-bold text-foreground">{q.patient.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-foreground/60">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-purple/10 space-y-4">
                    <div className="p-4 rounded-2xl bg-secondary/15 text-xs sm:text-sm text-foreground leading-relaxed">
                      {q.questionText}
                    </div>

                    {/* Specialist Answers List */}
                    {hasAnswers && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Stethoscope className="h-4 w-4 text-purple" />
                          <span>Specialist Responses ({q.answers?.length})</span>
                        </h4>

                        {q.answers?.map((ans) => (
                          <div
                            key={ans.id}
                            className="p-4 rounded-2xl bg-[#DFD2F0]/40 border border-purple/20 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-purple text-white flex items-center justify-center font-bold text-xs">
                                  Dr
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <span>{ans.specialist.fullName}</span>
                                    <Award className="h-3.5 w-3.5 text-purple" />
                                  </div>
                                  <div className="text-[10px] text-foreground/60">
                                    {ans.specialist.specialistProfile?.specialty} •{' '}
                                    {ans.specialist.specialistProfile?.hospitalAffiliation}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-foreground/50">
                                {new Date(ans.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap pl-9">
                              {ans.answerText}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Specialist Answer Input Box */}
                    {isSpecialist && (
                      <div className="pt-2 border-t border-purple/10">
                        {answeringQuestionId === q.id ? (
                          <div className="space-y-2.5">
                            <label className="block text-xs font-bold text-foreground">
                              Compose Specialist Clinical Advice
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Provide clinical recommendation, dosage review instruction, or dietary caution..."
                              value={answerDraft}
                              onChange={(e) => setAnswerDraft(e.target.value)}
                              className="w-full p-3 rounded-xl border border-purple/20 bg-white dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setAnsweringQuestionId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs text-foreground/60 hover:bg-purple/10 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isAnswering}
                                onClick={() => handleAnswerSubmit(q.id)}
                                className="px-4 py-1.5 rounded-lg bg-purple hover:bg-purple/90 text-white text-xs font-black flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                              >
                                {isAnswering ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                <span>Post Verified Answer</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAnsweringQuestionId(q.id);
                              setAnswerDraft('');
                            }}
                            className="px-4 py-2 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5" /> Answer This Question
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
