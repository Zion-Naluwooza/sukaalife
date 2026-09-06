'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  KeyRound,
  Copy,
  CheckCircle2,
  Users,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X,
  Phone
} from 'lucide-react';
import { api } from '@/lib/api';

interface CaregiverLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'PATIENT' | 'CAREGIVER' | 'SPECIALIST' | string;
  onLinkSuccess?: () => void;
  existingCaregivers?: Array<{ id: string; caregiver: { id: string; fullName: string; phone: string }; status: string; inviteCode?: string }>;
}

export default function CaregiverLinkingModal({
  isOpen,
  onClose,
  userRole,
  onLinkSuccess,
  existingCaregivers = []
}: CaregiverLinkingModalProps) {
  // Patient State
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Caregiver State
  const [targetCode, setTargetCode] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [relationship, setRelationship] = useState('Child (Son / Daughter)');
  const [submittingLink, setSubmittingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  const isCaregiver = userRole === 'CAREGIVER';

  // Close on Escape key press
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

  const handleGenerateInvite = async () => {
    try {
      setGeneratingCode(true);
      const res = await api.createCaregiverInvite();
      setInviteCode(res.inviteCode);
    } catch (err: any) {
      console.error('Failed to generate invite code:', err);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCaregiverLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    setLinkSuccess(null);

    if (!targetCode.trim() && !targetPhone.trim()) {
      setLinkError('Please enter either a 6-digit Patient Invite Code or the patient’s registered Phone Number.');
      return;
    }

    try {
      setSubmittingLink(true);
      const res = await api.linkCaregiver({
        inviteCode: targetCode.trim() || undefined,
        patientPhone: targetPhone.trim() || undefined,
        relationship
      });

      setLinkSuccess(res.message || 'Successfully linked to patient portal!');
      setTargetCode('');
      setTargetPhone('');
      if (onLinkSuccess) onLinkSuccess();
    } catch (err: any) {
      setLinkError(err.message || 'Failed to link with patient.');
    } finally {
      setSubmittingLink(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-purple/20 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-purple text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold mb-2">
            <HeartHandshake className="h-3.5 w-3.5" /> Family & Caregiver Network
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {isCaregiver ? 'Link to a Patient Portal' : 'Invite a Caregiver'}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            {isCaregiver
              ? 'Connect with family members to log vitals and track their health.'
              : 'Allow a trusted family member or nurse to assist with tracking.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {!isCaregiver ? (
            // PATIENT VIEW: Generate & Share Invite Code
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#DFD2F0]/40 border border-purple/20 text-center">
                <KeyRound className="h-8 w-8 text-purple mx-auto mb-2" />
                <h3 className="text-sm font-black text-foreground">
                  Caregiver Connection Code
                </h3>
                <p className="text-xs text-foreground/70 mt-1 max-w-xs mx-auto">
                  Share this 6-character code with your family caregiver so they can pair their account with yours.
                </p>

                {inviteCode ? (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="font-mono text-3xl font-black tracking-widest text-purple bg-white dark:bg-zinc-800 px-6 py-2.5 rounded-xl border border-purple/30 shadow-xs">
                      {inviteCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="h-12 w-12 rounded-xl bg-purple hover:bg-purple/90 text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                      title="Copy Code"
                    >
                      {copied ? <CheckCircle2 className="h-5 w-5 text-secondary" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={generatingCode}
                    onClick={handleGenerateInvite}
                    className="mt-4 px-6 py-3 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-black inline-flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {generatingCode ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating Secure Code...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        <span>Generate 6-Digit Invite Code</span>
                      </>
                    )}
                  </button>
                )}

                {copied && (
                  <p className="text-[11px] font-bold text-purple mt-2 animate-in fade-in">
                    ✓ Code copied to clipboard! Send it to your caregiver.
                  </p>
                )}
              </div>

              {/* Linked Caregivers List */}
              <div>
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider mb-3">
                  Currently Linked Caregivers ({existingCaregivers.length})
                </h4>

                {existingCaregivers.length === 0 ? (
                  <p className="text-xs text-foreground/60 italic">
                    No caregivers linked yet. Generate a code above to get started.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {existingCaregivers.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-xl border border-purple/15 bg-secondary/15 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-purple text-white flex items-center justify-center font-bold text-xs">
                            {c.caregiver.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">
                              {c.caregiver.fullName}
                            </div>
                            <div className="text-[11px] text-foreground/60">{c.caregiver.phone}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple text-white">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // CAREGIVER VIEW: Input Code or Patient Phone to Link
            <form onSubmit={handleCaregiverLinkSubmit} className="space-y-4">
              {linkError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{linkError}</span>
                </div>
              )}

              {linkSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{linkSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Patient 6-Digit Invite Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. A9B2X7"
                  value={targetCode}
                  onChange={(e) => setTargetCode(e.target.value.toUpperCase())}
                  className="w-full h-11 px-3.5 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-sm font-mono tracking-widest text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-purple/15" />
                <span className="text-[11px] font-bold text-foreground/50 uppercase">OR</span>
                <div className="h-px flex-1 bg-purple/15" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Patient's Registered Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="e.g. +256 700 000000"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-foreground/40" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Your Relationship to Patient
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple cursor-pointer"
                >
                  <option value="Child (Son / Daughter)">Child (Son / Daughter)</option>
                  <option value="Parent / Guardian">Parent / Guardian</option>
                  <option value="Spouse / Partner">Spouse / Partner</option>
                  <option value="Sibling (Brother / Sister)">Sibling (Brother / Sister)</option>
                  <option value="Nurse / Home Caretaker">Nurse / Home Caretaker</option>
                  <option value="Other Relative / Friend">Other Relative / Friend</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submittingLink}
                className="w-full h-12 rounded-xl bg-purple hover:bg-purple/90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {submittingLink ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting Accounts...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Pair Patient Portal Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-secondary/20 border-t border-purple/15 flex items-center justify-between text-xs text-foreground/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-purple" />
            <span>Encrypted patient-caregiver link</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-purple hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
