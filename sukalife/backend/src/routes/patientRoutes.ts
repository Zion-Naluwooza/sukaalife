import { Router } from 'express';
import {
  registerPatient,
  loginPatient,
  getPatientMe,
  saveMedicalProfile,
  saveSpecialistProfile,
  saveCaregiverProfile,
  createCaregiverInvite,
  linkCaregiver,
  logVitals,
  getVitalLogs,
  createSchedule,
  getSchedules,
  deleteSchedule,
  getWeeklyActivitySummary,
  getGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal,
  getMoodLogs,
  createMoodLog,
  deleteMoodLog,
  getConsultationNotes,
  createConsultationNote,
  updateConsultationNote,
  deleteConsultationNote,
  getEducationResources,
  createEducationResource,
  deleteEducationResource,
  askQuestion,
  getQuestions,
  answerQuestion,
  generateHealthReport,
  getDailyChecklist,
  toggleDailyTask,
  createAppointmentPackage,
  getAppointmentPackages,
  getSpecialistDoctorProfile,
  deleteAppointmentPackage,
  bookAppointment,
  getMyAppointments,
  updateBookingStatus
} from '../controllers/patientController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', registerPatient);
router.post('/login', loginPatient);

// Authenticated Patient / User Profile
router.get('/me', authenticateUser as any, getPatientMe as any);
router.post('/medical-profile', authenticateUser as any, saveMedicalProfile as any);

// Specialist & Caregiver Setup
router.post('/specialists/profile', authenticateUser as any, saveSpecialistProfile as any);
router.get('/specialists/:id/profile', authenticateUser as any, getSpecialistDoctorProfile as any);
router.post('/caregivers/profile', authenticateUser as any, saveCaregiverProfile as any);

// Caregiver Linking
router.post('/caregivers/invite', authenticateUser as any, createCaregiverInvite as any);
router.post('/caregivers/link', authenticateUser as any, linkCaregiver as any);

// Feature 1: Vitals & Alert Schedules
router.post('/vitals', authenticateUser as any, logVitals as any);
router.get('/vitals', authenticateUser as any, getVitalLogs as any);
router.post('/schedules', authenticateUser as any, createSchedule as any);
router.get('/schedules', authenticateUser as any, getSchedules as any);
router.delete('/schedules/:id', authenticateUser as any, deleteSchedule as any);

// Feature 1b: Weekly Activity Summary
router.get('/activity/weekly-summary', authenticateUser as any, getWeeklyActivitySummary as any);

// Feature 2: Goals & Achievements
router.get('/goals', authenticateUser as any, getGoals as any);
router.post('/goals', authenticateUser as any, createGoal as any);
router.patch('/goals/:id', authenticateUser as any, updateGoalProgress as any);
router.delete('/goals/:id', authenticateUser as any, deleteGoal as any);

// Feature 3: Mood / Feelings
router.get('/mood', authenticateUser as any, getMoodLogs as any);
router.post('/mood', authenticateUser as any, createMoodLog as any);
router.delete('/mood/:id', authenticateUser as any, deleteMoodLog as any);

// Feature 4: Consultation Notes
router.get('/consultations', authenticateUser as any, getConsultationNotes as any);
router.post('/consultations', authenticateUser as any, createConsultationNote as any);
router.put('/consultations/:id', authenticateUser as any, updateConsultationNote as any);
router.delete('/consultations/:id', authenticateUser as any, deleteConsultationNote as any);

// Feature 5: Education Center & Knowledge Base
router.get('/education', getEducationResources);
router.post('/education', authenticateUser as any, createEducationResource as any);
router.delete('/education/:id', authenticateUser as any, deleteEducationResource as any);

// Feature 6: Patient Q&A with Specialist Routing
router.post('/qa/questions', authenticateUser as any, askQuestion as any);
router.get('/qa/questions', authenticateUser as any, getQuestions as any);
router.post('/qa/questions/:id/answers', authenticateUser as any, answerQuestion as any);

// Feature 7: Health Report Generator
router.get('/reports/health-summary', authenticateUser as any, generateHealthReport as any);

// Feature 8: Dynamic Daily Checklist
router.get('/checklist/today', authenticateUser as any, getDailyChecklist as any);
router.post('/checklist/toggle', authenticateUser as any, toggleDailyTask as any);

// Feature 9: Virtual Appointment Packages & Bookings
router.get('/appointments/packages', authenticateUser as any, getAppointmentPackages as any);
router.post('/appointments/packages', authenticateUser as any, createAppointmentPackage as any);
router.delete('/appointments/packages/:id', authenticateUser as any, deleteAppointmentPackage as any);
router.get('/appointments/bookings', authenticateUser as any, getMyAppointments as any);
router.post('/appointments/bookings', authenticateUser as any, bookAppointment as any);
router.patch('/appointments/bookings/:id', authenticateUser as any, updateBookingStatus as any);

export default router;