'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  User,
  Building2,
  Pill,
  Clock,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ConsultationNoteItem, api } from '@/lib/api';

interface ConsultationNotesCardProps {
  notes: ConsultationNoteItem[];
  onRefresh: () => void;
  showToast: (msg: string, isError?: boolean) => void;
}

export default function ConsultationNotesCard({ notes, onRefresh, showToast }: ConsultationNotesCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [chiefReason, setChiefReason] = useState('');
  const [doctorAdvice, setDoctorAdvice] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setDoctorName('');
    setClinicName('');
    setVisitDate(new Date().toISOString().split('T')[0]);
    setChiefReason('');
    setDoctorAdvice('');
    setPrescriptions('');
    setNextAppointment('');
    setShowModal(true);
  };

  const handleOpenEdit = (n: ConsultationNoteItem) => {
    setEditingId(n.id);
    setDoctorName(n.doctorName || '');
    setClinicName(n.clinicName || '');
    setVisitDate(n.visitDate ? n.visitDate.split('T')[0] : '');
    setChiefReason(n.chiefReason || '');
    setDoctorAdvice(n.doctorAdvice);
    setPrescriptions(n.prescriptions || '');
    setNextAppointment(n.nextAppointment ? n.nextAppointment.split('T')[0] : '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorAdvice) return;

    setLoading(true);
    try {
      if (editingId) {
        await api.updateConsultationNote(editingId, {
          doctorName: doctorName || undefined,
          clinicName: clinicName || undefined,
          visitDate: visitDate || undefined,
          chiefReason: chiefReason || undefined,
          doctorAdvice,
          prescriptions: prescriptions || undefined,
          nextAppointment: nextAppointment || undefined,
        });
        showToast('Consultation note updated successfully!');
      } else {
        await api.createConsultationNote({
          doctorName: doctorName || undefined,
          clinicName: clinicName || undefined,
          visitDate: visitDate || undefined,
          chiefReason: chiefReason || undefined,
          doctorAdvice,
          prescriptions: prescriptions || undefined,
          nextAppointment: nextAppointment || undefined,
        });
        showToast('New doctor consultation note saved!');
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save consultation note.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteConsultationNote(id);
      showToast('Consultation note deleted.');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete note.', true);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" /> Doctor Visit & Consultation Notes
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Keep track of clinical instructions, doctor advice, and medication changes</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">No doctor visit notes recorded yet.</p>
          <button
            onClick={handleOpenAdd}
            className="text-xs font-black text-teal-800 hover:underline"
          >
            Record notes from your recent doctor checkup
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((n) => {
            const formattedVisit = formatDate(n.visitDate);
            const formattedNext = formatDate(n.nextAppointment);

            return (
              <div
                key={n.id}
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group hover:border-teal-300 transition"
              >
                {/* Top header row */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900 text-sm block">
                      {n.doctorName ? `Dr. ${n.doctorName.replace(/^Dr\.\s*/i, '')}` : 'Doctor Visit'}
                    </span>
                    {n.clinicName && (
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" /> {n.clinicName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {formattedVisit && (
                      <span className="text-[10px] font-black text-teal-900 bg-teal-100 px-2 py-0.5 rounded-md">
                        {formattedVisit}
                      </span>
                    )}
                    <button
                      onClick={() => handleOpenEdit(n)}
                      className="p-1 text-slate-400 hover:text-teal-700 transition"
                      title="Edit Note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chief Reason */}
                {n.chiefReason && (
                  <div className="text-xs">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Reason for Visit</span>
                    <span className="font-medium text-slate-800">{n.chiefReason}</span>
                  </div>
                )}

                {/* Doctor Advice */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-black text-slate-700 uppercase text-[10px] block">Doctor Advice / Plan</span>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{n.doctorAdvice}</p>
                </div>

                {/* Prescriptions */}
                {n.prescriptions && (
                  <div className="flex items-start gap-1.5 text-xs text-purple-950 bg-purple-50/70 p-2.5 rounded-xl border border-purple-200/60">
                    <Pill className="w-3.5 h-3.5 text-purple-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-[10px] uppercase block text-purple-900">Medication Updates</span>
                      <span className="text-[11px] font-medium">{n.prescriptions}</span>
                    </div>
                  </div>
                )}

                {/* Next Appointment Alert */}
                {formattedNext && (
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" /> Next Checkup: {formattedNext}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-700" />
              {editingId ? 'Edit Consultation Note' : 'Add Doctor Consultation Note'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Doctor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Namubiru"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    placeholder="e.g. Mulago Hospital"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    placeholder="e.g. 3-Month HbA1c Review"
                    value={chiefReason}
                    onChange={(e) => setChiefReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Doctor Advice & Instructions <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Increase daily hydration. Keep fasting glucose under 120 mg/dL. Recheck blood pressure in 2 weeks."
                  value={doctorAdvice}
                  onChange={(e) => setDoctorAdvice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medication / Prescription Changes</label>
                <input
                  type="text"
                  placeholder="e.g. Metformin increased to 850mg twice daily with meals"
                  value={prescriptions}
                  onChange={(e) => setPrescriptions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Next Scheduled Appointment (Optional)</label>
                <input
                  type="date"
                  value={nextAppointment}
                  onChange={(e) => setNextAppointment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  {editingId ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
