import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DiabetesType, MetricType, ScheduleType } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import prisma from '../prisma/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-hackathon-secret-key';

// Helper to normalize diabetes type from frontend ('type1'/'type2') to enum ('TYPE_1'/'TYPE_2')
const normalizeDiabetesType = (type?: string): DiabetesType => {
  if (!type) return DiabetesType.NONE;
  const upper = type.toUpperCase().replace(/\s+/g, '_');
  if (upper === 'TYPE1' || upper === 'TYPE_1') return DiabetesType.TYPE_1;
  if (upper === 'TYPE2' || upper === 'TYPE_2') return DiabetesType.TYPE_2;
  return DiabetesType.NONE;
};

// 1. Register Patient
export const registerPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, phone, email, password } = req.body;

    if (!fullName || !phone || !password) {
      res.status(400).json({ error: 'Full name, phone number, and password are required.' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'An account with this phone number or email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        phone,
        email: email || null,
        passwordHash,
        role: 'PATIENT',
        patientProfile: {
          create: {
            isProfileComplete: false
          }
        }
      },
      include: {
        patientProfile: true
      }
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newUser.id,
      fullName: newUser.fullName,
      isProfileComplete: false
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

// 2. Login Patient (supports phone OR email)
export const loginPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, phone, email, password } = req.body;
    const loginId = identifier || phone || email;

    if (!loginId || !password) {
      res.status(400).json({ error: 'Email/Phone and password are required.' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: loginId },
          { email: loginId }
        ]
      },
      include: {
        patientProfile: true
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. No user found.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid phone/email or password.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isProfileComplete: user.patientProfile?.isProfileComplete ?? false
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// 3. Get Patient Profile & History (Me)
export const getPatientMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
        vitalLogs: {
          orderBy: { loggedAt: 'desc' },
          take: 50
        },
        schedules: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
      profile: user.patientProfile,
      vitalLogs: user.vitalLogs,
      schedules: user.schedules
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile data.' });
  }
};

// 4. Save Medical Biodata
export const saveMedicalProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || req.body.userId;
    if (!userId) {
      res.status(401).json({ error: 'User ID is required.' });
      return;
    }

    const {
      emergencyContactName,
      emergencyContactPhone,
      diagnosisYear,
      diabetesType,
      gender,
      dateOfBirth,
      bloodGlucoseLevel,
      hba1c,
      bloodPressure,
      weight
    } = req.body;

    const parsedDiabetesType = normalizeDiabetesType(diabetesType);

    const updateData: any = {
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      diagnosisYear: diagnosisYear ? parseInt(String(diagnosisYear), 10) : null,
      diabetesType: parsedDiabetesType,
      gender: gender || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      isProfileComplete: true
    };

    if (parsedDiabetesType === DiabetesType.TYPE_1) {
      if (bloodGlucoseLevel) {
        const bgVal = parseFloat(String(bloodGlucoseLevel));
        updateData.bloodGlucoseLevel = bgVal;
        updateData.bloodGlucoseLoggedAt = new Date();

        // Create initial vital log
        await prisma.vitalLog.create({
          data: {
            userId,
            type: MetricType.BLOOD_GLUCOSE,
            detail: `Blood Glucose: ${bgVal} mg/dL`,
            value: bgVal,
            verified: true
          }
        });
      }
    } else if (parsedDiabetesType === DiabetesType.TYPE_2) {
      if (hba1c) updateData.hba1c = parseFloat(String(hba1c));
      if (bloodPressure) updateData.bloodPressure = String(bloodPressure);
      if (weight) updateData.weight = parseFloat(String(weight));

      if (hba1c || bloodPressure) {
        let detail = '';
        if (hba1c && bloodPressure) detail = `HbA1c: ${hba1c}% | BP: ${bloodPressure} mmHg`;
        else if (hba1c) detail = `HbA1c: ${hba1c}%`;
        else detail = `BP: ${bloodPressure} mmHg`;

        if (weight) detail += ` | Weight: ${weight} kg`;

        await prisma.vitalLog.create({
          data: {
            userId,
            type: hba1c ? MetricType.HBA1C : MetricType.BLOOD_PRESSURE,
            detail,
            value: hba1c ? parseFloat(String(hba1c)) : null,
            verified: true
          }
        });
      }
    }

    const updatedProfile = await prisma.patientProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData
      }
    });

    res.status(200).json({
      message: 'Medical profile saved successfully',
      isProfileComplete: updatedProfile.isProfileComplete,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Save medical profile error:', error);
    res.status(500).json({ error: 'Failed to save medical profile.' });
  }
};

// 5. Log Vitals
export const logVitals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { type, detail, value, bloodGlucoseLevel, hba1c, bloodPressure, weight } = req.body;

    let metricType: MetricType = MetricType.BLOOD_GLUCOSE;
    let detailStr = detail;
    let numValue = value ? parseFloat(String(value)) : undefined;

    if (bloodGlucoseLevel) {
      metricType = MetricType.BLOOD_GLUCOSE;
      numValue = parseFloat(String(bloodGlucoseLevel));
      detailStr = `Blood Glucose: ${numValue} mg/dL`;
      if (weight) detailStr += ` | Weight: ${weight} kg`;

      await prisma.patientProfile.updateMany({
        where: { userId },
        data: {
          bloodGlucoseLevel: numValue,
          bloodGlucoseLoggedAt: new Date(),
          ...(weight ? { weight: parseFloat(String(weight)) } : {})
        }
      });
    } else if (hba1c || bloodPressure) {
      metricType = hba1c ? MetricType.HBA1C : MetricType.BLOOD_PRESSURE;
      numValue = hba1c ? parseFloat(String(hba1c)) : undefined;
      detailStr = `HbA1c: ${hba1c || '-'}% | BP: ${bloodPressure || '-'} mmHg`;
      if (weight) detailStr += ` | Weight: ${weight} kg`;

      await prisma.patientProfile.updateMany({
        where: { userId },
        data: {
          ...(hba1c ? { hba1c: parseFloat(String(hba1c)) } : {}),
          ...(bloodPressure ? { bloodPressure: String(bloodPressure) } : {}),
          ...(weight ? { weight: parseFloat(String(weight)) } : {})
        }
      });
    }

    if (!detailStr) {
      res.status(400).json({ error: 'Please provide vital readings to log.' });
      return;
    }

    const newLog = await prisma.vitalLog.create({
      data: {
        userId,
        type: metricType,
        detail: detailStr,
        value: numValue,
        verified: true
      }
    });

    res.status(201).json({
      message: 'Vital logged successfully',
      log: newLog
    });
  } catch (error) {
    console.error('Log vitals error:', error);
    res.status(500).json({ error: 'Failed to record vital log.' });
  }
};

// 6. Get Vital Logs
export const getVitalLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const logs = await prisma.vitalLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' }
    });

    res.status(200).json({ vitalLogs: logs });
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ error: 'Failed to fetch vitals history.' });
  }
};

// 7. Add Schedule
export const createSchedule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { type, name, time } = req.body;
    if (!name || !time) {
      res.status(400).json({ error: 'Schedule name and time are required.' });
      return;
    }

    const scheduleType = String(type).toLowerCase() === 'feeding'
      ? ScheduleType.FEEDING
      : ScheduleType.MEDICATION;

    const newSchedule = await prisma.schedule.create({
      data: {
        userId,
        type: scheduleType,
        name,
        time
      }
    });

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule: newSchedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to add schedule.' });
  }
};

// 8. Get Schedules
export const getSchedules = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const schedules = await prisma.schedule.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules.' });
  }
};

// 9. Delete Schedule
export const deleteSchedule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId || !id) {
      res.status(400).json({ error: 'Schedule ID required.' });
      return;
    }

    await prisma.schedule.deleteMany({
      where: { id, userId }
    });

    res.status(200).json({ message: 'Schedule removed successfully.' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule.' });
  }
};