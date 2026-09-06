const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'sukaa_auth_token';
const USER_KEY = 'sukaa_user_data';

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  clearToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: any): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }
};

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (networkErr: any) {
    throw new Error(`Cannot connect to server at ${API_BASE}. Please make sure the backend is running.`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export interface WeeklySummaryData {
  streakDays: number;
  totalLogsThisWeek: number;
  breakdown: {
    glucoseLogs: number;
    bpAndHbA1cLogs: number;
    medicationReminders: number;
    moodCheckIns: number;
  };
  dailyActivity: Array<{
    day: string;
    date: string;
    vitalsCount: number;
    moodsCount: number;
    total: number;
  }>;
}

export interface HealthGoalItem {
  id: string;
  title: string;
  targetValue: number;
  currentProgress: number;
  unit: string;
  category: 'GLUCOSE' | 'MEDICATION' | 'EXERCISE' | 'DIET' | 'GENERAL';
  frequencyPerWeek?: number;
  isCompleted: boolean;
  weekStartDate?: string;
  createdAt: string;
  logs?: Array<{
    id: string;
    date: string;
    reflectionNote?: string;
    effortLevel?: string;
    createdAt: string;
  }>;
}

export interface AchievementItem {
  id: string;
  badgeKey: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: string;
}

export interface MoodLogItem {
  id: string;
  mood: 'VERY_GOOD' | 'GOOD' | 'NEUTRAL' | 'TIRED' | 'STRESSED' | 'DIZZY' | 'UNWELL';
  energyLevel?: number | null;
  symptoms?: string | null;
  feelingText?: string | null;
  notes?: string | null;
  loggedAt: string;
}

export interface ConsultationNoteItem {
  id: string;
  doctorName?: string | null;
  clinicName?: string | null;
  visitDate: string;
  chiefReason?: string | null;
  doctorAdvice: string;
  prescriptions?: string | null;
  nextAppointment?: string | null;
  createdAt: string;
}

export interface EducationResourceItem {
  id: string;
  authorId: string;
  author?: {
    id: string;
    fullName: string;
    specialistProfile?: {
      specialty: string;
      hospitalAffiliation: string;
    } | null;
  };
  title: string;
  description: string;
  contentType: 'ARTICLE' | 'PDF' | 'VIDEO' | 'INFOGRAPHIC' | 'AUDIO';
  mediaUrl?: string | null;
  category: string;
  targetLanguage: string;
  tags?: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface QuestionAnswerItem {
  id: string;
  questionId: string;
  specialistId: string;
  answerText: string;
  createdAt: string;
  specialist: {
    id: string;
    fullName: string;
    specialistProfile?: {
      specialty: string;
      hospitalAffiliation: string;
    } | null;
  };
}

export interface PatientQuestionItem {
  id: string;
  patientId: string;
  title: string;
  questionText: string;
  category: string;
  urgency: 'LOW' | 'NORMAL' | 'URGENT' | 'EMERGENCY';
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  createdAt: string;
  patient?: {
    id: string;
    fullName: string;
    patientProfile?: any;
  };
  answers?: QuestionAnswerItem[];
}

export interface HealthReportData {
  reportTitle: string;
  generatedAt: string;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    email?: string | null;
    diabetesType: string;
    diagnosisYear?: number | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    latestHba1c?: number | null;
    latestBP?: string | null;
    weight?: number | null;
  };
  stats: {
    totalReadings: number;
    avgGlucose: number;
    minGlucose: number;
    maxGlucose: number;
    timeInRangePercent: number;
    inRangeCount: number;
    elevatedCount: number;
    highCount: number;
    lowCount: number;
  };
  schedules: Array<{ name: string; time: string; type: string }>;
  vitalsHistory: Array<{ detail: string; loggedAt: string; verified: boolean }>;
  moodSummary: {
    totalCheckIns: number;
    recentMoods: Array<{ mood: string; feelingText?: string | null; symptoms?: string | null; loggedAt: string }>;
  };
  consultations: Array<{
    doctorName?: string | null;
    clinicName?: string | null;
    visitDate: string;
    doctorAdvice: string;
    prescriptions?: string | null;
    nextAppointment?: string | null;
  }>;
}

export interface ChecklistTaskItem {
  key: string;
  title: string;
  type: 'SCHEDULE' | 'GOAL' | 'ROUTINE';
  timeOrFreq: string;
  category: string;
  isCompleted: boolean;
}

export interface DailyChecklistData {
  date: string;
  progressPercent: number;
  completedCount: number;
  totalCount: number;
  tasks: ChecklistTaskItem[];
}

export interface AppointmentPackageItem {
  id: string;
  specialistId: string;
  specialist: {
    id: string;
    fullName: string;
    phone?: string;
    email?: string;
    specialistProfile?: {
      specialty: string;
      isLicensed: boolean;
      licenseNumber?: string | null;
      hospitalAffiliation: string;
      district: string;
      yearsPracticing: string;
      bio?: string | null;
    } | null;
  };
  title: string;
  description: string;
  durationMinutes: number;
  fee: number;
  currency: string;
  availableDays: string;
  availableTimeSlots: string;
  isVirtual: boolean;
  virtualPlatform: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppointmentBookingItem {
  id: string;
  packageId: string;
  package: AppointmentPackageItem;
  patientId: string;
  patient?: {
    id: string;
    fullName: string;
    phone?: string;
    patientProfile?: any;
  };
  specialistId: string;
  specialist?: {
    id: string;
    fullName: string;
    phone?: string;
    specialistProfile?: {
      specialty: string;
      hospitalAffiliation: string;
      licenseNumber?: string;
    };
  };
  appointmentDate: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  reason?: string | null;
  meetingLink?: string | null;
  notes?: string | null;
  feePaid?: number | null;
  createdAt: string;
}

export const api = {
  // Auth & Roles
  register: async (payload: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    role?: 'PATIENT' | 'SPECIALIST' | 'CAREGIVER';
    specialty?: string;
    licenseNumber?: string;
    hospitalAffiliation?: string;
    relationship?: string;
  }) => {
    const res = await apiRequest<{
      message: string;
      token: string;
      userId: string;
      fullName: string;
      role: string;
      isProfileComplete: boolean;
    }>(
      '/patients/register',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser({ id: res.userId, fullName: res.fullName, role: res.role, isProfileComplete: res.isProfileComplete });
    }
    return res;
  },

  login: async (payload: { identifier: string; password: string }) => {
    const res = await apiRequest<{
      message: string;
      token: string;
      userId: string;
      fullName: string;
      email?: string;
      phone?: string;
      role: string;
      isProfileComplete: boolean;
      profile?: any;
    }>(
      '/patients/login',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser({
        id: res.userId,
        fullName: res.fullName,
        email: res.email,
        phone: res.phone,
        role: res.role,
        isProfileComplete: res.isProfileComplete
      });
    }
    return res;
  },

  // Patient Profile & Session
  getMe: async () => {
    return apiRequest<{
      user: { id: string; fullName: string; phone: string; email?: string; role: string };
      profile: any;
      vitalLogs: any[];
      schedules: any[];
      healthGoals?: HealthGoalItem[];
      achievements?: AchievementItem[];
      moodLogs?: MoodLogItem[];
      consultationNotes?: ConsultationNoteItem[];
      caregivers?: Array<{ id: string; caregiver: { id: string; fullName: string; phone: string }; status: string; inviteCode?: string }>;
      assignedPatients?: Array<{ id: string; patient: { id: string; fullName: string; phone: string; patientProfile?: any }; status: string }>;
    }>('/patients/me', { method: 'GET' });
  },

  saveMedicalProfile: async (payload: {
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    diagnosisYear?: string | number;
    diabetesType: 'TYPE_1' | 'TYPE_2';
    gender?: string;
    dateOfBirth?: string;
    bloodGlucoseLevel?: string | number;
    hba1c?: string | number;
    bloodPressure?: string;
    weight?: string | number;
  }) => {
    return apiRequest<{ message: string; isProfileComplete: boolean; profile: any }>(
      '/patients/medical-profile',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  saveSpecialistProfile: async (payload: {
    specialty: string;
    isLicensed?: boolean;
    licenseNumber?: string;
    hospitalAffiliation: string;
    gender?: string;
    district?: string;
    yearsPracticing?: string;
    bio?: string;
  }) => {
    return apiRequest<{ message: string; isProfileComplete: boolean; profile: any }>('/patients/specialists/profile', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  saveCaregiverProfile: async (payload: {
    relationship?: string;
    knowledgeLevel?: string;
    age?: number | string;
    gender?: string;
    caretakerType?: string;
  }) => {
    return apiRequest<{ message: string; isProfileComplete: boolean; profile: any }>('/patients/caregivers/profile', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Caregiver Linking
  createCaregiverInvite: async () => {
    return apiRequest<{ message: string; inviteCode: string }>('/patients/caregivers/invite', {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  linkCaregiver: async (payload: { inviteCode?: string; patientPhone?: string; relationship?: string }) => {
    return apiRequest<{ message: string; link: any }>('/patients/caregivers/link', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Vitals
  logVitals: async (payload: {
    bloodGlucoseLevel?: string | number;
    hba1c?: string | number;
    bloodPressure?: string;
    weight?: string | number;
    photoUrl?: string;
    frequencyContext?: string;
  }) => {
    return apiRequest<{ message: string; log: any }>('/patients/vitals', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getVitals: async () => {
    return apiRequest<{ vitalLogs: any[] }>('/patients/vitals', { method: 'GET' });
  },

  // Schedules
  createSchedule: async (payload: {
    type: 'medication' | 'feeding';
    name: string;
    time: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    frequencyDays?: string;
  }) => {
    return apiRequest<{ message: string; schedule: any }>('/patients/schedules', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getSchedules: async () => {
    return apiRequest<{ schedules: any[] }>('/patients/schedules', { method: 'GET' });
  },

  deleteSchedule: async (id: string) => {
    return apiRequest<{ message: string }>(`/patients/schedules/${id}`, { method: 'DELETE' });
  },

  // Weekly Activity Summary
  getWeeklySummary: async (patientId?: string) => {
    const query = patientId ? `?patientId=${patientId}` : '';
    return apiRequest<WeeklySummaryData>(`/patients/activity/weekly-summary${query}`, { method: 'GET' });
  },

  // Goals & Achievements
  getGoals: async (patientId?: string) => {
    const query = patientId ? `?patientId=${patientId}` : '';
    return apiRequest<{ goals: HealthGoalItem[]; achievements: AchievementItem[] }>(`/patients/goals${query}`, { method: 'GET' });
  },

  createGoal: async (payload: { title: string; targetValue: number; unit?: string; category?: string; frequencyPerWeek?: number; patientId?: string }) => {
    return apiRequest<{ message: string; goal: HealthGoalItem }>('/patients/goals', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateGoalProgress: async (id: string, payload?: {
    incrementBy?: number;
    setProgress?: number;
    isCompleted?: boolean;
    reflectionNote?: string;
    effortLevel?: string;
  }) => {
    return apiRequest<{ message: string; goal: HealthGoalItem }>(`/patients/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {})
    });
  },

  deleteGoal: async (id: string) => {
    return apiRequest<{ message: string }>(`/patients/goals/${id}`, { method: 'DELETE' });
  },

  // Feelings / Mood Check-In
  getMoodLogs: async (patientId?: string) => {
    const query = patientId ? `?patientId=${patientId}` : '';
    return apiRequest<{ moodLogs: MoodLogItem[] }>(`/patients/mood${query}`, { method: 'GET' });
  },

  createMoodLog: async (payload: {
    mood?: string;
    energyLevel?: number;
    symptoms?: string[] | string;
    feelingText?: string;
    notes?: string;
    patientId?: string;
  }) => {
    return apiRequest<{ message: string; moodLog: MoodLogItem }>('/patients/mood', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteMoodLog: async (id: string) => {
    return apiRequest<{ message: string }>(`/patients/mood/${id}`, { method: 'DELETE' });
  },

  // Consultation Notes
  getConsultationNotes: async (patientId?: string) => {
    const query = patientId ? `?patientId=${patientId}` : '';
    return apiRequest<{ consultationNotes: ConsultationNoteItem[] }>(`/patients/consultations${query}`, { method: 'GET' });
  },

  createConsultationNote: async (payload: {
    doctorName?: string;
    clinicName?: string;
    visitDate?: string;
    chiefReason?: string;
    doctorAdvice: string;
    prescriptions?: string;
    nextAppointment?: string;
    patientId?: string;
  }) => {
    return apiRequest<{ message: string; consultationNote: ConsultationNoteItem }>('/patients/consultations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateConsultationNote: async (id: string, payload: {
    doctorName?: string;
    clinicName?: string;
    visitDate?: string;
    chiefReason?: string;
    doctorAdvice?: string;
    prescriptions?: string;
    nextAppointment?: string;
  }) => {
    return apiRequest<{ message: string; consultationNote: ConsultationNoteItem }>(`/patients/consultations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  deleteConsultationNote: async (id: string) => {
    return apiRequest<{ message: string }>(`/patients/consultations/${id}`, { method: 'DELETE' });
  },

  // Education Center & Knowledge Base
  getEducationResources: async (params?: { category?: string; language?: string; contentType?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.language) searchParams.append('language', params.language);
    if (params?.contentType) searchParams.append('contentType', params.contentType);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<{ resources: EducationResourceItem[] }>(`/patients/education${query}`, { method: 'GET' });
  },

  createEducationResource: async (payload: {
    title: string;
    description: string;
    contentType: 'ARTICLE' | 'PDF' | 'VIDEO' | 'INFOGRAPHIC' | 'AUDIO';
    mediaUrl?: string;
    category?: string;
    targetLanguage?: string;
    tags?: string;
  }) => {
    return apiRequest<{ message: string; resource: EducationResourceItem }>('/patients/education', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteEducationResource: async (id: string) => {
    return apiRequest<{ message: string }>(`/patients/education/${id}`, { method: 'DELETE' });
  },

  // Patient Q&A System
  askQuestion: async (payload: {
    title: string;
    questionText: string;
    category?: string;
    urgency?: 'LOW' | 'NORMAL' | 'URGENT' | 'EMERGENCY';
    patientId?: string;
  }) => {
    return apiRequest<{ message: string; question: PatientQuestionItem }>('/patients/qa/questions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getQuestions: async () => {
    return apiRequest<{ questions: PatientQuestionItem[] }>('/patients/qa/questions', { method: 'GET' });
  },

  answerQuestion: async (id: string, payload: { answerText: string }) => {
    return apiRequest<{ message: string; answer: QuestionAnswerItem }>(`/patients/qa/questions/${id}/answers`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Health Summary Report Generator
  generateHealthReport: async (params?: { patientId?: string; range?: '7d' | '30d' | '90d' }) => {
    const searchParams = new URLSearchParams();
    if (params?.patientId) searchParams.append('patientId', params.patientId);
    if (params?.range) searchParams.append('range', params.range);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<HealthReportData>(`/patients/reports/health-summary${query}`, { method: 'GET' });
  },

  // Dynamic Daily Checklist
  getDailyChecklist: async (patientId?: string) => {
    const query = patientId ? `?patientId=${patientId}` : '';
    return apiRequest<DailyChecklistData>(`/patients/checklist/today${query}`, { method: 'GET' });
  },

  toggleDailyTask: async (payload: {
    taskKey: string;
    taskTitle?: string;
    taskType?: string;
    date?: string;
    patientId?: string;
  }) => {
    return apiRequest<{ message: string; isCompleted: boolean }>('/patients/checklist/toggle', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Feature 9: Virtual Appointment Packages & Bookings
  getAppointmentPackages: async (specialistId?: string) => {
    const query = specialistId ? `?specialistId=${specialistId}` : '';
    return apiRequest<{ packages: AppointmentPackageItem[] }>(`/patients/appointments/packages${query}`, { method: 'GET' });
  },

  createAppointmentPackage: async (payload: {
    title: string;
    description: string;
    durationMinutes?: number;
    fee?: number;
    currency?: string;
    availableDays?: string;
    availableTimeSlots?: string;
    virtualPlatform?: string;
  }) => {
    return apiRequest<{ message: string; package: AppointmentPackageItem }>('/patients/appointments/packages', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteAppointmentPackage: async (id: string) => {
    return apiRequest<{ message: string }>(`/patients/appointments/packages/${id}`, { method: 'DELETE' });
  },

  getSpecialistDoctorProfile: async (id: string) => {
    return apiRequest<{ specialist: any }>(`/patients/specialists/${id}/profile`, { method: 'GET' });
  },

  bookAppointment: async (payload: {
    packageId: string;
    appointmentDate: string;
    timeSlot: string;
    reason?: string;
    notes?: string;
  }) => {
    return apiRequest<{ message: string; booking: AppointmentBookingItem }>('/patients/appointments/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getMyAppointments: async () => {
    return apiRequest<{ bookings: AppointmentBookingItem[] }>('/patients/appointments/bookings', { method: 'GET' });
  },

  updateBookingStatus: async (id: string, payload: { status?: string; notes?: string }) => {
    return apiRequest<{ message: string; booking: AppointmentBookingItem }>(`/patients/appointments/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }
};

