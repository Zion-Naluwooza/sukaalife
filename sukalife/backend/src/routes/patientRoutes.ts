import { Router } from 'express';
import { registerPatient, loginPatient, saveMedicalProfile } from '../controllers/patientController';

const router = Router();

router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.post('/medical-profile', saveMedicalProfile);

export default router;