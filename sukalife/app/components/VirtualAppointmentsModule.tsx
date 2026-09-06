'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Calendar,
  Clock,
  User,
  Stethoscope,
  ShieldCheck,
  Building2,
  MapPin,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  Filter,
  DollarSign,
  FileText,
  X,
  Info,
  HeartHandshake
} from 'lucide-react';
import {
  api,
  AppointmentPackageItem,
  AppointmentBookingItem
} from '@/lib/api';

interface VirtualAppointmentsModuleProps {
  userRole?: 'PATIENT' | 'SPECIALIST' | 'CAREGIVER' | string;
  currentUserId?: string;
  currentUserName?: string;
  specialistProfile?: any;
}

const SPECIALTY_FILTERS = [
  'ALL',
  'Endocrinologist',
  'Nutritionist & Dietitian',
  'Certified Diabetes Educator (CDE)',
  'Diabetic Foot Specialist & Podiatrist',
  'General Practitioner / Clinician',
  'Pediatric Endocrinologist'
];

const DURATION_PRESETS = [20, 30, 45, 60];
const FEE_PRESETS = [
  { label: 'UGX 30,000', value: 30000 },
  { label: 'UGX 50,000', value: 50000 },
  { label: 'UGX 75,000', value: 75000 },
  { label: 'UGX 100,000', value: 100000 },
  { label: 'Free (Pro-Bono)', value: 0 }
];

const DAYS_PRESETS = [
  'Weekdays (Mon - Fri)',
  'Mon, Wed, Fri',
  'Tue, Thu, Sat',
  'Weekends (Sat & Sun)',
  'Daily'
];

const TIME_SLOT_PRESETS = [
  '08:00 AM - 12:00 PM',
  '02:00 PM - 05:00 PM',
  '06:00 PM - 09:00 PM',
  '09:00 AM - 04:00 PM'
];

export default function VirtualAppointmentsModule({
  userRole = 'PATIENT',
  currentUserId,
  currentUserName,
  specialistProfile
}: VirtualAppointmentsModuleProps) {
  const isSpecialist = userRole === 'SPECIALIST';

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'packages' | 'my-bookings'>('packages');

  const [packages, setPackages] = useState<AppointmentPackageItem[]>([]);
  const [bookings, setBookings] = useState<AppointmentBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDoctorProfileModalOpen, setIsDoctorProfileModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Selected Items for Modals
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState<AppointmentPackageItem | null>(null);

  // Specialist Create Package Form State
  const [createForm, setCreateForm] = useState({
    title: 'Virtual Comprehensive Diabetes Consultation',
    description: '30-minute one-on-one telehealth video review of your glucose trends, medication adjustments, and personalized dietary advice.',
    durationMinutes: 30,
    fee: 50000,
    currency: 'UGX',
    availableDays: 'Monday, Wednesday, Friday',
    availableTimeSlots: '09:00 AM - 01:00 PM, 03:00 PM - 06:00 PM',
    virtualPlatform: 'Sukaalife Telehealth Video Room'
  });
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);

  // Patient Booking Form State
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bookingTimeSlot, setBookingTimeSlot] = useState('09:00 AM');
  const [bookingReason, setBookingReason] = useState('Fasting glucose review and medication advice');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
    }
    setTimeout(() => {
      setErrorMessage(null);
      setSuccessMessage(null);
    }, 6000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [pkgsRes, bookingsRes] = await Promise.all([
        api.getAppointmentPackages().catch(() => ({ packages: [] })),
        api.getMyAppointments().catch(() => ({ bookings: [] }))
      ]);

      setPackages(pkgsRes.packages || []);
      setBookings(bookingsRes.bookings || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load appointment packages.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Create Package
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.description) return;

    try {
      setIsSubmittingPackage(true);
      const res = await api.createAppointmentPackage(createForm);
      showToast('Virtual consultation package published successfully!');
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create package.', true);
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  // Handle Delete Package
  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this consultation package?')) return;
    try {
      await api.deleteAppointmentPackage(id);
      showToast('Consultation package deactivated.');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate package.', true);
    }
  };

  // Handle View Doctor Profile
  const handleOpenDoctorProfile = (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsDoctorProfileModalOpen(true);
  };

  // Handle Open Booking
  const handleOpenBooking = (pkg: AppointmentPackageItem) => {
    setSelectedPackageForBooking(pkg);
    setIsDoctorProfileModalOpen(false);
    setIsBookingModalOpen(true);
  };

  // Submit Booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageForBooking || !bookingDate || !bookingTimeSlot) return;

    try {
      setIsSubmittingBooking(true);
      const res = await api.bookAppointment({
        packageId: selectedPackageForBooking.id,
        appointmentDate: bookingDate,
        timeSlot: bookingTimeSlot,
        reason: bookingReason,
        notes: bookingNotes
      });

      showToast(res.message || 'Virtual appointment confirmed!');
      setIsBookingModalOpen(false);
      setActiveTab('my-bookings');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to book appointment.', true);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Filtered Packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSpecialty =
      selectedSpecialty === 'ALL' ||
      pkg.specialist?.specialistProfile?.specialty === selectedSpecialty;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      pkg.title.toLowerCase().includes(query) ||
      pkg.description.toLowerCase().includes(query) ||
      pkg.specialist?.fullName.toLowerCase().includes(query) ||
      pkg.specialist?.specialistProfile?.hospitalAffiliation?.toLowerCase().includes(query);

    return matchesSpecialty && matchesSearch;
  });

  const mySpecialistPackages = packages.filter((p) => p.specialistId === currentUserId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alerts */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-2xl flex items-center gap-3 text-teal-800 dark:text-teal-300 text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <Video className="h-3.5 w-3.5 text-teal-300" /> Virtual Telehealth & Appointments
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Consultation Packages & Doctor Booking
          </h2>
          <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
            {isSpecialist
              ? 'Create and manage your virtual consultation offerings with automated credential extraction. Review incoming patient appointments and launch telehealth sessions.'
              : 'Book one-on-one virtual telehealth sessions with licensed Ugandan endocrinologists, certified diabetes educators, and nutritionists.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isSpecialist && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Appointment Package</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Refresh</span>}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'packages'
                ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{isSpecialist ? 'All Consultation Packages' : 'Available Doctor Packages'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-[10px]">
              {packages.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'my-bookings'
                ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isSpecialist ? 'Scheduled Patient Queue' : 'My Booked Appointments'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-[10px]">
              {bookings.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        {activeTab === 'packages' && (
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search packages, doctors, or hospitals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs outline-none focus:border-teal-500"
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CONSULTATION PACKAGES LISTING                      */}
      {/* ========================================================= */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          {/* Specialty Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {SPECIALTY_FILTERS.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  selectedSpecialty === spec
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
                }`}
              >
                {spec === 'ALL' ? 'All Specialties' : spec}
              </button>
            ))}
          </div>

          {/* Specialist's own packages section if in specialist mode */}
          {isSpecialist && mySpecialistPackages.length > 0 && (
            <div className="p-5 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 rounded-3xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase text-teal-900 dark:text-teal-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-700" /> My Published Consultation Packages ({mySpecialistPackages.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-xs font-black text-teal-700 hover:underline cursor-pointer"
                >
                  + Add Package
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mySpecialistPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-teal-200 dark:border-zinc-700 flex justify-between items-start gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{pkg.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{pkg.description}</p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-teal-700 dark:text-teal-300">
                        <span>{pkg.durationMinutes} mins</span>
                        <span>•</span>
                        <span>{pkg.fee > 0 ? `${pkg.currency} ${pkg.fee.toLocaleString()}` : 'Free'}</span>
                        <span>•</span>
                        <span>{pkg.availableDays}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition rounded-xl hover:bg-rose-50 cursor-pointer"
                      title="Deactivate Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packages Grid */}
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
              <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
              <p className="text-xs font-bold text-slate-500">Loading virtual consultation packages...</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">No consultation packages found</h3>
              <p className="text-xs text-slate-500">Try adjusting your search query or specialty filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPackages.map((pkg) => {
                const spec = pkg.specialist;
                const profile = spec?.specialistProfile;

                return (
                  <div
                    key={pkg.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-teal-300 transition-all group"
                  >
                    <div className="space-y-3">
                      {/* Doctor Overview Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              Dr. {spec?.fullName || 'Specialist'}
                            </span>
                            {profile?.isLicensed && (
                              <span title="Verified Medical License">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-teal-700 dark:text-teal-400">
                            {profile?.specialty || 'Clinical Specialist'}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{profile?.hospitalAffiliation || 'Mulago Hospital'}</span>
                          </p>
                        </div>

                        {/* View Doctor Profile Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenDoctorProfile(spec)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-teal-800 text-[10px] font-black border border-slate-200 dark:border-zinc-700 transition flex items-center gap-1 cursor-pointer shrink-0"
                          title="View Doctor's Credentials & Biography"
                        >
                          <User className="w-3 h-3" />
                          <span>View Profile</span>
                        </button>
                      </div>

                      {/* Package Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[10px] font-black uppercase flex items-center gap-1">
                            <Video className="w-3 h-3" /> Telehealth Video
                          </span>
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {pkg.fee > 0 ? `${pkg.currency} ${pkg.fee.toLocaleString()}` : 'Free'}
                          </span>
                        </div>

                        <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-teal-700 transition">
                          {pkg.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                          {pkg.description}
                        </p>
                      </div>

                      {/* Consultation Meta */}
                      <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-teal-700" /> Duration:
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{pkg.durationMinutes} minutes</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-teal-700" /> Days:
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                            {pkg.availableDays}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-teal-700" /> Slots:
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                            {pkg.availableTimeSlots}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(pkg)}
                        className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-2.5 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Appointment</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MY BOOKED APPOINTMENTS / QUEUE                      */}
      {/* ========================================================= */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              {isSpecialist ? 'Upcoming Patient Consultation Queue' : 'My Scheduled Telehealth Appointments'}
            </h3>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">No appointments scheduled yet</h4>
              <p className="text-xs text-slate-500">
                {isSpecialist
                  ? 'Incoming patient bookings will appear here.'
                  : 'Browse specialist packages above and book your first virtual consultation.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const apptDate = new Date(b.appointmentDate).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : b.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>

                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {b.package?.title || 'Telehealth Consultation'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-400">
                        {isSpecialist ? (
                          <>Patient: <strong>{b.patient?.fullName || 'Patient'}</strong> ({b.patient?.phone})</>
                        ) : (
                          <>Doctor: <strong>Dr. {b.specialist?.fullName || 'Specialist'}</strong> ({b.specialist?.specialistProfile?.specialty || 'Clinician'})</>
                        )}
                      </p>

                      <div className="flex items-center gap-3 text-xs font-bold text-teal-700 dark:text-teal-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {apptDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {b.timeSlot}
                        </span>
                        {b.reason && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 italic">Reason: {b.reason}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                      {b.meetingLink && (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Consultation</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SPECIALIST CREATE APPOINTMENT PACKAGE            */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  Specialist Practice Suite
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Create Virtual Consultation Package
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto-extracted Doctor Credentials Header */}
            <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-2xl space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase text-teal-800 dark:text-teal-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Extracted Specialist Credentials
              </span>
              <p className="font-black text-slate-900 dark:text-white">
                Dr. {currentUserName || 'Clinician'} • {specialistProfile?.specialty || 'Endocrinologist'}
              </p>
              <p className="text-slate-600 dark:text-zinc-400">
                Affiliation: {specialistProfile?.hospitalAffiliation || 'Mulago Hospital'} • License: {specialistProfile?.licenseNumber || 'Verified'}
              </p>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Package Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30-Min Fasting Blood Glucose Review & Meal Consultation"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Package Description & What Patient Receives *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what the consultation covers, e.g. review of 14-day glucometer log, personalized meal plan for Matooke and Posho, insulin adjustment."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-4 text-xs outline-none focus:border-teal-500"
                />
              </div>

              {/* Duration Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Duration (Minutes) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, durationMinutes: dur })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        createForm.durationMinutes === dur
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {dur} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Consultation Fee (UGX) *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {FEE_PRESETS.map((f) => (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, fee: f.value })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        createForm.fee === f.value
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={createForm.fee}
                  onChange={(e) => setCreateForm({ ...createForm, fee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Available Days *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {DAYS_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, availableDays: d })}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                        createForm.availableDays === d
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Time Slots */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Available Time Slots *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {TIME_SLOT_PRESETS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, availableTimeSlots: s })}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                        createForm.availableTimeSlots === s
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-1/2 py-3 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPackage}
                  className="w-1/2 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmittingPackage && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publish Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DOCTOR PROFILE & CREDENTIALS VIEWER             */}
      {/* ========================================================= */}
      {isDoctorProfileModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md">
                  Dr.
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Dr. {selectedDoctor.fullName}
                    </h3>
                    {selectedDoctor.specialistProfile?.isLicensed && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Licensed Clinician
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-400">
                    {selectedDoctor.specialistProfile?.specialty || 'Endocrinologist'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDoctorProfileModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Doctor Credentials Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Hospital / Health Center</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedDoctor.specialistProfile?.hospitalAffiliation || 'Mulago National Referral Hospital'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Medical Council License Number</span>
                <p className="font-bold text-emerald-700 dark:text-emerald-400">
                  {selectedDoctor.specialistProfile?.licenseNumber || 'Verified Registration'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">District / Region</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedDoctor.specialistProfile?.district || 'Kampala'}, Uganda
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Clinical Experience</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedDoctor.specialistProfile?.yearsPracticing || '5-10 years'}
                </p>
              </div>
            </div>

            {/* Doctor Biography / Clinical Focus */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Doctor Biography & Clinical Focus</span>
              <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                {selectedDoctor.specialistProfile?.bio ||
                  `Dr. ${selectedDoctor.fullName} is a registered clinical practitioner specializing in diabetes management, glycemic control, insulin regimen optimization, and lifestyle modification for Ugandan patients.`}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsDoctorProfileModalOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              Close Doctor Profile
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PATIENT APPOINTMENT BOOKING                      */}
      {/* ========================================================= */}
      {isBookingModalOpen && selectedPackageForBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  Virtual Telehealth Booking
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Book with Dr. {selectedPackageForBooking.specialist?.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Package Summary Box */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1.5 text-xs">
              <span className="font-black text-slate-900 dark:text-white block">
                {selectedPackageForBooking.title}
              </span>
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold">
                <span>{selectedPackageForBooking.durationMinutes} mins</span>
                <span>•</span>
                <span>{selectedPackageForBooking.fee > 0 ? `${selectedPackageForBooking.currency} ${selectedPackageForBooking.fee.toLocaleString()}` : 'Free'}</span>
                <span>•</span>
                <span>{selectedPackageForBooking.availableDays}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Select Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Select Preferred Time Slot *
                </label>
                <select
                  value={bookingTimeSlot}
                  onChange={(e) => setBookingTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm font-bold outline-none cursor-pointer"
                >
                  <option value="08:30 AM">08:30 AM - Morning</option>
                  <option value="09:00 AM">09:00 AM - Morning</option>
                  <option value="10:30 AM">10:30 AM - Morning</option>
                  <option value="02:00 PM">02:00 PM - Afternoon</option>
                  <option value="03:30 PM">03:30 PM - Afternoon</option>
                  <option value="05:00 PM">05:00 PM - Evening</option>
                  <option value="07:00 PM">07:00 PM - Evening</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Primary Reason for Consultation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning hyperglycemia, diet advice on local staple foods"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-xs outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  Additional Medical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any current medications (e.g. Metformin 500mg) or recent blood sugar readings..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 text-xs outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-1/2 py-3 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="w-1/2 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmittingBooking && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
