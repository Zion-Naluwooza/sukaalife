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
  isCompleted: boolean;
  weekStartDate: string;
  createdAt: string;
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

export const api = {
  // Auth
  register: async (payload: { fullName: string; phone: string; email?: string; password: string }) => {
    const res = await apiRequest<{ message: string; token: string; userId: string; fullName: string; isProfileComplete: boolean }>(
      '/patients/register',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser({ id: res.userId, fullName: res.fullName, isProfileComplete: res.isProfileComplete });
    }
    return res;
  },

  login: async (payload: { identifier: string; password: string }) => {
    const res = await apiRequest<{ message: string; token: string; userId: string; fullName: string; email?: string; phone?: string; isProfileComplete: boolean }>(
      '/patients/login',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser({ id: res.userId, fullName: res.fullName, email: res.email, phone: res.phone, isProfileComplete: res.isProfileComplete });
    }
    return res;
  },

  // Patient Profile
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

  // Vitals
  logVitals: async (payload: {
    bloodGlucoseLevel?: string | number;
    hba1c?: string | number;
    bloodPressure?: string;
    weight?: string | number;
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
  createSchedule: async (payload: { type: 'medication' | 'feeding'; name: string; time: string }) => {
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

  // Feature 1: Weekly Activity Summary
  getWeeklySummary: async () => {
    return apiRequest<WeeklySummaryData>('/patients/activity/weekly-summary', { method: 'GET' });
  },

  // Feature 2: Goals & Achievements
  getGoals: async () => {
    return apiRequest<{ goals: HealthGoalItem[]; achievements: AchievementItem[] }>('/patients/goals', { method: 'GET' });
  },

  createGoal: async (payload: { title: string; targetValue: number; unit?: string; category?: string }) => {
    return apiRequest<{ message: string; goal: HealthGoalItem }>('/patients/goals', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateGoalProgress: async (id: string, payload?: { incrementBy?: number; setProgress?: number; isCompleted?: boolean }) => {
    return apiRequest<{ message: string; goal: HealthGoalItem }>(`/patients/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {})
    });
  },

  deleteGoal: async (id: string) => {
    return apiRequest<{ message: string }>(`/patients/goals/${id}`, { method: 'DELETE' });
  },

  // Feature 3: Mood Logs
  getMoodLogs: async () => {
    return apiRequest<{ moodLogs: MoodLogItem[] }>('/patients/mood', { method: 'GET' });
  },

  createMoodLog: async (payload: {
    mood: string;
    energyLevel?: number;
    symptoms?: string[] | string;
    notes?: string;
  }) => {
    return apiRequest<{ message: string; moodLog: MoodLogItem }>('/patients/mood', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteMoodLog: async (id: string) => {
    return apiRequest<{ message: string }>(`/patients/mood/${id}`, { method: 'DELETE' });
  },

  // Feature 4: Consultation Notes
  getConsultationNotes: async () => {
    return apiRequest<{ consultationNotes: ConsultationNoteItem[] }>('/patients/consultations', { method: 'GET' });
  },

  createConsultationNote: async (payload: {
    doctorName?: string;
    clinicName?: string;
    visitDate?: string;
    chiefReason?: string;
    doctorAdvice: string;
    prescriptions?: string;
    nextAppointment?: string;
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
  }
};
