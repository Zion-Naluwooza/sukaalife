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
  deleteSchedule
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

export default router;