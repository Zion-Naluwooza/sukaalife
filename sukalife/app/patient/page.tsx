'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Activity,
  ShieldCheck,
  ChevronRight,
  Target,
  Smile,
  FileText,
  Flame,
  Trophy,
  BookOpen,
  MessageSquare,
  HeartHandshake,
  CalendarCheck,
  Users,
  Printer,
  User,
  Stethoscope,
  Building2,
  Award,
  MapPin,
  HelpCircle,
  Calendar,
  Video
} from 'lucide-react';
import {
  api,
  authStorage,
  WeeklySummaryData,
  HealthGoalItem,
  AchievementItem,
  MoodLogItem,
  ConsultationNoteItem
} from '@/lib/api';
import SukaalifeLogo from '../components/sukaalifelogo';
import WeeklySummaryCard from '../components/WeeklySummaryCard';
import GoalsManager from '../components/GoalsManager';
import MoodTracker from '../components/MoodTracker';
import ConsultationNotesCard from '../components/ConsultationNotesCard';
import LiveCameraVerification from '../components/LiveCameraVerification';
import DailyChecklist from '../components/DailyChecklist';
import TextFeelingModule from '../components/TextFeelingModule';
import CaregiverLinkingModal from '../components/CaregiverLinkingModal';
import EducationCenter from '../components/EducationCenter';
import PatientQAModule from '../components/PatientQAModule';
import HealthReportModal from '../components/HealthReportModal';
import VirtualAppointmentsModule from '../components/VirtualAppointmentsModule';

type SupportedLanguage = 'English' | 'Luganda' | 'Kiswahili' | 'Lusoga' | 'Lugbara' | 'Acholi' | 'Runyankole';
type UserRole = 'PATIENT' | 'SPECIALIST' | 'CAREGIVER';

const UGANDA_DISTRICTS = [
  'Kampala',
  'Wakiso',
  'Mukono',
  'Jinja',
  'Mbarara',
  'Gulu',
  'Arua',
  'Masaka',
  'Fort Portal / Kabarole',
  'Mbale',
  'Lira',
  'Soroti',
  'Entebbe',
  'Other District'
];

const SPECIALIST_SPECIALTIES = [
  'Endocrinologist',
  'Nutritionist & Dietitian',
  'Certified Diabetes Educator (CDE)',
  'Diabetic Foot Specialist & Podiatrist',
  'General Practitioner / Clinician',
  'Pediatric Endocrinologist'
];

const CAREGIVER_RELATIONSHIPS = [
  'Parent / Guardian',
  'Child (Son / Daughter)',
  'Spouse / Partner',
  'Sibling (Brother / Sister)',
  'Nurse / Home Caretaker',
  'Other Relative / Friend'
];

const CAREGIVER_KNOWLEDGE_LEVELS = [
  'New to this',
  'Basic',
  'Intermediary',
  'Well informed'
];

const CAREGIVER_TYPES = [
  'Live-in care taker',
  'Visit regularly',
  'Remote / Phone check-ins'
];

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    portal: 'Sukaalife Portal',
    tagline: 'Manage diabetes, vitals & medical care in your native language',
    signupTitle: 'Create Sukaalife Account',
    signupSubtitle: 'Sign up to start tracking your glucose, clinical triage, or family care.',
    loginTitle: 'Welcome Back to Sukaalife',
    loginSubtitle: 'Enter your credentials to access your personalized dashboard.',
    step1Title: 'Account Details',
    step2Title: 'Role & Profile Setup',
    step3Title: 'Dashboard',
    fullName: 'Full Name',
    phone: 'Phone Number',
    emailOptional: 'Email Address (Optional)',
    password: 'Password',
    loginIdentifier: 'Phone Number or Email',
    rolePatient: 'Patient (Self Care)',
    roleSpecialist: 'Doctor / Specialist',
    roleCaregiver: 'Caregiver / Family',
    btnSignup: 'Create Account & Continue',
    btnLogin: 'Login to Sukaalife',
    btnSaveSetup: 'Save Setup & Launch Dashboard',
    alreadyAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    gender: 'Gender',
    female: 'Female',
    male: 'Male',
    other: 'Other',
    logout: 'Logout',
    // Patient Step 2
    emergencyContact: 'Emergency Contact Name',
    emergencyPhone: 'Emergency Contact Phone',
    diabetesType: 'Diabetes Type',
    diagnosisYear: 'Year Diagnosed',
    dob: 'Date of Birth',
    type1: 'Type 1 Diabetes (Daily Glucose)',
    type2: 'Type 2 Diabetes (HbA1c & Blood Pressure)',
    glucoseLabel: 'Blood Glucose Level (mg/dL)',
    hba1cLabel: 'HbA1c Level (%)',
    bpLabel: 'Blood Pressure (mmHg, e.g. 120/80)',
    weightLabel: 'Body Weight (kg - Optional)',
    // Specialist Step 2
    specTitle: 'Specialist Professional Credentialing',
    specSpecialty: 'Primary Specialty',
    specLicensed: 'Are you licensed to practice?',
    specLicenseNum: 'Medical Council License / Reg Number',
    specHospital: 'Hospital / Health Center Affiliation',
    specDistrict: 'District / Region',
    specYears: 'How long have you been practicing?',
    // Caregiver Step 2
    careTitle: 'Caregiver & Family Support Setup',
    careRelation: 'Relationship to Patient',
    careKnowledge: 'Level of Knowledge About Diabetes',
    careAge: 'Caregiver Age',
    careType: 'Caregiver Living Arrangement',
    // Dashboard Tabs
    tabOverview: 'Daily Care & Vitals',
    tabGoals: 'Weekly Goals',
    tabMood: 'Feelings Journal',
    tabConsultations: 'Doctor Notes',
    tabEducation: 'Education Center',
    tabQA: 'Specialist Q&A',
    tabAppointments: 'Virtual Appointments',
    saveLogBtn: 'Save Vital Log',
    photoVerify: 'Photo Verify Strip',
    addSchedule: 'Add Reminder',
    activeSchedules: 'Active Medication & Meal Schedules',
    noSchedules: 'No reminders added yet.',
    recordedHistory: 'Recorded Vitals History',
    noVitals: 'No vitals recorded yet.',
    verified: 'Verified'
  },
  Luganda: {
    portal: 'Omukutu gwa Sukaalife',
    tagline: 'Kola enteekateeka y’eddagala n’omuwendo gwa sukaali mu lulimi lwo',
    signupTitle: 'Wandiisa Akawunti ku Sukaalife',
    signupSubtitle: 'Wandiisa okutandika okupima sukaali wo n’obulamu bwo.',
    loginTitle: 'Yingira mu Kawunti Yo',
    loginSubtitle: 'Tukusanyukidde nnyo! Yingiza ennamba yo oba email yo.',
    step1Title: 'Ebikwata ku Kawunti',
    step2Title: 'Enteekateeka y’Obulamu',
    step3Title: 'Dashboard',
    fullName: 'Amanya Go Gonna',
    phone: 'Ennamba y’Essimu',
    emailOptional: 'Email (Bw’oba ogirina)',
    password: 'Ekisumuluzo (Password)',
    loginIdentifier: 'Ennamba y’Essimu oba Email',
    rolePatient: 'Omulwadde (Nze Kennyini)',
    roleSpecialist: 'Omusawo / Specialist',
    roleCaregiver: 'Omulabirizi / Ow’eŋŋanda',
    btnSignup: 'Wandiisa Akawunti Oweeyongereyo',
    btnLogin: 'Yingira mu Sukaalife',
    btnSaveSetup: 'Kuuma Enteekateeka Oyingire',
    alreadyAccount: 'Olina dda akawunti?',
    noAccount: 'Tolina akawunti?',
    gender: 'Kikula',
    female: 'Mukazi',
    male: 'Musajja',
    other: 'Ekirala',
    logout: 'Fuluma',
    emergencyContact: 'Erinnya ly’Omuntu ow’Okuyita',
    emergencyPhone: 'Essimu y’Omuntu ow’Okuyita',
    diabetesType: 'Ekika kya Sukaali',
    diagnosisYear: 'Omwaka gwe baakizuuliramu',
    dob: 'Olunaku lwe Wazaalibwa',
    type1: 'Sukaali Ekika 1 (Type 1)',
    type2: 'Sukaali Ekika 2 (Type 2)',
    glucoseLabel: 'Omuwendo gwa Sukaali (mg/dL)',
    hba1cLabel: 'Omuwendo gwa HbA1c (%)',
    bpLabel: 'Entunnunsi (mmHg)',
    weightLabel: 'Obuzito (kg)',
    specTitle: 'Ebikwata ku Busawo Bwo',
    specSpecialty: 'Omulimu gw’Obusawo',
    specLicensed: 'Olina Layisinsi y’Obusawo?',
    specLicenseNum: 'Ennamba ya Layisinsi y’Obusawo',
    specHospital: 'Eddwaliro ly’Okoleramu',
    specDistrict: 'Disitulikiti',
    specYears: 'Omaze ebbanga ki ng’okola obusawo?',
    careTitle: 'Enteekateeka y’Omulabirizi',
    careRelation: 'Enganda Yo n’Omulwadde',
    careKnowledge: 'Okumanya Kwo ku Sukaali',
    careAge: 'Emyaka Gy’olina',
    careType: 'Mubeera wamu oba Okyalira bukyalizi?',
    tabOverview: 'Okupima & Eddagala',
    tabGoals: 'Ebiruubirirwa',
    tabMood: 'Okwewulira',
    tabConsultations: 'Eby’Omusawo',
    tabEducation: 'Okuyiga Sukaali',
    tabQA: 'Buuza Omusawo',
    tabAppointments: 'Enteekateeka z’Omusawo',
    saveLogBtn: 'Kuuma Omuwendo',
    photoVerify: 'Kuba Ekifaananyi',
    addSchedule: 'Yongerako Enteekateeka',
    activeSchedules: 'Enteekateeka z’Eddagala Eziriwo',
    noSchedules: 'Tewali nteekateeka ziteereddwawo.',
    recordedHistory: 'Ebyafaayo by’Omuwendo',
    noVitals: 'Tewannabaawo bipimo.',
    verified: 'Kikakasiddwa'
  },
  Kiswahili: {
    portal: 'Lango la Sukaalife',
    tagline: 'Fuatilia sukari ya damu na ratiba ya matibabu kwa lugha yako',
    signupTitle: 'Fungua Akaunti ya Sukaalife',
    signupSubtitle: 'Jisajili ili kuanza kufuatilia sukari na vipimo vyako.',
    loginTitle: 'Ingia kwenye Akaunti',
    loginSubtitle: 'Karibu tena! Weka nambari yako ya simu au barua pepe.',
    step1Title: 'Taarifa za Akaunti',
    step2Title: 'Mipangilio ya Jukumu',
    step3Title: 'Dashibodi',
    fullName: 'Jina Kamili',
    phone: 'Nambari ya Simu',
    emailOptional: 'Barua Pepe (Hiari)',
    password: 'Nenosiri',
    loginIdentifier: 'Nambari ya Simu au Barua Pepe',
    rolePatient: 'Mgonjwa (Mwenyewe)',
    roleSpecialist: 'Daktari / Mtaalamu',
    roleCaregiver: 'Mlezi / Familia',
    btnSignup: 'Jisajili na Uendelee',
    btnLogin: 'Ingia kwenye Lango',
    btnSaveSetup: 'Hifadhi na Uingie',
    alreadyAccount: 'Je, tayari unayo akaunti?',
    noAccount: 'Huna akaunti?',
    gender: 'Jinsia',
    female: 'Mwanamke',
    male: 'Mwanaume',
    other: 'Nyingine',
    logout: 'Ondoka',
    emergencyContact: 'Jina la Mwasiliani wa Dharura',
    emergencyPhone: 'Nambari ya Simu ya Dharura',
    diabetesType: 'Aina ya Kisukari',
    diagnosisYear: 'Mwaka wa Utambuzi',
    dob: 'Tarehe ya Kuzaliwa',
    type1: 'Kisukari Aina ya 1',
    type2: 'Kisukari Aina ya 2',
    glucoseLabel: 'Kiwango cha Sukari (mg/dL)',
    hba1cLabel: 'Kiwango cha HbA1c (%)',
    bpLabel: 'Shinikizo la Damu (mmHg)',
    weightLabel: 'Uzito (kg)',
    specTitle: 'Taarifa za Kitaalamu za Daktari',
    specSpecialty: 'Utaalamu wa Kimatibabu',
    specLicensed: 'Je, una leseni ya udaktari?',
    specLicenseNum: 'Nambari ya Leseni ya Udaktari',
    specHospital: 'Hospitali / Kituo cha Afya',
    specDistrict: 'Wilaya / Mkoa',
    specYears: 'Uzoefu wa Kazi ya Matibabu',
    careTitle: 'Taarifa za Mlezi wa Familia',
    careRelation: 'Uhusiano wako na Mgonjwa',
    careKnowledge: 'Uelewa wako kuhusu Kisukari',
    careAge: 'Umri wa Mlezi',
    careType: 'Je, unaishi naye au unamtembelea?',
    tabOverview: 'Vipimo & Dawa',
    tabGoals: 'Malengo',
    tabMood: 'Hali ya Moyo',
    tabConsultations: 'Vidokezo vya Daktari',
    tabEducation: 'Kituo cha Mafunzo',
    tabQA: 'Maswali ya Daktari',
    tabAppointments: 'Miadi ya Kliniki',
    saveLogBtn: 'Hifadhi Kipimo',
    photoVerify: 'Piga Picha ya Kipimo',
    addSchedule: 'Ongeza Ratiba',
    activeSchedules: 'Ratiba za Dawa na Chakula',
    noSchedules: 'Hakuna ratiba bado.',
    recordedHistory: 'Historia ya Vipimo',
    noVitals: 'Hakuna vipimo vilivyorekodiwa.',
    verified: 'Imethibitishwa'
  },
  Lusoga: {
    portal: 'Eifo ly’Abalwire',
    tagline: 'Kola enteekateeka y’eddagala n’omuwendo gwa sukaali mu lulimi lwo',
    signupTitle: 'Wandiisa Akaunti y’Omulwire',
    signupSubtitle: 'Wandiisa okutandiika okupima sukaali wo.',
    loginTitle: 'Yingira mu Akaunti Yo',
    loginSubtitle: 'Twakusanga! Yingiza ennamba yo ey’essimu oba email.',
    step1Title: 'Akaunti',
    step2Title: 'Enteekateeka y’Obulamu',
    step3Title: 'Dashboard',
    fullName: 'Eriina Lyo Lyona',
    phone: 'Ennamba y’Essimu',
    emailOptional: 'Email (Bw’oba ogiina)',
    password: 'Ekisumuluzo (Password)',
    loginIdentifier: 'Ennamba y’Essimu oba Email',
    rolePatient: 'Omulwire',
    roleSpecialist: 'Omusawo',
    roleCaregiver: 'Omulabirizi',
    btnSignup: 'Wandiisa Akaunti Oweeyongereyo',
    btnLogin: 'Yingira mu Eifo',
    btnSaveSetup: 'Biika Ebikwata ku Bulamu',
    alreadyAccount: 'Olina dda akaunti?',
    noAccount: 'Tolina akaunti?',
    gender: 'Kikula',
    female: 'Mukazi',
    male: 'Musajja',
    other: 'Ebindi',
    logout: 'Fuluma',
    emergencyContact: 'Eriina ly’Omuntu ow’Okubikira',
    emergencyPhone: 'Essimu y’Omuntu ow’Okubikira',
    diabetesType: 'Ekika kya Sukaali',
    diagnosisYear: 'Omwaka ogwa kizuulirwamu',
    dob: 'Olunaku olw’Okwzalibwa',
    type1: 'Sukaali Ekika 1',
    type2: 'Sukaali Ekika 2',
    glucoseLabel: 'Omuwendo gwa Sukaali (mg/dL)',
    hba1cLabel: 'Omuwendo gwa HbA1c (%)',
    bpLabel: 'Entunnunsi (mmHg)',
    weightLabel: 'Obuzito (kg)',
    specTitle: 'Ebikwata ku Busawo',
    specSpecialty: 'Omulimu gw’Obusawo',
    specLicensed: 'Olina Layisinsi y’Obusawo?',
    specLicenseNum: 'Ennamba ya Layisinsi',
    specHospital: 'Eddwaliro ly’Okoleramu',
    specDistrict: 'Disitulikiti',
    specYears: 'Emyaka gy’omaze ng’okola',
    careTitle: 'Enteekateeka y’Omulabirizi',
    careRelation: 'Enganda Yo n’Omulwire',
    careKnowledge: 'Okumanya Kwo ku Sukaali',
    careAge: 'Emyaka Gyo',
    careType: 'Mubeera wamu oba Okyala?',
    tabOverview: 'Okupima Sukaali',
    tabGoals: 'Ebiruubirirwa',
    tabMood: 'Okwewulira',
    tabConsultations: 'Eby’Omusawo',
    tabEducation: 'Okuyiga Sukaali',
    tabQA: 'Buuza Omusawo',
    tabAppointments: 'Enteekateeka z’Omusawo',
    saveLogBtn: 'Biika Omuwendo',
    photoVerify: 'Kuba Ekifaananyi',
    addSchedule: 'Yongerako Enteekateeka',
    activeSchedules: 'Enteekateeka Eziriwo',
    noSchedules: 'Tewali nteekateeka.',
    recordedHistory: 'Ebyafaayo by’Omuwendo',
    noVitals: 'Tewannabaawo bipimo.',
    verified: 'Kikakasiddwa'
  },
  Lugbara: {
    portal: 'Lango Aliozu Dri',
    tagline: 'Mi ri sukaari azu dri nza mi dri lere',
    signupTitle: 'Ku Akaunti Aliozu Dri',
    signupSubtitle: 'Ku akaunti di mi sukari nza ri eci.',
    loginTitle: 'Ti Akaunti Vuti',
    loginSubtitle: 'Mi tu ayiko! Mi si simu namba kani email.',
    step1Title: 'Akaunti Namba',
    step2Title: 'Ewa Agupi Dri',
    step3Title: 'Dashboard',
    fullName: 'Ruza Kiri',
    phone: 'Simu Namba',
    emailOptional: 'Email (Mi ma oja)',
    password: 'Nenosiri (Password)',
    loginIdentifier: 'Simu Namba kani Email',
    rolePatient: 'Aliozu',
    roleSpecialist: 'Daktari',
    roleCaregiver: 'Agupi Gwo',
    btnSignup: 'Ku Akaunti Nga Mupi',
    btnLogin: 'Ti Lango Vuti',
    btnSaveSetup: 'Hifadhi Ewa Nga Ti',
    alreadyAccount: 'Akaunti mi dri ngo?',
    noAccount: 'Akaunti mi dri yo?',
    gender: 'Jinsia',
    female: 'Aku',
    male: 'Agupi',
    other: 'Nyingine',
    logout: 'Ti Ngoni',
    emergencyContact: 'Baa Ru Saa Oloro Dri',
    emergencyPhone: 'Simu Saa Oloro Dri',
    diabetesType: 'Sukari Ru',
    diagnosisYear: 'Kari Ni Zo Ri',
    dob: 'Ondre Zo Oluri',
    type1: 'Sukari Ekika 1',
    type2: 'Sukari Ekika 2',
    glucoseLabel: 'Sukari Namba (mg/dL)',
    hba1cLabel: 'HbA1c Namba (%)',
    bpLabel: 'Ari Namba (mmHg)',
    weightLabel: 'Kilo (kg)',
    specTitle: 'Daktari Ru Ewa',
    specSpecialty: 'Daktari Kika',
    specLicensed: 'Mi lisensi oine?',
    specLicenseNum: 'Lisensi Namba',
    specHospital: 'Ospiti / Kituo',
    specDistrict: 'Wilaya',
    specYears: 'Kari ni zoo ri',
    careTitle: 'Agupi Gwo Ewa',
    careRelation: 'Aliozu Ngunzi',
    careKnowledge: 'Sukari Nza Eci',
    careAge: 'Kari',
    careType: 'Mi ci kani mi di?',
    tabOverview: 'Sukari Vipimo',
    tabGoals: 'Ma Namba',
    tabMood: 'Ayiko',
    tabConsultations: 'Daktari Lok',
    tabEducation: 'Ewa Nza Eci',
    tabQA: 'Daktari Zita',
    tabAppointments: 'Daktari Ruza',
    saveLogBtn: 'Hifadhi Sukari Namba',
    photoVerify: 'Fo Foto',
    addSchedule: 'Ta Namba Yiki',
    activeSchedules: 'Dawa Nga Nya Sawa',
    noSchedules: 'Schedules yo bado.',
    recordedHistory: 'Vipimo Tari',
    noVitals: 'Vipimo yo bado.',
    verified: 'Imethibitishwa'
  },
  Acholi: {
    portal: 'Kaka Pa Lutwo',
    tagline: 'Nen kwo pa sukari ki yat me nino ducu i leb ma meri',
    signupTitle: 'Cak Akaunt Me Sukaalife',
    signupSubtitle: 'Keto nying me cake poro sukari i komi.',
    loginTitle: 'Dony I Akaunt',
    loginSubtitle: 'Wapwoyo bino! Ket namba cimu onyo email.',
    step1Title: 'Lok Kom Akaunt',
    step2Title: 'Yotkom Mupore',
    step3Title: 'Dashboard',
    fullName: 'Nyingi Dulu',
    phone: 'Namba Cimu',
    emailOptional: 'Email (Ka itye kwede)',
    password: 'Mung (Password)',
    loginIdentifier: 'Namba Cimu onyo Email',
    rolePatient: 'Latwo',
    roleSpecialist: 'Dakta / Specialist',
    roleCaregiver: 'Lagwok / Ot',
    btnSignup: 'Cak Akaunt Medde',
    btnLogin: 'Dony Iye',
    btnSaveSetup: 'Gwen Lok Yotkom Dony Iye',
    alreadyAccount: 'Itye ki akaunt?',
    noAccount: 'Pegi akaunt?',
    gender: 'Dako / Laco',
    female: 'Dako',
    male: 'Laco',
    other: 'Mukene',
    logout: 'Katti',
    emergencyContact: 'Nying Ngat Ma Gwoki',
    emergencyPhone: 'Cimu Pa Ngat Ma Gwoki',
    diabetesType: 'Kit Sukari',
    diagnosisYear: 'Mwaka ma kinongo iye',
    dob: 'Nino Dwe Me Nywalo',
    type1: 'Sukari Type 1',
    type2: 'Sukari Type 2',
    glucoseLabel: 'Rwom Me Sukari (mg/dL)',
    hba1cLabel: 'Rwom Me HbA1c (%)',
    bpLabel: 'Tung Cwiny (mmHg)',
    weightLabel: 'Pek Kom (kg)',
    specTitle: 'Lok Kom Dakta',
    specSpecialty: 'Kit Tic Pa Dakta',
    specLicensed: 'Itye ki Layisinsi?',
    specLicenseNum: 'Namba Layisinsi',
    specHospital: 'Ocipital Ma Itiyo Iye',
    specDistrict: 'Dicitrik',
    specYears: 'Mwaka madii ma itiyo iye?',
    careTitle: 'Lok Kom Lagwok',
    careRelation: 'Wadi ki Latwo',
    careKnowledge: 'Ngec Kom Sukari',
    careAge: 'Mwaka meri',
    careType: 'Ibedo ki Latwo onyo Ilimo alima?',
    tabOverview: 'Poro Sukari',
    tabGoals: 'Miti & Wel',
    tabMood: 'Kit Yotkom',
    tabConsultations: 'Lok Pa Dakta',
    tabEducation: 'Pwony Kom Sukari',
    tabQA: 'Peny Dakta',
    tabAppointments: 'Yub me Ceto bot Daktar',
    saveLogBtn: 'Gwok Rwom Me Sukari',
    photoVerify: 'Mak Cal Me Strip',
    addSchedule: 'Med Cawa Me Yat',
    activeSchedules: 'Cawa Me Yat ki Cam',
    noSchedules: 'Pegi cawa mo ma kito kany.',
    recordedHistory: 'Wel Me Sukari Ma Kigwoko',
    noVitals: 'Pegi wel mo ma kigwoko bado.',
    verified: 'Kijuko'
  },
  Runyankole: {
    portal: 'Omwanya gw’Abarwaire',
    tagline: 'Kora entebeekanisa y’obujanjabi n’obwingi bwa shukaari omu rurimi rwawe',
    signupTitle: 'Handiisa Akaunti ya Sukaalife',
    signupSubtitle: 'Handiisa kutandika kupima shukaari yawe n’amagara gaawe.',
    loginTitle: 'Taaha omu Kaunti Yawe',
    loginSubtitle: 'Tukwakiire gye! Taamu namba yawe y’esimu nari email.',
    step1Title: 'Akaunti Yawe',
    step2Title: 'Entebeekanisa y’Amagara',
    step3Title: 'Dashboard',
    fullName: 'Eiziina Ryawe Ryona',
    phone: 'Ennamba y’Esimu',
    emailOptional: 'Email (Ku orabe ogyine)',
    password: 'Ekitsibo (Password)',
    loginIdentifier: 'Namba y’Esimu nari Email',
    rolePatient: 'Omurwaire (Nyenka)',
    roleSpecialist: 'Omushaho / Specialist',
    roleCaregiver: 'Omureezi / Ow’eka',
    btnSignup: 'Handiisa Akaunti Ogume Omushoisho',
    btnLogin: 'Taaha omu Mwanya',
    btnSaveSetup: 'Biika Eby’Amagara Oze aha Dashboard',
    alreadyAccount: 'Oine akaunti kare?',
    noAccount: 'Tohine akaunti?',
    gender: 'Kikazi / Kisyami',
    female: 'Mukazi',
    male: 'Mwishiki/Mushaija',
    other: 'Ebindi',
    logout: 'Rugaamu',
    emergencyContact: 'Eiziina ry’Omuntu ow’Okubikira',
    emergencyPhone: 'Esimu y’Omuntu ow’Okubikira',
    diabetesType: 'Ekika kya Shukaari',
    diagnosisYear: 'Omwaka ogu baakushangiremu',
    dob: 'Ebiro by’Okuzaarwa',
    type1: 'Shukaari Ekika 1',
    type2: 'Shukaari Ekika 2',
    glucoseLabel: 'Obwingi bwa Shukaari (mg/dL)',
    hba1cLabel: 'Obwingi bwa HbA1c (%)',
    bpLabel: 'Entuuntunu (mmHg)',
    weightLabel: 'Oburemeezi (kg)',
    specTitle: 'Ebikwata aha Bwengye bw’Omushaho',
    specSpecialty: 'Omwanya gw’Obushaho',
    specLicensed: 'Oine Layisinsi y’Obushaho?',
    specLicenseNum: 'Ennamba ya Layisinsi',
    specHospital: 'Eirwariro eri Orikukoreramu',
    specDistrict: 'Disiturikiti',
    specYears: 'Omazire emyaka engahi omu bushaho?',
    careTitle: 'Entebeekanisa y’Omureezi',
    careRelation: 'Obukwate bwawe n’Omurwaire',
    careKnowledge: 'Obwengye bwawe aha Shukaari',
    careAge: 'Emyaka yawe',
    careType: 'Noomutuuzamu nari noija kutaayaaya?',
    tabOverview: 'Kupima Shukaari',
    tabGoals: 'Ebigyendererwa',
    tabMood: 'Okwereeba',
    tabConsultations: 'Eby’Omushaho',
    tabEducation: 'Kwega Shukaari',
    tabQA: 'Buuza Omushaho',
    tabAppointments: 'Entebeekanisa y’Omushaho',
    saveLogBtn: 'Biika Obwingi bwa Shukaari',
    photoVerify: 'Koresa Ekishushani',
    addSchedule: 'Yongyeraho Entebeekanisa',
    activeSchedules: 'Entebeekanisa z’Ebibazi',
    noSchedules: 'Tihaine ntebeekanisa ziriho.',
    recordedHistory: 'Ebyafaayo by’Obwingi',
    noVitals: 'Tihaine bipimo bihandiikirwe.',
    verified: 'Kikakasibwe'
  }
};

interface ScheduleItem {
  id: string | number;
  type: 'medication' | 'feeding';
  name: string;
  time: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  frequencyDays?: string;
}

interface VitalLogItem {
  id: string | number;
  detail: string;
  time: string;
  verified: boolean;
}

type DashboardTab = 'overview' | 'goals' | 'mood' | 'consultations' | 'education' | 'qa' | 'appointments';

const TIME_PRESETS = [
  '06:30 AM',
  '07:00 AM',
  '08:00 AM',
  '12:30 PM',
  '02:00 PM',
  '06:30 PM',
  '08:00 PM',
  '10:00 PM'
];

const VITAL_FREQUENCY_OPTIONS = [
  { id: 'FASTING_MORNING', label: '🌅 Fasting (Morning Before Meal)', period: 'Daily' },
  { id: 'POST_BREAKFAST', label: '🥣 Post-Breakfast (+2h)', period: 'Daily' },
  { id: 'PRE_LUNCH', label: '🥗 Pre-Lunch', period: 'Daily' },
  { id: 'POST_LUNCH', label: '🍽️ Post-Lunch (+2h)', period: 'Daily' },
  { id: 'PRE_DINNER', label: '🍲 Pre-Dinner', period: 'Daily' },
  { id: 'POST_DINNER', label: '🥘 Post-Dinner (+2h)', period: 'Daily' },
  { id: 'BEDTIME', label: '🌙 Bedtime Routine', period: 'Daily' },
  { id: 'WEEKLY_CHECK', label: '📅 Weekly Routine Check', period: 'Weekly' },
  { id: 'MONTHLY_LAB', label: '🔬 Monthly HbA1c / Lab', period: 'Monthly' }
];

const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

const getCurrent12HourTime = (): string => {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

export default function UnifiedSukaalifeApp() {
  const router = useRouter();

  // Navigation & Flow States
  const [step, setStep] = useState<'signup' | 'login' | 'setup' | 'dashboard'>('signup');
  const [language, setLanguage] = useState<SupportedLanguage>('English');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PATIENT');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active Dashboard Sub-Tab
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');

  // Specialist Workspace Tabs
  const [specialistTab, setSpecialistTab] = useState<'triage' | 'education' | 'appointments' | 'reports' | 'credentials'>('triage');
  const [specialistSearchPatientId, setSpecialistSearchPatientId] = useState('');

  // Caregiver Hub Tabs
  const [caregiverTab, setCaregiverTab] = useState<'vitals' | 'checklist' | 'mood' | 'qa' | 'education' | 'appointments'>('vitals');

  // Modals
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCaregiverModalOpen, setIsCaregiverModalOpen] = useState(false);
  const [capturedStripPhoto, setCapturedStripPhoto] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.English;

  // Current User Info
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    fullName: string;
    email?: string;
    phone?: string;
    role?: UserRole;
  }>({
    fullName: '',
  });

  // Step 1: Sign Up Fields
  const [authData, setAuthData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  // Step 1: Login Fields
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  // Step 2: Patient Biodata Setup Fields
  const [patientData, setPatientData] = useState({
    emergencyContactName: '',
    emergencyContactPhone: '',
    diagnosisYear: '',
    diabetesType: 'type1' as 'type1' | 'type2',
    gender: 'Female',
    dateOfBirth: '',
  });
  const [bloodGlucoseLevel, setBloodGlucoseLevel] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [weight, setWeight] = useState('');

  // Vital Logging Frequency Context & Visual Time Module
  const [vitalFrequencyContext, setVitalFrequencyContext] = useState('FASTING_MORNING');
  const [vitalTime, setVitalTime] = useState(getCurrent12HourTime());

  // Step 2: Specialist Credentialing Setup Fields
  const [specialistData, setSpecialistData] = useState({
    specialty: 'Endocrinologist',
    isLicensed: true,
    licenseNumber: '',
    hospitalAffiliation: 'Mulago National Referral Hospital',
    customHospital: '',
    gender: 'Female',
    district: 'Kampala',
    yearsPracticing: '3-5 years',
    bio: ''
  });

  // Step 2: Caregiver Setup Fields
  const [caregiverData, setCaregiverData] = useState({
    relationship: 'Child (Son / Daughter)',
    knowledgeLevel: 'Basic',
    age: '32',
    gender: 'Female',
    caretakerType: 'Live-in care taker'
  });

  // Schedules & Logs
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<'medication' | 'feeding'>('medication');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00 AM');
  const [scheduleFrequency, setScheduleFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [scheduleFrequencyDays, setScheduleFrequencyDays] = useState('Monday');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [logs, setLogs] = useState<VitalLogItem[]>([]);

  // Features State
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null);
  const [goals, setGoals] = useState<HealthGoalItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLogItem[]>([]);
  const [consultationNotes, setConsultationNotes] = useState<ConsultationNoteItem[]>([]);
  const [caregivers, setCaregivers] = useState<any[]>([]);

  // Caregiver Patient Switcher (if logged in as caregiver)
  const [assignedPatients, setAssignedPatients] = useState<any[]>([]);
  const [selectedDependentId, setSelectedDependentId] = useState<string | null>(null);

  const formatLogTime = (dateStr?: string | Date): string => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getGlucoseStatus = (valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return null;
    if (val < 70) return { label: 'Low (Hypoglycemia)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    if (val <= 140) return { label: 'Normal / In-Range', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    if (val <= 199) return { label: 'Elevated', color: 'bg-orange-100 text-orange-900 border-orange-300' };
    return { label: 'High (Hyperglycemia)', color: 'bg-rose-100 text-rose-900 border-rose-300' };
  };

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
    }
  };

  // Load Session & User Data
  const loadUserData = useCallback(async () => {
    try {
      const [data, summaryData] = await Promise.all([
        api.getMe(),
        api.getWeeklySummary().catch(() => null)
      ]);

      if (data.user) {
        const userRole = (data.user.role as UserRole) || 'PATIENT';
        setSelectedRole(userRole);
        setCurrentUser({
          id: data.user.id,
          fullName: data.user.fullName,
          phone: data.user.phone,
          email: data.user.email,
          role: userRole
        });

        if (data.caregivers) setCaregivers(data.caregivers);
        if (data.assignedPatients) {
          setAssignedPatients(data.assignedPatients);
          if (data.assignedPatients.length > 0 && !selectedDependentId) {
            setSelectedDependentId(data.assignedPatients[0].patient.id);
          }
        }

        const isProfileComplete = data.profile && data.profile.isProfileComplete;

        if (isProfileComplete) {
          if (userRole === 'PATIENT') {
            setPatientData({
              emergencyContactName: data.profile.emergencyContactName || '',
              emergencyContactPhone: data.profile.emergencyContactPhone || '',
              diagnosisYear: data.profile.diagnosisYear ? String(data.profile.diagnosisYear) : '',
              diabetesType: data.profile.diabetesType === 'TYPE_2' ? 'type2' : 'type1',
              gender: data.profile.gender || 'Female',
              dateOfBirth: data.profile.dateOfBirth ? data.profile.dateOfBirth.split('T')[0] : '',
            });

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

            if (data.schedules && data.schedules.length > 0) {
              setSchedules(
                data.schedules.map((s: any) => ({
                  id: s.id,
                  type: s.type.toLowerCase() === 'feeding' ? 'feeding' : 'medication',
                  name: s.name,
                  time: s.time,
                  frequency: s.frequency || 'DAILY',
                  frequencyDays: s.frequencyDays || undefined,
                }))
              );
            }

            if (data.healthGoals) setGoals(data.healthGoals);
            if (data.achievements) setAchievements(data.achievements);
            if (data.moodLogs) setMoodLogs(data.moodLogs);
            if (data.consultationNotes) setConsultationNotes(data.consultationNotes);
            if (summaryData) setWeeklySummary(summaryData);
          } else if (userRole === 'SPECIALIST' && data.profile) {
            setSpecialistData({
              specialty: data.profile.specialty || 'Endocrinologist',
              isLicensed: data.profile.isLicensed ?? true,
              licenseNumber: data.profile.licenseNumber || '',
              hospitalAffiliation: data.profile.hospitalAffiliation || 'Mulago National Referral Hospital',
              customHospital: '',
              gender: data.profile.gender || 'Female',
              district: data.profile.district || 'Kampala',
              yearsPracticing: data.profile.yearsPracticing || '3-5 years',
              bio: data.profile.bio || ''
            });
          } else if (userRole === 'CAREGIVER' && data.profile) {
            setCaregiverData({
              relationship: data.profile.relationship || 'Parent / Guardian',
              knowledgeLevel: data.profile.knowledgeLevel || 'Basic',
              age: data.profile.age ? String(data.profile.age) : '32',
              gender: data.profile.gender || 'Female',
              caretakerType: data.profile.caretakerType || 'Live-in care taker'
            });
          }

          setStep('dashboard');
        } else {
          setStep('setup');
        }
      }
    } catch (err: any) {
      authStorage.clearToken();
      setStep('login');
    } finally {
      setInitLoading(false);
    }
  }, [selectedDependentId]);

  useEffect(() => {
    const token = authStorage.getToken();
    if (token) {
      loadUserData();
    } else {
      setInitLoading(false);
    }
  }, [loadUserData]);

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Step 1: Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.register({
        ...authData,
        role: selectedRole
      });

      setCurrentUser({
        id: res.userId,
        fullName: res.fullName,
        phone: authData.phone,
        email: authData.email,
        role: res.role as UserRole
      });

      setSuccessMessage('Account created! Step 2: Complete your details.');
      setStep('setup');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await api.login(loginData);
      const userRole = (res.role as UserRole) || 'PATIENT';
      setSelectedRole(userRole);

      setCurrentUser({
        id: res.userId,
        fullName: res.fullName,
        email: res.email,
        phone: res.phone,
        role: userRole
      });

      if (res.isProfileComplete) {
        await loadUserData();
        setStep('dashboard');
      } else {
        setSuccessMessage('Please complete your profile setup to continue.');
        setStep('setup');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Role-Specific Setup Handler
  const handleRoleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (selectedRole === 'PATIENT') {
        // Patient Medical Profile
        await api.saveMedicalProfile({
          emergencyContactName: patientData.emergencyContactName,
          emergencyContactPhone: patientData.emergencyContactPhone,
          diagnosisYear: patientData.diagnosisYear,
          diabetesType: patientData.diabetesType === 'type1' ? 'TYPE_1' : 'TYPE_2',
          gender: patientData.gender,
          dateOfBirth: patientData.dateOfBirth,
          bloodGlucoseLevel: patientData.diabetesType === 'type1' ? bloodGlucoseLevel : undefined,
          hba1c: patientData.diabetesType === 'type2' ? hba1c : undefined,
          bloodPressure: patientData.diabetesType === 'type2' ? bloodPressure : undefined,
          weight: weight || undefined,
        });
      } else if (selectedRole === 'SPECIALIST') {
        // Specialist Credentialing Profile
        const finalHospital = specialistData.hospitalAffiliation === 'Other Health Center'
          ? specialistData.customHospital.trim()
          : specialistData.hospitalAffiliation;

        await api.saveSpecialistProfile({
          specialty: specialistData.specialty,
          isLicensed: specialistData.isLicensed,
          licenseNumber: specialistData.isLicensed ? specialistData.licenseNumber.trim() : undefined,
          hospitalAffiliation: finalHospital || 'Mulago National Referral Hospital',
          gender: specialistData.gender,
          district: specialistData.district,
          yearsPracticing: specialistData.yearsPracticing,
          bio: specialistData.bio.trim() || undefined
        });
      } else if (selectedRole === 'CAREGIVER') {
        // Caregiver Profile
        await api.saveCaregiverProfile({
          relationship: caregiverData.relationship,
          knowledgeLevel: caregiverData.knowledgeLevel,
          age: caregiverData.age ? parseInt(caregiverData.age, 10) : undefined,
          gender: caregiverData.gender,
          caretakerType: caregiverData.caretakerType
        });
      }

      setSuccessMessage('Profile setup complete! Welcome to your dashboard.');
      await loadUserData();
      setStep('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save setup.');
    } finally {
      setLoading(false);
    }
  };

  // Vitals & Schedules Handlers (Patient / Caregiver)
  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (patientData.diabetesType === 'type1' && !bloodGlucoseLevel) {
      setErrorMessage('Please enter your blood glucose level reading.');
      return;
    }
    if (patientData.diabetesType === 'type2' && (!hba1c || !bloodPressure)) {
      setErrorMessage('Please enter your HbA1c and blood pressure readings.');
      return;
    }

    setLoading(true);
    try {
      const selectedOption = VITAL_FREQUENCY_OPTIONS.find(o => o.id === vitalFrequencyContext);
      const freqDescription = selectedOption ? `${selectedOption.label} at ${vitalTime}` : vitalTime;

      const res = await api.logVitals({
        bloodGlucoseLevel: patientData.diabetesType === 'type1' ? bloodGlucoseLevel : undefined,
        hba1c: patientData.diabetesType === 'type2' ? hba1c : undefined,
        bloodPressure: patientData.diabetesType === 'type2' ? bloodPressure : undefined,
        weight: weight || undefined,
        photoUrl: capturedStripPhoto || undefined,
        frequencyContext: freqDescription
      });

      if (res.log) {
        setLogs((prev) => [
          {
            id: res.log.id,
            detail: `${res.log.detail} • ${freqDescription}`,
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
      setCapturedStripPhoto(null);
      setSuccessMessage('Vital log recorded with routine context and safely saved.');
      api.getWeeklySummary().then(setWeeklySummary).catch(() => {});
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
        frequency: scheduleFrequency,
        frequencyDays: scheduleFrequency === 'WEEKLY' ? scheduleFrequencyDays : undefined
      });

      if (res.schedule) {
        setSchedules((prev) => [
          {
            id: res.schedule.id,
            type: res.schedule.type.toLowerCase() === 'feeding' ? 'feeding' : 'medication',
            name: res.schedule.name,
            time: res.schedule.time,
            frequency: res.schedule.frequency || scheduleFrequency,
            frequencyDays: res.schedule.frequencyDays || (scheduleFrequency === 'WEEKLY' ? scheduleFrequencyDays : undefined)
          },
          ...prev,
        ]);
      }

      setScheduleName('');
      setScheduleTime('08:00 AM');
      setScheduleFrequency('DAILY');
      setShowScheduleModal(false);
      setSuccessMessage('Reminder schedule saved!');
      api.getWeeklySummary().then(setWeeklySummary).catch(() => {});
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
    setGoals([]);
    setAchievements([]);
    setMoodLogs([]);
    setConsultationNotes([]);
    setWeeklySummary(null);
    setStep('login');
  };

  const glucoseStatus = getGlucoseStatus(bloodGlucoseLevel);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* GLOBAL HEADER BAR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <SukaalifeLogo className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Sukaalife
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                {selectedRole === 'SPECIALIST' ? 'Specialist Suite' : selectedRole === 'CAREGIVER' ? 'Caregiver Hub' : 'Patient Portal'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <Languages className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Luganda">Luganda</option>
              <option value="Kiswahili">Kiswahili</option>
              <option value="Lusoga">Lusoga</option>
              <option value="Acholi">Acholi</option>
              <option value="Runyankole">Runyankole</option>
            </select>
          </div>

          {/* User Status / Logout */}
          {currentUser.id && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-2xl">
                {currentUser.fullName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 transition rounded-xl hover:bg-rose-50 dark:hover:bg-zinc-800 cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* TOAST ALERTS */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-2xl flex items-center gap-3 text-teal-800 dark:text-teal-300 text-sm animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {/* INITIAL LOADING STATE */}
      {initLoading && (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Loader2 className="w-8 h-8 animate-spin text-teal-700 dark:text-teal-400" />
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Loading Sukaalife session...</p>
        </div>
      )}

      {/* STEP 1: AUTHENTICATION (LOGIN & SIGN UP) */}
      {!initLoading && (step === 'signup' || step === 'login') && (
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {step === 'signup' ? t.signupTitle : t.loginTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {step === 'signup' ? t.signupSubtitle : t.loginSubtitle}
            </p>
          </div>

          {/* Role Selector Tabs (Only on Sign Up) */}
          {step === 'signup' && (
            <div>
              <label className="block text-xs font-black uppercase text-slate-600 dark:text-zinc-400 mb-2">
                I am using Sukaalife as:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setSelectedRole('PATIENT')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedRole === 'PATIENT'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs border border-teal-200 dark:border-teal-900'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  {t.rolePatient}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('SPECIALIST')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedRole === 'SPECIALIST'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs border border-teal-200 dark:border-teal-900'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  {t.roleSpecialist}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('CAREGIVER')}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedRole === 'CAREGIVER'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs border border-teal-200 dark:border-teal-900'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  {t.roleCaregiver}
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={step === 'signup' ? handleSignUp : handleLogin} className="space-y-4">
            {step === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sarah Nalubega / Kato Ivan"
                    value={authData.fullName}
                    onChange={(e) => setAuthData({ ...authData, fullName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                    {t.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +256 700 000 000"
                    value={authData.phone}
                    onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                    {t.emailOptional}
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. user@example.com"
                    value={authData.email}
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                  />
                </div>
              </>
            )}

            {step === 'login' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                  {t.loginIdentifier} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter phone number or email"
                  value={loginData.identifier}
                  onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">
                {t.password} *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={step === 'signup' ? authData.password : loginData.password}
                onChange={(e) =>
                  step === 'signup'
                    ? setAuthData({ ...authData, password: e.target.value })
                    : setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-4 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {step === 'signup' ? t.btnSignup : t.btnLogin}
            </button>
          </form>

          {/* Toggle Login / Signup */}
          <div className="text-center pt-2">
            {step === 'signup' ? (
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                {t.alreadyAccount}{' '}
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  {t.btnLogin}
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                {t.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => setStep('signup')}
                  className="font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  {t.btnSignup}
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: ROLE-SPECIFIC SETUP FORM */}
      {!initLoading && step === 'setup' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              Step 2 of 2: {selectedRole} Setup
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {selectedRole === 'SPECIALIST'
                ? t.specTitle
                : selectedRole === 'CAREGIVER'
                ? t.careTitle
                : t.step2Title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {selectedRole === 'SPECIALIST'
                ? 'Register your clinical credentials, licensing, and medical hospital affiliation.'
                : selectedRole === 'CAREGIVER'
                ? 'Set up your care arrangement and family support background.'
                : 'Configure your diabetes diagnosis baseline and emergency details.'}
            </p>
          </div>

          <form onSubmit={handleRoleSetupSubmit} className="space-y-4">
            {/* 1. PATIENT FORM FIELDS */}
            {selectedRole === 'PATIENT' && (
              <>
                <div className="p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-3">
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300 block">
                    {t.diabetesType} *
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      patientData.diabetesType === 'type1'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40'
                        : 'border-slate-200 dark:border-zinc-700'
                    }`}>
                      <input
                        type="radio"
                        name="diabetesType"
                        value="type1"
                        checked={patientData.diabetesType === 'type1'}
                        onChange={() => setPatientData({ ...patientData, diabetesType: 'type1' })}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">{t.type1}</span>
                        <span className="text-[10px] text-slate-500">Track daily blood glucose (mg/dL)</span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      patientData.diabetesType === 'type2'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40'
                        : 'border-slate-200 dark:border-zinc-700'
                    }`}>
                      <input
                        type="radio"
                        name="diabetesType"
                        value="type2"
                        checked={patientData.diabetesType === 'type2'}
                        onChange={() => setPatientData({ ...patientData, diabetesType: 'type2' })}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">{t.type2}</span>
                        <span className="text-[10px] text-slate-500">Track HbA1c (%) & Blood Pressure</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">{t.emergencyContact} *</label>
                    <input 
                      type="text" required placeholder="e.g. John Mukasa"
                      value={patientData.emergencyContactName} onChange={(e) => setPatientData({ ...patientData, emergencyContactName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">{t.emergencyPhone} *</label>
                    <input 
                      type="tel" required placeholder="e.g. +256 700 000 000"
                      value={patientData.emergencyContactPhone} onChange={(e) => setPatientData({ ...patientData, emergencyContactPhone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">{t.gender} *</label>
                    <select 
                      value={patientData.gender} onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none cursor-pointer"
                    >
                      <option value="Female">{t.female}</option>
                      <option value="Male">{t.male}</option>
                      <option value="Other">{t.other}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">{t.dob} *</label>
                    <input 
                      type="date" required
                      value={patientData.dateOfBirth} onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 2. SPECIALIST FORM FIELDS */}
            {selectedRole === 'SPECIALIST' && (
              <>
                <div className="p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specialistData.isLicensed}
                      onChange={(e) => setSpecialistData({ ...specialistData, isLicensed: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {t.specLicensed}
                    </span>
                  </label>
                  {specialistData.isLicensed && (
                    <input
                      type="text"
                      required
                      placeholder="Enter License Number"
                      value={specialistData.licenseNumber}
                      onChange={(e) => setSpecialistData({ ...specialistData, licenseNumber: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                    />
                  )}
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-4 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {t.btnSaveSetup}
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: ROLE-SPECIFIC WORKSPACES */}
      {step === 'dashboard' && (
        <div className="space-y-6">

          {/* ========================================================= */}
          {/* WORKSPACE A: SPECIALIST / CLINICIAN SUITE                 */}
          {/* ========================================================= */}
          {selectedRole === 'SPECIALIST' && (
            <div className="space-y-6">
              {/* Specialist Profile Banner */}
              <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-teal-900/90 text-white p-6 sm:p-8 rounded-3xl border border-blue-700/50 shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-black uppercase flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5" /> Specialist Clinician
                      </span>
                      {specialistData.isLicensed && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-black flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> Licensed ({specialistData.licenseNumber || 'Verified'})
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{currentUser.fullName || 'Clinician'}</h2>
                    <p className="text-xs text-blue-200 font-semibold flex items-center gap-2 flex-wrap">
                      <span>{specialistData.specialty}</span>
                      <span>•</span>
                      <span>{specialistData.hospitalAffiliation}</span>
                      <span>•</span>
                      <span>{specialistData.district}</span>
                      <span>•</span>
                      <span>{specialistData.yearsPracticing} experience</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSpecialistTab('appointments')}
                      className="px-4 py-2.5 rounded-2xl bg-purple hover:bg-purple/90 border border-purple-400 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Video className="h-4 w-4" />
                      <span>Virtual Packages</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-black flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-blue-200" />
                      <span>Inspect Health Reports</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpecialistTab('education')}
                      className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Publish Education</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Specialist Navigation Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <button
                  onClick={() => setSpecialistTab('triage')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    specialistTab === 'triage'
                      ? 'bg-white dark:bg-zinc-900 text-blue-900 dark:text-blue-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Clinical Triage Queue</span>
                </button>

                <button
                  onClick={() => setSpecialistTab('education')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    specialistTab === 'education'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>Knowledge Publisher</span>
                </button>

                <button
                  onClick={() => setSpecialistTab('appointments')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    specialistTab === 'appointments'
                      ? 'bg-white dark:bg-zinc-900 text-purple-900 dark:text-purple-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>Virtual Packages & Bookings</span>
                </button>

                <button
                  onClick={() => setSpecialistTab('reports')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    specialistTab === 'reports'
                      ? 'bg-white dark:bg-zinc-900 text-purple-900 dark:text-purple-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>Patient Health Records & Trends</span>
                </button>

                <button
                  onClick={() => setSpecialistTab('credentials')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    specialistTab === 'credentials'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Credentials & Profile</span>
                </button>
              </div>

              {/* Specialist Tab Content */}
              {specialistTab === 'triage' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-950 dark:text-blue-200 font-medium">
                      You are in <strong>Specialist Mode</strong>. Review patient inquiries across Uganda, prioritized by clinical urgency (Emergency, Urgent, Normal). Your answers will appear with your verified clinician credentials.
                    </p>
                  </div>
                  <PatientQAModule userRole="SPECIALIST" patientId={currentUser.id} />
                </div>
              )}

              {specialistTab === 'education' && (
                <div className="space-y-4">
                  <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-2xl flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-teal-600 shrink-0" />
                    <p className="text-xs text-teal-950 dark:text-teal-200 font-medium">
                      Publish educational articles, clinical diet handouts, and native language audio/video guides for diabetes patients and caregivers.
                    </p>
                  </div>
                  <EducationCenter userRole="SPECIALIST" currentUserId={currentUser.id} />
                </div>
              )}

              {specialistTab === 'appointments' && (
                <VirtualAppointmentsModule userRole="SPECIALIST" currentUserId={currentUser.id} />
              )}

              {specialistTab === 'reports' && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Patient Health Records & Clinical Summaries</h3>
                      <p className="text-xs text-slate-500">Inspect blood glucose trends, HbA1c fluctuations, medication compliance, and download printable clinical reports.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> Open Full Report Generator
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500">Target Range</span>
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">70 - 140 mg/dL</p>
                      <span className="text-[10px] text-slate-400">Standard Fasting Baseline</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500">Hypoglycemia Alert</span>
                      <p className="text-xl font-black text-amber-600">&lt; 70 mg/dL</p>
                      <span className="text-[10px] text-slate-400">Immediate carb intervention</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500">Hyperglycemia Alert</span>
                      <p className="text-xl font-black text-rose-600">&gt; 200 mg/dL</p>
                      <span className="text-[10px] text-slate-400">Ketone & hydration review</span>
                    </div>
                  </div>

                  <div className="p-6 border border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl text-center space-y-3">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Need to generate an official clinical report for a patient?
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Launch Clinical Report Inspector
                    </button>
                  </div>
                </div>
              )}

              {specialistTab === 'credentials' && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-700" /> Specialist Professional Credentials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500">Medical Specialty</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{specialistData.specialty}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500">Council License Status</span>
                      <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> {specialistData.isLicensed ? `Licensed (${specialistData.licenseNumber || 'Verified'})` : 'Under Review'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500">Hospital Affiliation</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{specialistData.hospitalAffiliation}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500">Practice Location</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{specialistData.district}, Uganda</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-1 md:col-span-2">
                      <span className="text-[10px] font-black uppercase text-slate-500">Clinical Experience</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{specialistData.yearsPracticing}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* WORKSPACE B: CAREGIVER / FAMILY HUB                       */}
          {/* ========================================================= */}
          {selectedRole === 'CAREGIVER' && (
            <div className="space-y-6">
              {/* Caregiver Banner */}
              <div className="bg-[#DFD2F0]/50 dark:bg-zinc-900 border border-[#DFD2F0] dark:border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentUser.fullName || 'Caregiver'}</h2>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Family Caregiver
                    </span>
                  </div>
                  <p className="text-xs text-purple-950 dark:text-purple-300 font-bold mt-1">
                    Relationship: {caregiverData.relationship} • Arrangement: {caregiverData.caretakerType} • Knowledge: {caregiverData.knowledgeLevel}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsCaregiverModalOpen(true)}
                    className="px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-emerald-50 transition cursor-pointer"
                  >
                    <HeartHandshake className="h-4 w-4" />
                    <span>Link New Patient</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-800 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-purple-50 transition cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Health Report</span>
                  </button>
                </div>
              </div>

              {/* Dependent Switcher */}
              {assignedPatients.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300">
                    Active Dependent:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {assignedPatients.map((ap) => (
                      <button
                        key={ap.patient.id}
                        onClick={() => setSelectedDependentId(ap.patient.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedDependentId === ap.patient.id
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
                        }`}
                      >
                        {ap.patient.fullName} ({ap.patient.phone})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Caregiver Hub Navigation Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <button
                  onClick={() => setCaregiverTab('vitals')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    caregiverTab === 'vitals'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <HeartPulse className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Log Vitals on Behalf</span>
                </button>

                <button
                  onClick={() => setCaregiverTab('checklist')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    caregiverTab === 'checklist'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Daily Routine Checklist</span>
                </button>

                <button
                  onClick={() => setCaregiverTab('mood')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    caregiverTab === 'mood'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Smile className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Feelings & Mood Log</span>
                </button>

                <button
                  onClick={() => setCaregiverTab('qa')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    caregiverTab === 'qa'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Ask Specialist</span>
                </button>

                <button
                  onClick={() => setCaregiverTab('education')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    caregiverTab === 'education'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Caregiver Guides</span>
                </button>

                <button
                  onClick={() => setCaregiverTab('appointments')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    caregiverTab === 'appointments'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Book Specialist</span>
                </button>
              </div>

              {/* Caregiver Tab 1: Vitals */}
              {caregiverTab === 'vitals' && (
                <div className="space-y-6">
                  {/* Dynamic Vital Entry Form */}
                  <form onSubmit={handleLogVitals} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-teal-700" />
                        Log Vital Reading on Behalf of Dependent
                      </h3>
                      {glucoseStatus && (
                        <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${glucoseStatus.color}`}>
                          {glucoseStatus.label}
                        </span>
                      )}
                    </div>

                    {/* Routine / Frequency Context Selector */}
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5">
                        Reading Frequency & Routine Context *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {VITAL_FREQUENCY_OPTIONS.map((opt) => (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setVitalFrequencyContext(opt.id)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                              vitalFrequencyContext === opt.id
                                ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200'
                                : 'border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
                            }`}
                          >
                            <span className="block">{opt.label}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{opt.period} check</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visual Time Selector Module */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-700" />
                          Log Time: <span className="text-teal-700 dark:text-teal-400 font-black">{vitalTime}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setVitalTime(getCurrent12HourTime())}
                          className="text-[11px] font-black text-teal-700 hover:underline cursor-pointer"
                        >
                          Now
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {TIME_PRESETS.map((tPreset) => (
                          <button
                            key={tPreset}
                            type="button"
                            onClick={() => setVitalTime(tPreset)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              vitalTime === tPreset
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                            }`}
                          >
                            {tPreset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reading Value Inputs */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t.glucoseLabel}</label>
                      <input 
                        type="number" step="0.1" placeholder="e.g. 110"
                        value={bloodGlucoseLevel} onChange={(e) => setBloodGlucoseLevel(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t.bpLabel}</label>
                        <input 
                          type="text" placeholder="e.g. 120/80"
                          value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t.weightLabel}</label>
                        <input 
                          type="number" step="0.1" placeholder="e.g. 68.5"
                          value={weight} onChange={(e) => setWeight(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                        />
                      </div>
                    </div>

                    {/* Captured Photo Strip Preview */}
                    {capturedStripPhoto && (
                      <div className="relative aspect-video max-h-40 rounded-2xl overflow-hidden border border-purple-300 dark:border-purple-800">
                        <img src={capturedStripPhoto} alt="Captured strip" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Strip Photo Attached
                        </div>
                        <button
                          type="button"
                          onClick={() => setCapturedStripPhoto(null)}
                          className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md hover:bg-black"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setIsCameraModalOpen(true)}
                        className="px-4 py-3 bg-[#DFD2F0]/40 hover:bg-[#DFD2F0]/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition border border-[#DFD2F0] dark:border-zinc-700 rounded-2xl text-purple-950 dark:text-purple-300 font-black text-xs flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-purple-900 dark:text-purple-300" /> Photo Verify Strip
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-black py-3 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Save Dependent Log
                      </button>
                    </div>
                  </form>

                  {/* Vitals History */}
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-700" /> Recorded History
                    </h3>
                    {logs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No vitals recorded yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {logs.map((log) => (
                          <div key={log.id} className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-4 rounded-2xl space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-slate-900 dark:text-white text-sm">{log.detail}</span>
                              <span className="bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-800 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-teal-700" /> Verified
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

              {/* Caregiver Tab 2: Checklist */}
              {caregiverTab === 'checklist' && (
                <DailyChecklist onTaskToggled={loadUserData} />
              )}

              {/* Caregiver Tab 3: Mood */}
              {caregiverTab === 'mood' && (
                <TextFeelingModule onCheckInComplete={loadUserData} />
              )}

              {/* Caregiver Tab 4: Q&A */}
              {caregiverTab === 'qa' && (
                <PatientQAModule userRole="CAREGIVER" patientId={currentUser.id} />
              )}

              {/* Caregiver Tab 5: Education */}
              {caregiverTab === 'education' && (
                <EducationCenter userRole="CAREGIVER" currentUserId={currentUser.id} />
              )}

              {/* Caregiver Tab 6: Virtual Appointments */}
              {caregiverTab === 'appointments' && (
                <VirtualAppointmentsModule userRole="CAREGIVER" currentUserId={currentUser.id} />
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* WORKSPACE C: PATIENT PORTAL                               */}
          {/* ========================================================= */}
          {selectedRole === 'PATIENT' && (
            <div className="space-y-6">
              {/* Profile Summary Banner */}
              <div className="bg-[#DFD2F0]/40 dark:bg-zinc-900 border border-[#DFD2F0] dark:border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentUser.fullName || 'Patient'}</h2>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      Active Patient
                    </span>
                  </div>
                  <p className="text-xs text-purple-950 dark:text-purple-300 font-bold mt-1">
                    {patientData.diabetesType === 'type1' ? t.type1 : t.type2} • Emergency: {patientData.emergencyContactName || 'None'} ({patientData.emergencyContactPhone || 'None'})
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Caregiver Link */}
                  <button
                    type="button"
                    onClick={() => setIsCaregiverModalOpen(true)}
                    className="px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <HeartHandshake className="h-4 w-4" />
                    <span>Caregivers ({caregivers.length})</span>
                  </button>

                  {/* Generate Report */}
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-800 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Health Report</span>
                  </button>

                  {/* Book Specialist Consultation */}
                  <button
                    type="button"
                    onClick={() => setDashboardTab('appointments')}
                    className="px-3.5 py-2 rounded-2xl bg-purple hover:bg-purple/90 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Video className="h-4 w-4" />
                    <span>Book Specialist</span>
                  </button>

                  {/* Add Reminder */}
                  <button 
                    onClick={() => setShowScheduleModal(true)} 
                    className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Clock className="w-4 h-4" /> {t.addSchedule}
                  </button>
                </div>
              </div>

              {/* Patient Dashboard Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <button
                  onClick={() => setDashboardTab('overview')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    dashboardTab === 'overview'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <HeartPulse className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  {t.tabOverview}
                </button>

                <button
                  onClick={() => setDashboardTab('goals')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    dashboardTab === 'goals'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  {t.tabGoals}
                </button>

                <button
                  onClick={() => setDashboardTab('mood')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    dashboardTab === 'mood'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Smile className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  {t.tabMood}
                </button>

                <button
                  onClick={() => setDashboardTab('consultations')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    dashboardTab === 'consultations'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  {t.tabConsultations}
                </button>

                <button
                  onClick={() => setDashboardTab('education')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    dashboardTab === 'education'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  {t.tabEducation}
                </button>

                <button
                  onClick={() => setDashboardTab('qa')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    dashboardTab === 'qa'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  {t.tabQA}
                </button>

                <button
                  onClick={() => setDashboardTab('appointments')}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    dashboardTab === 'appointments'
                      ? 'bg-white dark:bg-zinc-900 text-teal-900 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  {t.tabAppointments || 'Virtual Appointments'}
                </button>
              </div>

              {/* TAB 1: OVERVIEW & VITALS */}
              {dashboardTab === 'overview' && (
                <div className="space-y-6">
                  {/* Feature 1: Weekly Activity Summary Card */}
                  <WeeklySummaryCard summary={weeklySummary} />

                  {/* Dynamic Daily Checklist Engine */}
                  <DailyChecklist onTaskToggled={loadUserData} />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Action Area */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* DYNAMIC VITAL ENTRY FORM */}
                      <form onSubmit={handleLogVitals} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                            <HeartPulse className="w-4 h-4 text-teal-700" />
                            {patientData.diabetesType === 'type1' ? 'Daily Glucose Log' : 'HbA1c & Blood Pressure Log'}
                          </h3>
                          {glucoseStatus && (
                            <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${glucoseStatus.color}`}>
                              {glucoseStatus.label}
                            </span>
                          )}
                        </div>

                        {/* Frequency & Routine Context Selection */}
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700 dark:text-zinc-300 mb-1.5">
                            Routine & Frequency Context *
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {VITAL_FREQUENCY_OPTIONS.map((opt) => (
                              <button
                                type="button"
                                key={opt.id}
                                onClick={() => setVitalFrequencyContext(opt.id)}
                                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                                  vitalFrequencyContext === opt.id
                                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200'
                                    : 'border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
                                }`}
                              >
                                <span className="block truncate">{opt.label}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{opt.period} routine</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Visual Time Selector Module */}
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-teal-700" />
                              Log Time: <span className="text-teal-700 dark:text-teal-400 font-black">{vitalTime}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setVitalTime(getCurrent12HourTime())}
                              className="text-[11px] font-black text-teal-700 hover:underline cursor-pointer"
                            >
                              Current Time (Now)
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {TIME_PRESETS.map((tPreset) => (
                              <button
                                key={tPreset}
                                type="button"
                                onClick={() => setVitalTime(tPreset)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                  vitalTime === tPreset
                                    ? 'bg-teal-700 text-white border-teal-700'
                                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                                }`}
                              >
                                {tPreset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Dynamic Inputs Based on Diabetes Type */}
                        {patientData.diabetesType === 'type1' ? (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t.glucoseLabel}</label>
                            <input 
                              type="number" step="0.1" required placeholder="e.g. 110"
                              value={bloodGlucoseLevel} onChange={(e) => setBloodGlucoseLevel(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t.hba1cLabel}</label>
                              <input 
                                type="number" step="0.1" required placeholder="e.g. 6.8"
                                value={hba1c} onChange={(e) => setHba1c(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t.bpLabel}</label>
                              <input 
                                type="text" required placeholder="e.g. 120/80"
                                value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                              />
                            </div>
                          </div>
                        )}

                        {/* Optional Weight Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t.weightLabel}</label>
                          <input 
                            type="number" step="0.1" placeholder="e.g. 68.5"
                            value={weight} onChange={(e) => setWeight(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                          />
                        </div>

                        {/* Captured Photo Strip Preview */}
                        {capturedStripPhoto && (
                          <div className="relative aspect-video max-h-40 rounded-2xl overflow-hidden border border-purple-300 dark:border-purple-800">
                            <img src={capturedStripPhoto} alt="Captured strip" className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Strip Photo Attached
                            </div>
                            <button
                              type="button"
                              onClick={() => setCapturedStripPhoto(null)}
                              className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md hover:bg-black"
                            >
                              Remove
                            </button>
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setIsCameraModalOpen(true)}
                            className="px-4 py-3 bg-[#DFD2F0]/40 hover:bg-[#DFD2F0]/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition border border-[#DFD2F0] dark:border-zinc-700 rounded-2xl text-purple-950 dark:text-purple-300 font-black text-xs flex items-center gap-2 cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-purple-900 dark:text-purple-300" /> {t.photoVerify}
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
                      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
                        <h3 className="text-xs font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider">{t.activeSchedules}</h3>
                        {schedules.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">{t.noSchedules}</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {schedules.map((item) => (
                              <div key={item.id} className="p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl flex justify-between items-center text-xs group hover:border-teal-300 transition">
                                <div>
                                  <span className="font-black text-slate-900 dark:text-white block">{item.name}</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-purple-900 dark:text-purple-300 uppercase font-black text-[10px]">{item.type}</span>
                                    <span className="text-slate-400 text-[10px]">•</span>
                                    <span className="bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                      {item.frequency || 'DAILY'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-[#DFD2F0] dark:bg-zinc-700 text-purple-950 dark:text-purple-300 px-2.5 py-1 rounded-xl font-bold">{item.time}</span>
                                  <button 
                                    onClick={() => handleDeleteSchedule(item.id)}
                                    className="opacity-60 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-red-600 cursor-pointer"
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
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 flex flex-col">
                      <h3 className="text-xs font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-700" /> {t.recordedHistory}
                      </h3>
                      {logs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">{t.noVitals}</p>
                      ) : (
                        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                          {logs.map((log) => (
                            <div key={log.id} className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-4 rounded-2xl space-y-2 animate-fade-in hover:border-teal-200 transition">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-slate-900 dark:text-white text-sm">{log.detail}</span>
                                <span className="bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-800 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
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
                </div>
              )}

              {/* TAB 2: GOALS & BADGES */}
              {dashboardTab === 'goals' && (
                <GoalsManager
                  goals={goals}
                  achievements={achievements}
                  onRefresh={loadUserData}
                  showToast={showToast}
                />
              )}

              {/* TAB 3: TEXT-FIRST FEELINGS JOURNAL */}
              {dashboardTab === 'mood' && (
                <TextFeelingModule onCheckInComplete={loadUserData} />
              )}

              {/* TAB 4: DOCTOR CONSULTATION NOTES */}
              {dashboardTab === 'consultations' && (
                <ConsultationNotesCard
                  notes={consultationNotes}
                  onRefresh={loadUserData}
                  showToast={showToast}
                />
              )}

              {/* TAB 5: EDUCATION CENTER */}
              {dashboardTab === 'education' && (
                <EducationCenter userRole={selectedRole} currentUserId={currentUser.id} />
              )}

              {/* TAB 6: SPECIALIST Q&A */}
              {dashboardTab === 'qa' && (
                <PatientQAModule userRole={selectedRole} patientId={currentUser.id} />
              )}

              {/* TAB 7: VIRTUAL APPOINTMENTS & TELEHEALTH */}
              {dashboardTab === 'appointments' && (
                <VirtualAppointmentsModule userRole={selectedRole} currentUserId={currentUser.id} />
              )}
            </div>
          )}

        </div>
      )}

      {/* ADD SCHEDULE MODAL WITH FREQUENCY & VISUAL TIME PICKER */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-xl border border-slate-200 dark:border-zinc-800">
            <h3 className="font-black text-slate-900 dark:text-white text-lg">Add Alert & Reminder Schedule</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">Category</label>
                <select 
                  value={scheduleType} onChange={(e) => setScheduleType(e.target.value as 'medication' | 'feeding')}
                  className="w-full bg-[#DFD2F0]/40 dark:bg-zinc-800 border border-[#DFD2F0] dark:border-zinc-700 font-black text-slate-900 dark:text-white rounded-2xl px-4 py-3 text-sm outline-none cursor-pointer"
                >
                  <option value="medication">Medication (e.g. Insulin, Metformin)</option>
                  <option value="feeding">Feeding / Meal Schedule</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">Schedule / Medicine Name</label>
                <input 
                  type="text" required placeholder={scheduleType === 'medication' ? 'e.g. Metformin 500mg' : 'e.g. Low sugar breakfast'}
                  value={scheduleName} onChange={(e) => setScheduleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              {/* Frequency Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">Frequency *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setScheduleFrequency(freq)}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                        scheduleFrequency === freq
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      {freq === 'DAILY' ? 'Daily' : freq === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Day of Week Selector */}
              {scheduleFrequency === 'WEEKLY' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1">Day of Week</label>
                  <select
                    value={scheduleFrequencyDays}
                    onChange={(e) => setScheduleFrequencyDays(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold rounded-2xl px-4 py-2.5 text-sm outline-none cursor-pointer"
                  >
                    <option value="Monday">Every Monday</option>
                    <option value="Tuesday">Every Tuesday</option>
                    <option value="Wednesday">Every Wednesday</option>
                    <option value="Thursday">Every Thursday</option>
                    <option value="Friday">Every Friday</option>
                    <option value="Saturday">Every Saturday</option>
                    <option value="Sunday">Every Sunday</option>
                  </select>
                </div>
              )}

              {/* Visual Time Selector Module */}
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-zinc-300">
                    Reminder Time: <span className="text-teal-700 font-black">{scheduleTime}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {TIME_PRESETS.map((tPreset) => (
                    <button
                      key={tPreset}
                      type="button"
                      onClick={() => setScheduleTime(tPreset)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        scheduleTime === tPreset
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      {tPreset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" onClick={() => setShowScheduleModal(false)}
                  className="w-1/2 py-3 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-1/2 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Verification Viewfinder Modal */}
      <LiveCameraVerification
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureComplete={(photoUrl) => {
          setCapturedStripPhoto(photoUrl);
          showToast('Live test strip photo captured and ready for verification.');
        }}
      />

      {/* Health Summary Report Modal */}
      <HealthReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        patientId={currentUser.id}
      />

      {/* Caregiver Linking Modal */}
      <CaregiverLinkingModal
        isOpen={isCaregiverModalOpen}
        onClose={() => setIsCaregiverModalOpen(false)}
        userRole={selectedRole}
        existingCaregivers={caregivers}
        onLinkSuccess={loadUserData}
      />

    </div>
  );
}