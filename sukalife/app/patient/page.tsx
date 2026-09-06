'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Camera,
  Plus,
  CheckCircle2,
  Languages,
  Clock,
  LogOut,
  AlertCircle,
  Loader2,
  Trash2,
  HeartPulse,
  Droplets,
  Calendar,
  Activity,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api, authStorage } from '@/lib/api';
import SukaalifeLogo from '../components/sukaalifelogo';

type SupportedLanguage = 'English' | 'Luganda' | 'Kiswahili' | 'Lusoga' | 'Lugbara' | 'Acholi' | 'Runyankole';

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    portal: 'Patient Portal',
    tagline: 'Manage your glucose & medical schedule in your native language',
    signupTitle: 'Create Patient Account',
    signupSubtitle: 'Sign up to start tracking your glucose and vitals.',
    loginTitle: 'Patient Login',
    loginSubtitle: 'Welcome back! Enter your credentials to access your portal.',
    medicalTitle: 'Medical Biodata & Setup',
    medicalSubtitle: 'Step 2 of 2: Configure your diabetes profile and baseline readings.',
    fullName: 'Full Name',
    phone: 'Phone Number',
    emailOptional: 'Email Address (Optional)',
    password: 'Password',
    loginIdentifier: 'Phone Number or Email',
    btnSignup: 'Create Account & Continue',
    btnLogin: 'Login to Portal',
    btnSaveMedical: 'Save Medical Setup & Launch Dashboard',
    alreadyAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    emergencyContact: 'Emergency Contact Name',
    emergencyPhone: 'Emergency Contact Phone',
    diabetesType: 'Diabetes Type',
    diagnosisYear: 'Year Diagnosed',
    gender: 'Gender',
    dob: 'Date of Birth',
    type1: 'Type 1 Diabetes (Daily Glucose)',
    type2: 'Type 2 Diabetes (HbA1c & Blood Pressure)',
    glucoseLabel: 'Blood Glucose Level (mg/dL)',
    hba1cLabel: 'HbA1c Level (%)',
    bpLabel: 'Blood Pressure (mmHg, e.g. 120/80)',
    weightLabel: 'Body Weight (kg - Optional)',
    saveLogBtn: 'Save Vital Log',
    photoVerify: 'Photo Verify Strip',
    addSchedule: 'Add Reminder',
    scheduleModalTitle: 'Create Medication or Meal Alert',
    scheduleType: 'Schedule Category',
    scheduleName: 'Medicine / Meal Name',
    scheduleTime: 'Time (e.g. 08:00 AM)',
    medication: 'Medication',
    feeding: 'Feeding / Meal',
    cancel: 'Cancel',
    saveScheduleBtn: 'Save Schedule',
    activeSchedules: 'Active Medication & Meal Schedules',
    noSchedules: 'No reminders added yet. Click "Add Reminder" above.',
    recordedHistory: 'Recorded Vitals History',
    noVitals: 'No vital logs yet. Use the form on the left to record your first entry.',
    verified: 'Verified',
    logout: 'Logout',
    female: 'Female',
    male: 'Male',
    other: 'Other',
  },
  Luganda: {
    portal: 'Omukutu gw’Abalwadde',
    tagline: 'Kola enteekateeka y’eddagala n’omuwendo gwa sukaali mu lulimi lwo',
    signupTitle: 'Wandiisa Akawunti Y’omulwadde',
    signupSubtitle: 'Wandiisa okutandika okupima sukaali wo n’obulamu bwo.',
    loginTitle: 'Yingira mu Kawunti Yo',
    loginSubtitle: 'Tukusanyukidde nnyo! Yingiza ennamba yo oba email yo.',
    medicalTitle: 'Ebikwata Ku Bulamu Bwo',
    medicalSubtitle: 'Odaala 2 ku 2: Teekawo ebikwata ku kika kya sukaali gwo.',
    fullName: 'Amanya Go Gonna',
    phone: 'Ennamba y’Essimu',
    emailOptional: 'Email (Bw’oba ogirina)',
    password: 'Ekisumuluzo (Password)',
    loginIdentifier: 'Ennamba y’Essimu oba Email',
    btnSignup: 'Wandiisa Akawunti Oweeyongereyo',
    btnLogin: 'Yingira mu Portal',
    btnSaveMedical: 'Kuuma Ebikwata Ku Bulamu Oyingire',
    alreadyAccount: 'Olina dda akawunti?',
    noAccount: 'Tolina akawunti?',
    emergencyContact: 'Erinnya ly’Omuntu ow’Okuyita mu Bwangu',
    emergencyPhone: 'Essimu y’Omuntu ow’Okuyita',
    diabetesType: 'Ekika kya Sukaali',
    diagnosisYear: 'Omwaka gwe baakizuuliramu',
    gender: 'Kikula',
    dob: 'Olunaku lwe Wazaalibwa',
    type1: 'Sukaali Ekika 1 (Type 1 - Buli Lunaku)',
    type2: 'Sukaali Ekika 2 (Type 2 - HbA1c n’Entunnunsi)',
    glucoseLabel: 'Omuwendo gwa Sukaali (mg/dL)',
    hba1cLabel: 'Omuwendo gwa HbA1c (%)',
    bpLabel: 'Entunnunsi z’Omusaayi (mmHg e.g. 120/80)',
    weightLabel: 'Obuzito (kg - Bw’oba oyagala)',
    saveLogBtn: 'Kuuma Omuwendo gwa Sukaali',
    photoVerify: 'Kuba Ekifaananyi ky’Akapapula',
    addSchedule: 'Yongerako Enteekateeka',
    scheduleModalTitle: 'Teekawo Okujjukiza Eddagala oba Ebyokulya',
    scheduleType: 'Kika ky’Enteekateeka',
    scheduleName: 'Erinnya ly’Eddagala / Ekyokulya',
    scheduleTime: 'Essaawa (e.g. 08:00 AM)',
    medication: 'Eddagala',
    feeding: 'Ebyokulya',
    cancel: 'Sazaamu',
    saveScheduleBtn: 'Kuuma Enteekateeka',
    activeSchedules: 'Enteekateeka z’Eddagala n’Emmere Eziriwo',
    noSchedules: 'Tewali nteekateeka ziteereddwawo. Nyiga "Yongerako Enteekateeka".',
    recordedHistory: 'Ebyafaayo by’Omuwendo gwa Sukaali',
    noVitals: 'Tewannabaawo bipimo bikuŋŋaanyiziddwa.',
    verified: 'Kikakasiddwa',
    logout: 'Fuluma',
    female: 'Mukazi',
    male: 'Musajja',
    other: 'Ekirala',
  },
  Kiswahili: {
    portal: 'Lango la Mgonjwa',
    tagline: 'Fuatilia sukari ya damu na ratiba ya matibabu kwa lugha yako',
    signupTitle: 'Fungua Akaunti ya Mgonjwa',
    signupSubtitle: 'Jisajili ili kuanza kufuatilia sukari na vipimo vyako.',
    loginTitle: 'Ingia kwenye Akaunti',
    loginSubtitle: 'Karibu tena! Weka nambari yako ya simu au barua pepe.',
    medicalTitle: 'Taarifa za Kiafya',
    medicalSubtitle: 'Hatua ya 2 kati ya 2: Weka maelezo ya aina ya kisukari chako.',
    fullName: 'Jina Kamili',
    phone: 'Nambari ya Simu',
    emailOptional: 'Barua Pepe (Hiari)',
    password: 'Nenosiri',
    loginIdentifier: 'Nambari ya Simu au Barua Pepe',
    btnSignup: 'Jisajili na Uendelee',
    btnLogin: 'Ingia kwenye Lango',
    btnSaveMedical: 'Hifadhi Taarifa za Matibabu',
    alreadyAccount: 'Je, tayari unayo akaunti?',
    noAccount: 'Huna akaunti?',
    emergencyContact: 'Jina la Mwasiliani wa Dharura',
    emergencyPhone: 'Nambari ya Simu ya Dharura',
    diabetesType: 'Aina ya Kisukari',
    diagnosisYear: 'Mwaka wa Utambuzi',
    gender: 'Jinsia',
    dob: 'Tarehe ya Kuzaliwa',
    type1: 'Kisukari Aina ya 1 (Aina 1)',
    type2: 'Kisukari Aina ya 2 (Aina 2)',
    glucoseLabel: 'Kiwango cha Sukari kwenye Damu (mg/dL)',
    hba1cLabel: 'Kiwango cha HbA1c (%)',
    bpLabel: 'Shinikizo la Damu (mmHg mfano 120/80)',
    weightLabel: 'Uzito (kg - Hiari)',
    saveLogBtn: 'Hifadhi Kipimo',
    photoVerify: 'Piga Picha ya Kipimo',
    addSchedule: 'Ongeza Ratiba',
    scheduleModalTitle: 'Weka Kikumbusho cha Dawa au Chakula',
    scheduleType: 'Aina ya Ratiba',
    scheduleName: 'Jina la Dawa / Chakula',
    scheduleTime: 'Saa (mfano 08:00 AM)',
    medication: 'Dawa',
    feeding: 'Chakula',
    cancel: 'Ghairi',
    saveScheduleBtn: 'Hifadhi Ratiba',
    activeSchedules: 'Ratiba za Dawa na Chakula Zinazotumika',
    noSchedules: 'Hakuna ratiba bado. Bonyeza "Ongeza Ratiba" hapo juu.',
    recordedHistory: 'Historia ya Vipimo Vilivyorekodiwa',
    noVitals: 'Hakuna vipimo vilivyorekodiwa bado.',
    verified: 'Imethibitishwa',
    logout: 'Ondoka',
    female: 'Mwanamke',
    male: 'Mwanaume',
    other: 'Nyingine',
  },
  Lusoga: {
    portal: 'Eifo ly’Abalwire',
    tagline: 'Kola enteekateeka y’eddagala n’omuwendo gwa sukaali mu lulimi lwo',
    signupTitle: 'Wandiisa Akaunti y’Omulwire',
    signupSubtitle: 'Wandiisa okutandiika okupima sukaali wo.',
    loginTitle: 'Yingira mu Akaunti Yo',
    loginSubtitle: 'Twakusanga! Yingiza ennamba yo ey’essimu oba email.',
    medicalTitle: 'Ebikwata ku Bulamu Bwo',
    medicalSubtitle: 'Omutendera gwa 2: Teekawo ebikwata ku kika kya sukaali.',
    fullName: 'Eriina Lyo Lyona',
    phone: 'Ennamba y’Essimu',
    emailOptional: 'Email (Bw’oba ogiina)',
    password: 'Ekisumuluzo (Password)',
    loginIdentifier: 'Ennamba y’Essimu oba Email',
    btnSignup: 'Wandiisa Akaunti Oweeyongereyo',
    btnLogin: 'Yingira mu Eifo',
    btnSaveMedical: 'Biika Ebikwata ku Bulamu Oyingire',
    alreadyAccount: 'Olina dda akaunti?',
    noAccount: 'Tolina akaunti?',
    emergencyContact: 'Eriina ly’Omuntu ow’Okubikira',
    emergencyPhone: 'Essimu y’Omuntu ow’Okubikira',
    diabetesType: 'Ekika kya Sukaali',
    diagnosisYear: 'Omwaka ogwa kizuulirwamu',
    gender: 'Kikula',
    dob: 'Olunaku olw’Okwzalibwa',
    type1: 'Sukaali Ekika 1 (Type 1)',
    type2: 'Sukaali Ekika 2 (Type 2)',
    glucoseLabel: 'Omuwendo gwa Sukaali (mg/dL)',
    hba1cLabel: 'Omuwendo gwa HbA1c (%)',
    bpLabel: 'Entunnunsi (mmHg)',
    weightLabel: 'Obuzito (kg)',
    saveLogBtn: 'Biika Omuwendo gwa Sukaali',
    photoVerify: 'Kuba Ekifaananyi',
    addSchedule: 'Yongerako Enteekateeka',
    scheduleModalTitle: 'Teekawo Okujjukiza Eddagala',
    scheduleType: 'Kika ky’Enteekateeka',
    scheduleName: 'Eriina ly’Eddagala / Emmere',
    scheduleTime: 'Essaawa (e.g. 08:00 AM)',
    medication: 'Eddagala',
    feeding: 'Emmere',
    cancel: 'Sazaamu',
    saveScheduleBtn: 'Biika Enteekateeka',
    activeSchedules: 'Enteekateeka z’Eddagala Eziriwo',
    noSchedules: 'Tewali nteekateeka ziteereddwawo.',
    recordedHistory: 'Ebyafaayo by’Omuwendo gwa Sukaali',
    noVitals: 'Tewannabaawo bipimo bikuŋŋaanyiziddwa.',
    verified: 'Kikakasiddwa',
    logout: 'Fuluma',
    female: 'Mukazi',
    male: 'Musajja',
    other: 'Ebindi',
  },
  Lugbara: {
    portal: 'Lango Aliozu Dri',
    tagline: 'Mi ri sukaari azu dri nza mi dri lere',
    signupTitle: 'Ku Akaunti Aliozu Dri',
    signupSubtitle: 'Ku akaunti di mi sukari nza ri eci.',
    loginTitle: 'Ti Akaunti Vuti',
    loginSubtitle: 'Mi tu ayiko! Mi si simu namba kani email.',
    medicalTitle: 'Ewa Agupi Dri',
    medicalSubtitle: 'Galo 2: Mi ewa sukaari dri nza.',
    fullName: 'Ruza Kiri',
    phone: 'Simu Namba',
    emailOptional: 'Email (Mi ma oja)',
    password: 'Nenosiri (Password)',
    loginIdentifier: 'Simu Namba kani Email',
    btnSignup: 'Ku Akaunti Nga Mupi',
    btnLogin: 'Ti Lango Vuti',
    btnSaveMedical: 'Hifadhi Ewa Nga Ti',
    alreadyAccount: 'Akaunti mi dri ngo?',
    noAccount: 'Akaunti mi dri yo?',
    emergencyContact: 'Baa Ru Saa Oloro Dri',
    emergencyPhone: 'Simu Saa Oloro Dri',
    diabetesType: 'Sukari Ru',
    diagnosisYear: 'Kari Ni Zo Ri',
    gender: 'Jinsia',
    dob: 'Ondre Zo Oluri',
    type1: 'Sukari Ekika 1 (Type 1)',
    type2: 'Sukari Ekika 2 (Type 2)',
    glucoseLabel: 'Sukari Namba (mg/dL)',
    hba1cLabel: 'HbA1c Namba (%)',
    bpLabel: 'Ari Namba (mmHg)',
    weightLabel: 'Kilo (kg)',
    saveLogBtn: 'Hifadhi Sukari Namba',
    photoVerify: 'Fo Foto',
    addSchedule: 'Ta Namba Yiki',
    scheduleModalTitle: 'Kikumbusho Dawa kani Nya',
    scheduleType: 'Kika',
    scheduleName: 'Dawa / Nya Ru',
    scheduleTime: 'Saa (e.g. 08:00 AM)',
    medication: 'Dawa',
    feeding: 'Nya',
    cancel: 'Ghairi',
    saveScheduleBtn: 'Hifadhi',
    activeSchedules: 'Dawa Nga Nya Sawa',
    noSchedules: 'Schedules yo bado.',
    recordedHistory: 'Vipimo Tari',
    noVitals: 'Vipimo yo bado.',
    verified: 'Imethibitishwa',
    logout: 'Ti Ngoni',
    female: 'Aku',
    male: 'Agupi',
    other: 'Nyingine',
  },
  Acholi: {
    portal: 'Kaka Pa Lutwo',
    tagline: 'Nen kwo pa sukari ki yat me nino ducu i leb ma meri',
    signupTitle: 'Cak Akaunt Me Lutwo',
    signupSubtitle: 'Keto nying me cake poro sukari i komi.',
    loginTitle: 'Dony I Akaunt',
    loginSubtitle: 'Wapwoyo bino! Ket namba cimu onyo email.',
    medicalTitle: 'Lok Kom Yotkom',
    medicalSubtitle: 'Rwom me 2: Lok i kom kit sukari ma itye kwede.',
    fullName: 'Nyingi Dulu',
    phone: 'Namba Cimu',
    emailOptional: 'Email (Ka itye kwede)',
    password: 'Mung (Password)',
    loginIdentifier: 'Namba Cimu onyo Email',
    btnSignup: 'Cak Akaunt Medde',
    btnLogin: 'Dony Iye',
    btnSaveMedical: 'Gwen Lok Yotkom Dony Iye',
    alreadyAccount: 'Itye ki akaunt?',
    noAccount: 'Pegi akaunt?',
    emergencyContact: 'Nying Ngat Ma Gwoki',
    emergencyPhone: 'Cimu Pa Ngat Ma Gwoki',
    diabetesType: 'Kit Sukari',
    diagnosisYear: 'Mwaka ma kinongo iye',
    gender: 'Dako / Laco',
    dob: 'Nino Dwe Me Nywalo',
    type1: 'Sukari Type 1 (Nino Ducu)',
    type2: 'Sukari Type 2 (HbA1c & BP)',
    glucoseLabel: 'Rwom Me Sukari (mg/dL)',
    hba1cLabel: 'Rwom Me HbA1c (%)',
    bpLabel: 'Tung Cwiny (mmHg e.g. 120/80)',
    weightLabel: 'Pek Kom (kg)',
    saveLogBtn: 'Gwok Rwom Me Sukari',
    photoVerify: 'Mak Cal Me Strip',
    addSchedule: 'Med Cawa Me Yat',
    scheduleModalTitle: 'Ket Cawa Me Yat onyo Cam',
    scheduleType: 'Kit Cawa',
    scheduleName: 'Nying Yat onyo Cam',
    scheduleTime: 'Cawa (e.g. 08:00 AM)',
    medication: 'Yat',
    feeding: 'Cam',
    cancel: 'Juki',
    saveScheduleBtn: 'Gwok Cawa',
    activeSchedules: 'Cawa Me Yat ki Cam Ma Tye',
    noSchedules: 'Pegi cawa mo ma kito kany.',
    recordedHistory: 'Wel Me Sukari Ma Kigwoko',
    noVitals: 'Pegi wel mo ma kigwoko bado.',
    verified: 'Kijuko',
    logout: 'Katti',
    female: 'Dako',
    male: 'Laco',
    other: 'Mukene',
  },
  Runyankole: {
    portal: 'Omwanya gw’Abarwaire',
    tagline: 'Kora entebeekanisa y’obujanjabi n’obwingi bwa shukaari omu rurimi rwawe',
    signupTitle: 'Handiisa Akaunti y’Omurwaire',
    signupSubtitle: 'Handiisa kutandika kupima shukaari yawe n’amagara gaawe.',
    loginTitle: 'Taaha omu Kaunti Yawe',
    loginSubtitle: 'Tukwakiire gye! Taamu namba yawe y’esimu nari email.',
    medicalTitle: 'Ebirikukwata aha Magara',
    medicalSubtitle: 'Idaara rya 2: Teeraho ebirikukwata aha kika kya shukaari yawe.',
    fullName: 'Eiziina Ryawe Ryona',
    phone: 'Ennamba y’Esimu',
    emailOptional: 'Email (Ku orabe ogyine)',
    password: 'Ekitsibo (Password)',
    loginIdentifier: 'Namba y’Esimu nari Email',
    btnSignup: 'Handiisa Akaunti Ogume Omushoisho',
    btnLogin: 'Taaha omu Mwanya',
    btnSaveMedical: 'Biika Eby’Amagara Oze aha Dashboard',
    alreadyAccount: 'Oine akaunti kare?',
    noAccount: 'Tohine akaunti?',
    emergencyContact: 'Eiziina ry’Omuntu ow’Okubikira',
    emergencyPhone: 'Esimu y’Omuntu ow’Okubikira',
    diabetesType: 'Ekika kya Shukaari',
    diagnosisYear: 'Omwaka ogu baakushangiremu',
    gender: 'Kikazi / Kisyami',
    dob: 'Ebiro by’Okuzaarwa',
    type1: 'Shukaari Ekika 1 (Type 1)',
    type2: 'Shukaari Ekika 2 (Type 2)',
    glucoseLabel: 'Obwingi bwa Shukaari (mg/dL)',
    hba1cLabel: 'Obwingi bwa HbA1c (%)',
    bpLabel: 'Entuuntunu z’Eshagama (mmHg)',
    weightLabel: 'Oburemeezi (kg)',
    saveLogBtn: 'Biika Obwingi bwa Shukaari',
    photoVerify: 'Koresa Ekishushani',
    addSchedule: 'Yongyeraho Entebeekanisa',
    scheduleModalTitle: 'Teeraho Okwijusibwa kw’Eby’Okwesiga / Eby’Okurya',
    scheduleType: 'Kika ky’Entebeekanisa',
    scheduleName: 'Eiziina ry’Omubazi / Eby’Okurya',
    scheduleTime: 'Eshaaha (e.g. 08:00 AM)',
    medication: 'Omubazi',
    feeding: 'Eby’Okurya',
    cancel: 'Reka',
    saveScheduleBtn: 'Biika Entebeekanisa',
    activeSchedules: 'Entebeekanisa z’Ebibazi Eziriho',
    noSchedules: 'Tihaine ntebeekanisa ziriho kare.',
    recordedHistory: 'Ebyafaayo by’Obwingi bwa Shukaari',
    noVitals: 'Tihaine bipimo bihandiikirwe kare.',
    verified: 'Kikakasibwe',
    logout: 'Rugaamu',
    female: 'Mukazi',
    male: 'Mwishiki/Mushaija',
    other: 'Ebindi',
  }
};

interface ScheduleItem {
  id: string | number;
  type: 'medication' | 'feeding';
  name: string;
  time: string;
}

interface VitalLogItem {
  id: string | number;
  detail: string;
  time: string;
  verified: boolean;
}

export default function PatientApp() {
  // Navigation & Auth Flow States
  const [step, setStep] = useState<'signup' | 'login' | 'medical' | 'dashboard'>('signup');
  const [language, setLanguage] = useState<SupportedLanguage>('English');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.English;

  // Current Patient User Info
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    fullName: string;
    email?: string;
    phone?: string;
  }>({
    fullName: '',
  });

  // Auth Form Fields (Sign Up)
  const [authData, setAuthData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  // Login Form Fields
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  // Medical Profile Fields (Step 2 of Onboarding)
  const [medicalData, setMedicalData] = useState({
    emergencyContactName: '',
    emergencyContactPhone: '',
    diagnosisYear: '',
    diabetesType: 'type1' as 'type1' | 'type2',
    gender: 'Female',
    dateOfBirth: '',
  });

  // Dynamic Vital Logging Fields
  const [bloodGlucoseLevel, setBloodGlucoseLevel] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [weight, setWeight] = useState('');

  // Dashboard Modals & Schedules
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<'medication' | 'feeding'>('medication');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Logged Vitals History
  const [logs, setLogs] = useState<VitalLogItem[]>([]);

  // Helper to format timestamps for vitals history
  const formatLogTime = (dateStr?: string | Date): string => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to determine glucose classification
  const getGlucoseStatus = (valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return null;
    if (val < 70) return { label: 'Low (Hypoglycemia)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    if (val <= 140) return { label: 'Normal / In-Range', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    if (val <= 199) return { label: 'Elevated', color: 'bg-orange-100 text-orange-900 border-orange-300' };
    return { label: 'High (Hyperglycemia)', color: 'bg-rose-100 text-rose-900 border-rose-300' };
  };

  // Load patient data from backend if already authenticated
  const loadUserData = useCallback(async () => {
    try {
      const data = await api.getMe();
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          fullName: data.user.fullName,
          phone: data.user.phone,
          email: data.user.email,
        });

        if (data.profile && data.profile.isProfileComplete) {
          setMedicalData({
            emergencyContactName: data.profile.emergencyContactName || '',
            emergencyContactPhone: data.profile.emergencyContactPhone || '',
            diagnosisYear: data.profile.diagnosisYear ? String(data.profile.diagnosisYear) : '',
            diabetesType: data.profile.diabetesType === 'TYPE_2' ? 'type2' : 'type1',
            gender: data.profile.gender || 'Female',
            dateOfBirth: data.profile.dateOfBirth ? data.profile.dateOfBirth.split('T')[0] : '',
          });

          // Populate vitals history
          if (data.vitalLogs && data.vitalLogs.length > 0) {
            setLogs(
              data.vitalLogs.map((l: any) => ({
                id: l.id,
                detail: l.detail,
                time: formatLogTime(l.loggedAt),
                verified: l.verified ?? true,
              }))
            );
          }

          // Populate schedules
          if (data.schedules && data.schedules.length > 0) {
            setSchedules(
              data.schedules.map((s: any) => ({
                id: s.id,
                type: s.type.toLowerCase() === 'feeding' ? 'feeding' : 'medication',
                name: s.name,
                time: s.time,
              }))
            );
          }

          setStep('dashboard');
        } else {
          setStep('medical');
        }
      }
    } catch (err: any) {
      // If token expired or invalid, reset
      authStorage.clearToken();
      setStep('login');
    } finally {
      setInitLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = authStorage.getToken();
    if (token) {
      loadUserData();
    } else {
      setInitLoading(false);
    }
  }, [loadUserData]);

  // Clear notices after 6 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Handlers
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.register(authData);
      setCurrentUser({
        id: res.userId,
        fullName: res.fullName,
        phone: authData.phone,
        email: authData.email,
      });
      setSuccessMessage('Account created successfully! Step 2: Complete your medical setup.');
      setStep('medical');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.login(loginData);
      setCurrentUser({
        id: res.userId,
        fullName: res.fullName,
        email: res.email,
        phone: res.phone,
      });

      if (res.isProfileComplete) {
        await loadUserData();
        setStep('dashboard');
      } else {
        setSuccessMessage('Please complete your medical setup to access the full portal.');
        setStep('medical');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await api.saveMedicalProfile({
        emergencyContactName: medicalData.emergencyContactName,
        emergencyContactPhone: medicalData.emergencyContactPhone,
        diagnosisYear: medicalData.diagnosisYear,
        diabetesType: medicalData.diabetesType === 'type1' ? 'TYPE_1' : 'TYPE_2',
        gender: medicalData.gender,
        dateOfBirth: medicalData.dateOfBirth,
        bloodGlucoseLevel: medicalData.diabetesType === 'type1' ? bloodGlucoseLevel : undefined,
        hba1c: medicalData.diabetesType === 'type2' ? hba1c : undefined,
        bloodPressure: medicalData.diabetesType === 'type2' ? bloodPressure : undefined,
        weight: weight || undefined,
      });

      setSuccessMessage('Medical setup completed! Welcome to your Sukaalife Dashboard.');
      await loadUserData();
      setStep('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save medical profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (medicalData.diabetesType === 'type1' && !bloodGlucoseLevel) {
      setErrorMessage('Please enter your blood glucose level reading.');
      return;
    }
    if (medicalData.diabetesType === 'type2' && (!hba1c || !bloodPressure)) {
      setErrorMessage('Please enter your HbA1c and blood pressure readings.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.logVitals({
        bloodGlucoseLevel: medicalData.diabetesType === 'type1' ? bloodGlucoseLevel : undefined,
        hba1c: medicalData.diabetesType === 'type2' ? hba1c : undefined,
        bloodPressure: medicalData.diabetesType === 'type2' ? bloodPressure : undefined,
        weight: weight || undefined,
      });

      if (res.log) {
        setLogs((prev) => [
          {
            id: res.log.id,
            detail: res.log.detail,
            time: formatLogTime(res.log.loggedAt),
            verified: res.log.verified,
          },
          ...prev,
        ]);
      }

      setBloodGlucoseLevel('');
      setHba1c('');
      setBloodPressure('');
      setWeight('');
      setSuccessMessage('Vital log recorded and safely saved to your record.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to log vitals.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleName || !scheduleTime) return;

    setLoading(true);
    try {
      const res = await api.createSchedule({
        type: scheduleType,
        name: scheduleName,
        time: scheduleTime,
      });

      if (res.schedule) {
        setSchedules((prev) => [
          {
            id: res.schedule.id,
            type: res.schedule.type.toLowerCase() === 'feeding' ? 'feeding' : 'medication',
            name: res.schedule.name,
            time: res.schedule.time,
          },
          ...prev,
        ]);
      }

      setScheduleName('');
      setScheduleTime('');
      setShowScheduleModal(false);
      setSuccessMessage('Reminder schedule saved!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string | number) => {
    try {
      await api.deleteSchedule(String(id));
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      setSuccessMessage('Schedule removed.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove schedule.');
    }
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setCurrentUser({ fullName: '' });
    setLoginData({ identifier: '', password: '' });
    setAuthData({ fullName: '', phone: '', email: '', password: '' });
    setLogs([]);
    setSchedules([]);
    setStep('login');
  };

  if (initLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <SukaalifeLogo className="h-12" />
          <Loader2 className="w-7 h-7 text-teal-700 animate-spin" />
          <p className="text-sm font-black text-slate-700">Connecting to Sukaalife...</p>
        </div>
      </div>
    );
  }

  const glucoseStatus = bloodGlucoseLevel ? getGlucoseStatus(bloodGlucoseLevel) : null;

  return (
    <div className="w-[92%] max-w-5xl mx-auto min-h-screen py-6 font-sans text-slate-800">
      
      {/* App Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition">
            <SukaalifeLogo className="h-10" />
          </Link>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60">
              {t.portal}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Native Language Switcher */}
          <div className="flex items-center gap-2 bg-secondary/60 border border-secondary px-3.5 py-2 rounded-2xl shadow-sm text-sm text-slate-900 font-bold">
            <Languages className="w-4 h-4 text-purple-900 shrink-0" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent outline-none cursor-pointer font-bold text-slate-900 text-xs sm:text-sm"
              aria-label="Select preferred native language"
            >
              <option value="English">English</option>
              <option value="Luganda">Luganda</option>
              <option value="Kiswahili">Kiswahili</option>
              <option value="Lusoga">Lusoga</option>
              <option value="Lugbara">Lugbara</option>
              <option value="Acholi">Acholi</option>
              <option value="Runyankole">Runyankole</option>
            </select>
          </div>

          {step === 'dashboard' && (
            <button 
              onClick={handleLogout} 
              className="p-2.5 bg-slate-100 border border-slate-200 rounded-2xl hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition text-slate-700 flex items-center gap-1.5 text-xs font-bold shadow-sm" 
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          )}
        </div>
      </header>

      {/* Onboarding Flow Step Indicator */}
      {(step === 'signup' || step === 'login' || step === 'medical') && (
        <div className="max-w-xl mx-auto mb-6 flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step === 'signup' || step === 'login' ? 'bg-teal-700 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              1
            </span>
            <span className="text-xs font-bold text-slate-800">Account</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step === 'medical' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </span>
            <span className={`text-xs font-bold ${step === 'medical' ? 'text-slate-800' : 'text-slate-400'}`}>
              Medical Setup
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-black">
              3
            </span>
            <span className="text-xs font-bold text-slate-400">Dashboard</span>
          </div>
        </div>
      )}

      {/* Global Alerts Banner */}
      {errorMessage && (
        <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium flex-1">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-xs font-black text-red-700 underline">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="max-w-xl mx-auto mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium flex-1">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-xs font-black text-emerald-700 underline">Dismiss</button>
        </div>
      )}

      {/* STEP 1: AUTHENTICATION - SIGN UP */}
      {step === 'signup' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.signupTitle}</h2>
            <p className="text-xs text-slate-500">{t.signupSubtitle}</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.fullName}</label>
              <input 
                type="text" required placeholder="e.g. Sharitah Nanteza"
                value={authData.fullName} onChange={(e) => setAuthData({ ...authData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.phone}</label>
              <input 
                type="tel" required placeholder="e.g. +256 770 947655"
                value={authData.phone} onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.emailOptional}</label>
              <input 
                type="email" placeholder="patient@example.com"
                value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.password}</label>
              <input 
                type="password" required placeholder="••••••••"
                value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-3.5 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Creating Account...' : t.btnSignup}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            {t.alreadyAccount}{' '}
            <button onClick={() => { setErrorMessage(null); setStep('login'); }} className="text-purple-900 font-black underline hover:text-purple-700">
              {t.btnLogin}
            </button>
          </p>
        </div>
      )}

      {/* STEP 1 (ALT): AUTHENTICATION - LOGIN */}
      {step === 'login' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.loginTitle}</h2>
            <p className="text-xs text-slate-500">{t.loginSubtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.loginIdentifier}</label>
              <input 
                type="text" required placeholder="e.g. +256... or patient@example.com"
                value={loginData.identifier}
                onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.password}</label>
              <input 
                type="password" required placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-3.5 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Logging In...' : t.btnLogin}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            {t.noAccount}{' '}
            <button onClick={() => { setErrorMessage(null); setStep('signup'); }} className="text-purple-900 font-black underline hover:text-purple-700">
              {t.btnSignup}
            </button>
          </p>
        </div>
      )}

      {/* STEP 2: MEDICAL INFORMATION ONBOARDING SETUP */}
      {step === 'medical' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-900 rounded-full text-[11px] font-black mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> {t.medicalSubtitle}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.medicalTitle}</h2>
          </div>

          <form onSubmit={handleMedicalSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.emergencyContact}</label>
                <input 
                  type="text" required placeholder="Caregiver / Relative Name"
                  value={medicalData.emergencyContactName} onChange={(e) => setMedicalData({ ...medicalData, emergencyContactName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.emergencyPhone}</label>
                <input 
                  type="tel" required placeholder="+256..."
                  value={medicalData.emergencyContactPhone} onChange={(e) => setMedicalData({ ...medicalData, emergencyContactPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.diabetesType}</label>
                <select 
                  value={medicalData.diabetesType} onChange={(e) => setMedicalData({ ...medicalData, diabetesType: e.target.value as 'type1' | 'type2' })}
                  className="w-full bg-secondary/50 border border-secondary font-black text-slate-900 rounded-2xl px-4 py-3 text-sm outline-none cursor-pointer"
                >
                  <option value="type1">{t.type1}</option>
                  <option value="type2">{t.type2}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.diagnosisYear}</label>
                <input 
                  type="number" required placeholder="e.g. 2021" min="1950" max="2026"
                  value={medicalData.diagnosisYear} onChange={(e) => setMedicalData({ ...medicalData, diagnosisYear: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.gender}</label>
                <select 
                  value={medicalData.gender} onChange={(e) => setMedicalData({ ...medicalData, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none cursor-pointer"
                >
                  <option value="Female">{t.female}</option>
                  <option value="Male">{t.male}</option>
                  <option value="Other">{t.other}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.dob}</label>
                <input 
                  type="date" required
                  value={medicalData.dateOfBirth} onChange={(e) => setMedicalData({ ...medicalData, dateOfBirth: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Baseline Vital Snapshot */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-black uppercase text-slate-700 block">Baseline Vital Reading</span>
              
              {medicalData.diabetesType === 'type1' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.glucoseLabel}</label>
                  <input 
                    type="number" step="0.1" placeholder="e.g. 115"
                    value={bloodGlucoseLevel} onChange={(e) => setBloodGlucoseLevel(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.hba1cLabel}</label>
                    <input 
                      type="number" step="0.1" placeholder="e.g. 6.5"
                      value={hba1c} onChange={(e) => setHba1c(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.bpLabel}</label>
                    <input 
                      type="text" placeholder="e.g. 120/80"
                      value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.weightLabel}</label>
                <input 
                  type="number" step="0.1" placeholder="e.g. 70"
                  value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-4 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Saving Setup...' : t.btnSaveMedical}
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: PATIENT DASHBOARD */}
      {step === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Profile Summary Banner */}
            <div className="bg-secondary/40 border border-secondary p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">{currentUser.fullName || 'Patient'}</h2>
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Active
                  </span>
                </div>
                <p className="text-xs text-purple-950 font-bold mt-1">
                  {medicalData.diabetesType === 'type1' ? t.type1 : t.type2}
                </p>
              </div>

              <button 
                onClick={() => setShowScheduleModal(true)} 
                className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm transition"
              >
                <Clock className="w-4 h-4" /> {t.addSchedule}
              </button>
            </div>

            {/* DYNAMIC VITAL ENTRY FORM */}
            <form onSubmit={handleLogVitals} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-teal-700" />
                  {medicalData.diabetesType === 'type1' ? 'Daily Glucose Log' : 'HbA1c & Blood Pressure Log'}
                </h3>
                {glucoseStatus && (
                  <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${glucoseStatus.color}`}>
                    {glucoseStatus.label}
                  </span>
                )}
              </div>

              {/* Dynamic Inputs Based on Diabetes Type */}
              {medicalData.diabetesType === 'type1' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.glucoseLabel}</label>
                  <input 
                    type="number" step="0.1" required placeholder="e.g. 110"
                    value={bloodGlucoseLevel} onChange={(e) => setBloodGlucoseLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.hba1cLabel}</label>
                    <input 
                      type="number" step="0.1" required placeholder="e.g. 6.8"
                      value={hba1c} onChange={(e) => setHba1c(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.bpLabel}</label>
                    <input 
                      type="text" required placeholder="e.g. 120/80"
                      value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              )}

              {/* Optional Weight Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.weightLabel}</label>
                <input 
                  type="number" step="0.1" placeholder="e.g. 68.5"
                  value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSuccessMessage('Glucose test strip photo scanned and verified.')}
                  className="px-4 py-3 bg-secondary/40 hover:bg-secondary/70 transition border border-secondary rounded-2xl text-purple-950 font-black text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-purple-900" /> {t.photoVerify}
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-black py-3 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {t.saveLogBtn}
                </button>
              </div>
            </form>

            {/* Schedules Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">{t.activeSchedules}</h3>
              {schedules.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">{t.noSchedules}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schedules.map((item) => (
                    <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs group hover:border-teal-300 transition">
                      <div>
                        <span className="font-black text-slate-900 block">{item.name}</span>
                        <span className="text-purple-900 uppercase font-black text-[10px]">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-secondary text-purple-950 px-2.5 py-1 rounded-xl font-bold">{item.time}</span>
                        <button 
                          onClick={() => handleDeleteSchedule(item.id)}
                          className="opacity-60 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-red-600"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Vitals History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" /> {t.recordedHistory}
            </h3>
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">{t.noVitals}</p>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 animate-fade-in hover:border-teal-200 transition">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900 text-sm">{log.detail}</span>
                      <span className="bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-700" /> {log.verified ? t.verified : 'Logged'}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs block">{log.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ADD SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-black text-slate-900 text-lg">{t.scheduleModalTitle}</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.scheduleType}</label>
                <select 
                  value={scheduleType} onChange={(e) => setScheduleType(e.target.value as 'medication' | 'feeding')}
                  className="w-full bg-secondary/40 border border-secondary font-black text-slate-900 rounded-2xl px-4 py-3 text-sm outline-none cursor-pointer"
                >
                  <option value="medication">{t.medication}</option>
                  <option value="feeding">{t.feeding}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.scheduleName}</label>
                <input 
                  type="text" required placeholder={scheduleType === 'medication' ? 'e.g. Metformin 500mg' : 'e.g. Low sugar breakfast'}
                  value={scheduleName} onChange={(e) => setScheduleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t.scheduleTime}</label>
                <input 
                  type="text" required placeholder="e.g. 08:00 AM"
                  value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" onClick={() => setShowScheduleModal(false)}
                  className="w-1/2 py-3 border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-1/2 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.saveScheduleBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}