import { Router } from 'express';
import {
  registerPatient,
  loginPatient,
  getPatientMe,
  saveMedicalProfile,
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
  deleteConsultationNote
} from '../controllers/patientController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', registerPatient);
router.post('/login', loginPatient);

// Protected Patient Endpoints
router.get('/me', authenticateUser as any, getPatientMe as any);
router.post('/medical-profile', authenticateUser as any, saveMedicalProfile as any);

// Vitals Logging Endpoints
router.post('/vitals', authenticateUser as any, logVitals as any);
router.get('/vitals', authenticateUser as any, getVitalLogs as any);

// Schedules Endpoints
router.post('/schedules', authenticateUser as any, createSchedule as any);
router.get('/schedules', authenticateUser as any, getSchedules as any);
router.delete('/schedules/:id', authenticateUser as any, deleteSchedule as any);

// Feature 1: Weekly Activity Summary
router.get('/activity/weekly-summary', authenticateUser as any, getWeeklyActivitySummary as any);

// Feature 2: Goals & Achievements
router.get('/goals', authenticateUser as any, getGoals as any);
router.post('/goals', authenticateUser as any, createGoal as any);
router.patch('/goals/:id', authenticateUser as any, updateGoalProgress as any);
router.delete('/goals/:id', authenticateUser as any, deleteGoal as any);

// Feature 3: Mood / Feeling Logs
router.get('/mood', authenticateUser as any, getMoodLogs as any);
router.post('/mood', authenticateUser as any, createMoodLog as any);
router.delete('/mood/:id', authenticateUser as any, deleteMoodLog as any);

// Feature 4: Consultation Notes
router.get('/consultations', authenticateUser as any, getConsultationNotes as any);
router.post('/consultations', authenticateUser as any, createConsultationNote as any);
router.put('/consultations/:id', authenticateUser as any, updateConsultationNote as any);
router.delete('/consultations/:id', authenticateUser as any, deleteConsultationNote as any);

export default router;