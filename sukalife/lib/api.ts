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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
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
  }
};
