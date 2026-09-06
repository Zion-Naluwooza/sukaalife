import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DiabetesType, MetricType, ScheduleType, GoalCategory, MoodState, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import prisma from '../prisma/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-hackathon-secret-key';

// Helper to normalize diabetes type
const normalizeDiabetesType = (type?: string): DiabetesType => {
  if (!type) return DiabetesType.NONE;
  const upper = type.toUpperCase().replace(/\s+/g, '_');
  if (upper === 'TYPE1' || upper === 'TYPE_1') return DiabetesType.TYPE_1;
  if (upper === 'TYPE2' || upper === 'TYPE_2') return DiabetesType.TYPE_2;
  return DiabetesType.NONE;
};

// 1. Unified Multi-Role Registration
export const registerPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, phone, email, password, role, specialty, licenseNumber, hospitalAffiliation, relationship } = req.body;

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

    let assignedRole: Role = Role.PATIENT;
    const roleUpper = String(role || 'PATIENT').toUpperCase();
    if (roleUpper === 'SPECIALIST') assignedRole = Role.SPECIALIST;
    else if (roleUpper === 'CAREGIVER') assignedRole = Role.CAREGIVER;

    const newUser = await prisma.user.create({
      data: {
        fullName,
        phone,
        email: email || null,
        passwordHash,
        role: assignedRole,
        ...(assignedRole === Role.PATIENT
          ? {
              patientProfile: {
                create: { isProfileComplete: false }
              },
              achievements: {
                create: {
                  badgeKey: 'WELCOME',
                  title: 'Welcome to Sukaalife',
                  description: 'Started your digital diabetes journey.',
                  iconName: 'Award'
                }
              }
            }
          : {}),
        ...(assignedRole === Role.SPECIALIST
          ? {
              specialistProfile: {
                create: {
                  specialty: specialty || 'Endocrinologist',
                  hospitalAffiliation: hospitalAffiliation || 'Mulago National Referral Hospital',
                  isProfileComplete: false,
                  isVerified: true
                }
              }
            }
          : {}),
        ...(assignedRole === Role.CAREGIVER
          ? {
              caregiverProfile: {
                create: {
                  relationship: relationship || 'Family Caregiver',
                  isProfileComplete: false
                }
              }
            }
          : {})
      },
      include: {
        patientProfile: true,
        specialistProfile: true,
        caregiverProfile: true
      }
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const isComplete = assignedRole === Role.SPECIALIST
      ? (newUser.specialistProfile?.isProfileComplete ?? false)
      : assignedRole === Role.CAREGIVER
      ? (newUser.caregiverProfile?.isProfileComplete ?? false)
      : (newUser.patientProfile?.isProfileComplete ?? false);

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newUser.id,
      fullName: newUser.fullName,
      role: newUser.role,
      isProfileComplete: isComplete
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

// 2. Unified Multi-Role Login
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
        patientProfile: true,
        specialistProfile: true,
        caregiverProfile: true
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

    const isComplete = user.role === 'SPECIALIST'
      ? (user.specialistProfile?.isProfileComplete ?? false)
      : user.role === 'CAREGIVER'
      ? (user.caregiverProfile?.isProfileComplete ?? false)
      : (user.patientProfile?.isProfileComplete ?? false);

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isProfileComplete: isComplete,
      profile: user.patientProfile || user.specialistProfile || user.caregiverProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// 3. Get Unified Profile & Session Data
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
        specialistProfile: true,
        caregiverProfile: true,
        vitalLogs: {
          orderBy: { loggedAt: 'desc' },
          take: 50
        },
        schedules: {
          orderBy: { createdAt: 'desc' }
        },
        healthGoals: {
          include: {
            logs: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        achievements: {
          orderBy: { unlockedAt: 'desc' }
        },
        moodLogs: {
          orderBy: { loggedAt: 'desc' },
          take: 30
        },
        consultationNotes: {
          orderBy: { visitDate: 'desc' },
          take: 20
        },
        caregiverRelations: {
          include: { caregiver: { select: { id: true, fullName: true, phone: true } } }
        },
        patientRelations: {
          include: { patient: { select: { id: true, fullName: true, phone: true, patientProfile: true } } }
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
      profile: user.patientProfile || user.specialistProfile || user.caregiverProfile,
      vitalLogs: user.vitalLogs,
      schedules: user.schedules,
      healthGoals: user.healthGoals,
      achievements: user.achievements,
      moodLogs: user.moodLogs,
      consultationNotes: user.consultationNotes,
      caregivers: user.caregiverRelations.map(r => ({ id: r.id, caregiver: r.caregiver, status: r.status, inviteCode: r.inviteCode })),
      assignedPatients: user.patientRelations.map(r => ({ id: r.id, patient: r.patient, status: r.status }))
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile data.' });
  }
};

// 4. Save Medical Biodata (Patient)
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

// 5. Specialist Onboarding / Profile Update
export const saveSpecialistProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const {
      specialty,
      isLicensed,
      licenseNumber,
      hospitalAffiliation,
      gender,
      district,
      yearsPracticing,
      yearsExperience,
      qualifications,
      bio
    } = req.body;

    const profileData = {
      specialty: specialty || 'Endocrinologist',
      isLicensed: typeof isLicensed === 'boolean' ? isLicensed : true,
      licenseNumber: licenseNumber || null,
      hospitalAffiliation: hospitalAffiliation || 'Mulago National Referral Hospital',
      gender: gender || null,
      district: district || 'Kampala',
      yearsPracticing: yearsPracticing ? String(yearsPracticing) : null,
      yearsExperience: yearsExperience ? parseInt(String(yearsExperience), 10) : 0,
      qualifications: qualifications || null,
      bio: bio || null,
      isVerified: true,
      isProfileComplete: true
    };

    const profile = await prisma.specialistProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData
      }
    });

    res.status(200).json({
      message: 'Specialist profile saved successfully',
      isProfileComplete: true,
      specialistProfile: profile,
      profile
    });
  } catch (error) {
    console.error('Save specialist profile error:', error);
    res.status(500).json({ error: 'Failed to update specialist profile.' });
  }
};

// 5b. Caregiver Onboarding / Profile Update
export const saveCaregiverProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const {
      relationship,
      knowledgeLevel,
      age,
      gender,
      caretakerType
    } = req.body;

    const profileData = {
      relationship: relationship || 'Family Caregiver',
      knowledgeLevel: knowledgeLevel || 'Basic',
      age: age ? parseInt(String(age), 10) : null,
      gender: gender || null,
      caretakerType: caretakerType || 'Live-in care taker',
      isProfileComplete: true
    };

    const profile = await prisma.caregiverProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData
      }
    });

    res.status(200).json({
      message: 'Caregiver profile saved successfully',
      isProfileComplete: true,
      caregiverProfile: profile,
      profile
    });
  } catch (error) {
    console.error('Save caregiver profile error:', error);
    res.status(500).json({ error: 'Failed to update caregiver profile.' });
  }
};

// 6. Caregiver Linking: Generate Invite Code or Link via Phone
export const createCaregiverInvite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let existingInvite = await prisma.patientCaregiver.findFirst({
      where: { patientId: userId, status: 'PENDING' }
    });

    let inviteCode = existingInvite?.inviteCode;
    if (!inviteCode) {
      inviteCode = `SUKA-${Math.floor(1000 + Math.random() * 9000)}`;
      if (existingInvite) {
        await prisma.patientCaregiver.update({
          where: { id: existingInvite.id },
          data: { inviteCode }
        });
      } else {
        await prisma.patientCaregiver.create({
          data: {
            patientId: userId,
            caregiverId: userId,
            inviteCode,
            status: 'PENDING'
          }
        });
      }
    }

    res.status(201).json({
      message: 'Caregiver invite code generated',
      inviteCode
    });
  } catch (error) {
    console.error('Caregiver invite error:', error);
    res.status(500).json({ error: 'Failed to generate caregiver invite code.' });
  }
};

export const linkCaregiver = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const caregiverId = req.user?.userId;
    const { inviteCode, patientPhone } = req.body;

    if (!caregiverId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let targetPatientId: string | null = null;

    if (inviteCode) {
      const pendingLink = await prisma.patientCaregiver.findFirst({
        where: { inviteCode, status: 'PENDING' }
      });
      if (!pendingLink) {
        res.status(404).json({ error: 'Invalid or expired invite code.' });
        return;
      }
      targetPatientId = pendingLink.patientId;

      await prisma.patientCaregiver.delete({ where: { id: pendingLink.id } });
    } else if (patientPhone) {
      const patient = await prisma.user.findUnique({
        where: { phone: patientPhone }
      });
      if (!patient) {
        res.status(404).json({ error: 'No patient found with this phone number.' });
        return;
      }
      targetPatientId = patient.id;
    }

    if (!targetPatientId) {
      res.status(400).json({ error: 'Please provide an invite code or patient phone number.' });
      return;
    }

    const linked = await prisma.patientCaregiver.upsert({
      where: {
        patientId_caregiverId: {
          patientId: targetPatientId,
          caregiverId
        }
      },
      update: { status: 'ACTIVE' },
      create: {
        patientId: targetPatientId,
        caregiverId,
        status: 'ACTIVE'
      },
      include: {
        patient: { select: { id: true, fullName: true, phone: true } }
      }
    });

    res.status(200).json({
      message: `Successfully linked to patient ${linked.patient.fullName}!`,
      patient: linked.patient
    });
  } catch (error) {
    console.error('Link caregiver error:', error);
    res.status(500).json({ error: 'Failed to link caregiver.' });
  }
};

// 7. Log Vitals (with live photo verification support)
export const logVitals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authUserId = req.user?.userId;
    const targetUserId = req.body.patientId || authUserId;

    if (!targetUserId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { detail, value, bloodGlucoseLevel, hba1c, bloodPressure, weight, photoUrl, frequencyContext } = req.body;

    let metricType: MetricType = MetricType.BLOOD_GLUCOSE;
    let detailStr = detail;
    let numValue = value ? parseFloat(String(value)) : undefined;

    if (bloodGlucoseLevel) {
      metricType = MetricType.BLOOD_GLUCOSE;
      numValue = parseFloat(String(bloodGlucoseLevel));
      detailStr = `Blood Glucose: ${numValue} mg/dL`;
      if (frequencyContext) {
        detailStr += ` (${frequencyContext.replace('_', ' ')})`;
      }
      if (weight) detailStr += ` | Weight: ${weight} kg`;

      await prisma.patientProfile.updateMany({
        where: { userId: targetUserId },
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
        where: { userId: targetUserId },
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
        userId: targetUserId,
        type: metricType,
        detail: detailStr,
        value: numValue,
        photoUrl: photoUrl || null,
        frequencyContext: frequencyContext || null,
        verified: !!photoUrl || true
      }
    });

    // Auto-progress active glucose goals
    if (metricType === MetricType.BLOOD_GLUCOSE) {
      await prisma.healthGoal.updateMany({
        where: { userId: targetUserId, category: 'GLUCOSE', isCompleted: false },
        data: { currentProgress: { increment: 1 } }
      });
    }

    res.status(201).json({
      message: 'Vital logged successfully',
      log: newLog
    });
  } catch (error) {
    console.error('Log vitals error:', error);
    res.status(500).json({ error: 'Failed to record vital log.' });
  }
};

export const getVitalLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.patientId as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const logs = await prisma.vitalLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' }
    });

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ error: 'Failed to fetch vitals history.' });
  }
};

// 8. Schedules
export const createSchedule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.body.patientId || req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { type, name, time, frequency, frequencyDays } = req.body;
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
        time,
        frequency: frequency || 'DAILY',
        frequencyDays: frequencyDays || '1,2,3,4,5,6,7'
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

export const getSchedules = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.patientId as string || req.user?.userId;
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

// 9. Weekly Activity Summary
export const getWeeklyActivitySummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.patientId as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const [weekVitals, weekMoods, schedules] = await Promise.all([
      prisma.vitalLog.findMany({
        where: {
          userId,
          loggedAt: { gte: monday, lte: sunday }
        }
      }),
      prisma.moodLog.findMany({
        where: {
          userId,
          loggedAt: { gte: monday, lte: sunday }
        }
      }),
      prisma.schedule.findMany({
        where: { userId }
      })
    ]);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyActivity = dayNames.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];

      const vitalsCount = weekVitals.filter(v => v.loggedAt.toISOString().startsWith(dateStr)).length;
      const moodsCount = weekMoods.filter(m => m.loggedAt.toISOString().startsWith(dateStr)).length;

      return {
        day: dayName,
        date: dateStr,
        vitalsCount,
        moodsCount,
        total: vitalsCount + moodsCount
      };
    });

    const glucoseLogsCount = weekVitals.filter(v => v.type === MetricType.BLOOD_GLUCOSE).length;
    const bpLogsCount = weekVitals.filter(v => v.type === MetricType.BLOOD_PRESSURE || v.type === MetricType.HBA1C).length;

    const allPastLogs = await prisma.vitalLog.findMany({
      where: { userId },
      select: { loggedAt: true },
      orderBy: { loggedAt: 'desc' }
    });

    const loggedDatesSet = new Set(
      allPastLogs.map(l => l.loggedAt.toISOString().split('T')[0])
    );

    let streakDays = 0;
    let checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];
    if (!loggedDatesSet.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (loggedDatesSet.has(dStr)) {
        streakDays += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const totalLogsThisWeek = weekVitals.length + weekMoods.length;

    res.status(200).json({
      streakDays,
      totalLogsThisWeek,
      breakdown: {
        glucoseLogs: glucoseLogsCount,
        bpAndHbA1cLogs: bpLogsCount,
        medicationReminders: schedules.length,
        moodCheckIns: weekMoods.length
      },
      dailyActivity
    });
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({ error: 'Failed to compute weekly activity summary.' });
  }
};

// 10. Goals & Achievements
export const getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.patientId as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const [goals, achievements] = await Promise.all([
      prisma.healthGoal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' }
      })
    ]);

    res.status(200).json({ goals, achievements });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to retrieve goals and achievements.' });
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.body.patientId || req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { title, targetValue, unit, category, frequencyPerWeek } = req.body;
    if (!title || !targetValue) {
      res.status(400).json({ error: 'Goal title and target value are required.' });
      return;
    }

    let parsedCategory: GoalCategory = GoalCategory.GENERAL;
    if (category) {
      const catUpper = String(category).toUpperCase();
      if (catUpper === 'GLUCOSE') parsedCategory = GoalCategory.GLUCOSE;
      else if (catUpper === 'MEDICATION') parsedCategory = GoalCategory.MEDICATION;
      else if (catUpper === 'EXERCISE') parsedCategory = GoalCategory.EXERCISE;
      else if (catUpper === 'DIET') parsedCategory = GoalCategory.DIET;
    }

    const newGoal = await prisma.healthGoal.create({
      data: {
        userId,
        title,
        targetValue: parseInt(String(targetValue), 10),
        currentProgress: 0,
        unit: unit || 'times',
        category: parsedCategory,
        frequencyPerWeek: frequencyPerWeek ? parseInt(String(frequencyPerWeek), 10) : 7,
        isCompleted: false
      }
    });

    res.status(201).json({
      message: 'Goal created successfully',
      goal: newGoal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create health goal.' });
  }
};

export const updateGoalProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { incrementBy, setProgress, isCompleted, reflectionNote, effortLevel } = req.body;

    if (!userId || !id) {
      res.status(400).json({ error: 'Goal ID is required.' });
      return;
    }

    const goal = await prisma.healthGoal.findFirst({
      where: { id }
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found.' });
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // If incrementing progress, enforce 1 check-in per calendar day rule
    if (typeof incrementBy === 'number' && incrementBy > 0) {
      const alreadyLoggedToday = await prisma.goalLog.findUnique({
        where: {
          goalId_date: {
            goalId: id,
            date: todayDate
          }
        }
      });

      if (alreadyLoggedToday) {
        res.status(400).json({
          error: 'You have already checked in for this goal today! Next daily check-in will be available tomorrow.'
        });
        return;
      }

      // Record today's goal reflection
      await prisma.goalLog.create({
        data: {
          goalId: id,
          userId,
          date: todayDate,
          reflectionNote: reflectionNote ? String(reflectionNote).trim() : 'Goal check-in recorded',
          effortLevel: effortLevel || 'NORMAL'
        }
      });
    }

    let newProgress = goal.currentProgress;
    if (typeof setProgress === 'number') {
      newProgress = setProgress;
    } else if (typeof incrementBy === 'number') {
      newProgress += incrementBy;
    } else {
      newProgress += 1;
    }

    const completed = typeof isCompleted === 'boolean'
      ? isCompleted
      : newProgress >= goal.targetValue;

    const updatedGoal = await prisma.healthGoal.update({
      where: { id },
      data: {
        currentProgress: newProgress,
        isCompleted: completed
      },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (completed) {
      const existingAchievement = await prisma.achievement.findFirst({
        where: { userId: goal.userId, badgeKey: 'GOAL_CRUSHER' }
      });

      if (!existingAchievement) {
        await prisma.achievement.create({
          data: {
            userId: goal.userId,
            badgeKey: 'GOAL_CRUSHER',
            title: 'Goal Crusher',
            description: 'Completed a weekly health target successfully!',
            iconName: 'Trophy'
          }
        });
      }
    }

    res.status(200).json({
      message: 'Goal updated successfully',
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal progress.' });
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId || !id) {
      res.status(400).json({ error: 'Goal ID required.' });
      return;
    }

    await prisma.healthGoal.deleteMany({
      where: { id }
    });

    res.status(200).json({ message: 'Goal removed successfully.' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal.' });
  }
};

// 11. Text-First Feelings & Mood Logs
export const getMoodLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.patientId as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const moodLogs = await prisma.moodLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 50
    });

    res.status(200).json({ moodLogs });
  } catch (error) {
    console.error('Get mood logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve mood check-in logs.' });
  }
};

export const createMoodLog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.body.patientId || req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { mood, energyLevel, symptoms, feelingText, notes } = req.body;

    let moodEnum: MoodState = MoodState.NEUTRAL;
    if (mood) {
      const moodUpper = String(mood).toUpperCase().replace(/\s+/g, '_');
      if (Object.values(MoodState).includes(moodUpper as MoodState)) {
        moodEnum = moodUpper as MoodState;
      }
    }

    const newMoodLog = await prisma.moodLog.create({
      data: {
        userId,
        mood: moodEnum,
        energyLevel: energyLevel ? parseInt(String(energyLevel), 10) : 4,
        symptoms: symptoms ? (Array.isArray(symptoms) ? symptoms.join(', ') : String(symptoms)) : null,
        feelingText: feelingText ? String(feelingText).trim() : null,
        notes: notes ? String(notes).trim() : null
      }
    });

    res.status(201).json({
      message: 'Feelings check-in recorded successfully',
      moodLog: newMoodLog
    });
  } catch (error) {
    console.error('Create mood log error:', error);
    res.status(500).json({ error: 'Failed to record feelings check-in.' });
  }
};

export const deleteMoodLog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId || !id) {
      res.status(400).json({ error: 'Mood log ID is required.' });
      return;
    }

    await prisma.moodLog.deleteMany({
      where: { id }
    });

    res.status(200).json({ message: 'Mood log removed successfully.' });
  } catch (error) {
    console.error('Delete mood log error:', error);
    res.status(500).json({ error: 'Failed to delete mood log.' });
  }
};

// 12. Consultation Notes
export const getConsultationNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.query.patientId as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const notes = await prisma.consultationNote.findMany({
      where: { userId },
      orderBy: { visitDate: 'desc' }
    });

    res.status(200).json({ consultationNotes: notes });
  } catch (error) {
    console.error('Get consultation notes error:', error);
    res.status(500).json({ error: 'Failed to retrieve consultation notes.' });
  }
};

export const createConsultationNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.body.patientId || req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { doctorName, clinicName, visitDate, chiefReason, doctorAdvice, prescriptions, nextAppointment } = req.body;
    if (!doctorAdvice) {
      res.status(400).json({ error: 'Doctor advice or clinical notes are required.' });
      return;
    }

    const newNote = await prisma.consultationNote.create({
      data: {
        userId,
        doctorName: doctorName || null,
        clinicName: clinicName || null,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        chiefReason: chiefReason || null,
        doctorAdvice,
        prescriptions: prescriptions || null,
        nextAppointment: nextAppointment ? new Date(nextAppointment) : null
      }
    });

    res.status(201).json({
      message: 'Consultation note saved successfully',
      consultationNote: newNote
    });
  } catch (error) {
    console.error('Create consultation note error:', error);
    res.status(500).json({ error: 'Failed to save consultation note.' });
  }
};

export const updateConsultationNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId || !id) {
      res.status(400).json({ error: 'Note ID is required.' });
      return;
    }

    const { doctorName, clinicName, visitDate, chiefReason, doctorAdvice, prescriptions, nextAppointment } = req.body;

    const existingNote = await prisma.consultationNote.findFirst({
      where: { id }
    });

    if (!existingNote) {
      res.status(404).json({ error: 'Consultation note not found.' });
      return;
    }

    const updatedNote = await prisma.consultationNote.update({
      where: { id },
      data: {
        doctorName: doctorName !== undefined ? doctorName : existingNote.doctorName,
        clinicName: clinicName !== undefined ? clinicName : existingNote.clinicName,
        visitDate: visitDate ? new Date(visitDate) : existingNote.visitDate,
        chiefReason: chiefReason !== undefined ? chiefReason : existingNote.chiefReason,
        doctorAdvice: doctorAdvice || existingNote.doctorAdvice,
        prescriptions: prescriptions !== undefined ? prescriptions : existingNote.prescriptions,
        nextAppointment: nextAppointment ? new Date(nextAppointment) : existingNote.nextAppointment
      }
    });

    res.status(200).json({
      message: 'Consultation note updated successfully',
      consultationNote: updatedNote
    });
  } catch (error) {
    console.error('Update consultation note error:', error);
    res.status(500).json({ error: 'Failed to update consultation note.' });
  }
};

export const deleteConsultationNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId || !id) {
      res.status(400).json({ error: 'Note ID is required.' });
      return;
    }

    await prisma.consultationNote.deleteMany({
      where: { id }
    });

    res.status(200).json({ message: 'Consultation note deleted successfully.' });
  } catch (error) {
    console.error('Delete consultation note error:', error);
    res.status(500).json({ error: 'Failed to delete consultation note.' });
  }
};

// ==========================================
// FEATURE 2: EDUCATION CENTER & KNOWLEDGE BASE
// ==========================================
export const getEducationResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, language, contentType } = req.query;

    const resources = await prisma.educationResource.findMany({
      where: {
        isPublished: true,
        ...(category ? { category: String(category) } : {}),
        ...(language ? { targetLanguage: String(language) } : {}),
        ...(contentType ? { contentType: String(contentType) } : {})
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            specialistProfile: { select: { specialty: true, hospitalAffiliation: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ resources });
  } catch (error) {
    console.error('Get education resources error:', error);
    res.status(500).json({ error: 'Failed to retrieve education resources.' });
  }
};

export const createEducationResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authorId = req.user?.userId;
    if (!authorId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { title, description, contentType, mediaUrl, category, targetLanguage, tags } = req.body;
    if (!title || !description || !contentType) {
      res.status(400).json({ error: 'Title, description, and content type are required.' });
      return;
    }

    const resource = await prisma.educationResource.create({
      data: {
        authorId,
        title,
        description,
        contentType: String(contentType).toUpperCase(),
        mediaUrl: mediaUrl || null,
        category: category || 'GENERAL',
        targetLanguage: targetLanguage || 'English',
        tags: tags || null,
        isPublished: true
      }
    });

    res.status(201).json({
      message: 'Educational resource published successfully',
      resource
    });
  } catch (error) {
    console.error('Create education resource error:', error);
    res.status(500).json({ error: 'Failed to publish educational resource.' });
  }
};

export const deleteEducationResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authorId = req.user?.userId;
    const { id } = req.params;

    if (!authorId || !id) {
      res.status(400).json({ error: 'Resource ID required.' });
      return;
    }

    await prisma.educationResource.deleteMany({
      where: { id, authorId }
    });

    res.status(200).json({ message: 'Resource removed.' });
  } catch (error) {
    console.error('Delete education resource error:', error);
    res.status(500).json({ error: 'Failed to remove educational resource.' });
  }
};

// ==========================================
// FEATURE 3: PATIENT Q&A SYSTEM
// ==========================================
export const askQuestion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.body.patientId || req.user?.userId;
    if (!patientId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { title, questionText, category, urgency } = req.body;
    if (!title || !questionText) {
      res.status(400).json({ error: 'Question title and details are required.' });
      return;
    }

    const question = await prisma.patientQuestion.create({
      data: {
        patientId,
        title,
        questionText,
        category: category || 'GENERAL',
        urgency: urgency || 'NORMAL',
        status: 'OPEN'
      }
    });

    res.status(201).json({
      message: 'Question submitted to specialist queue',
      question
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({ error: 'Failed to submit question.' });
  }
};

export const getQuestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let questions;
    if (userRole === 'SPECIALIST') {
      // Specialist sees all questions in queue
      questions = await prisma.patientQuestion.findMany({
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              patientProfile: true
            }
          },
          answers: {
            include: {
              specialist: {
                select: {
                  id: true,
                  fullName: true,
                  specialistProfile: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Patient sees their own questions
      questions = await prisma.patientQuestion.findMany({
        where: { patientId: userId },
        include: {
          answers: {
            include: {
              specialist: {
                select: {
                  id: true,
                  fullName: true,
                  specialistProfile: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to retrieve questions.' });
  }
};

export const answerQuestion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const specialistId = req.user?.userId;
    const { id } = req.params;
    const { answerText } = req.body;

    if (!specialistId || !id || !answerText) {
      res.status(400).json({ error: 'Question ID and answer text are required.' });
      return;
    }

    const [answer] = await prisma.$transaction([
      prisma.questionAnswer.create({
        data: {
          questionId: id,
          specialistId,
          answerText
        }
      }),
      prisma.patientQuestion.update({
        where: { id },
        data: { status: 'ANSWERED' }
      })
    ]);

    res.status(201).json({
      message: 'Answer posted successfully',
      answer
    });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ error: 'Failed to post specialist answer.' });
  }
};

// ==========================================
// FEATURE 4: HEALTH REPORT GENERATOR
// ==========================================
export const generateHealthReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authUserId = req.user?.userId;
    const targetUserId = req.query.patientId as string || authUserId;
    const range = req.query.range as string || '30d';

    if (!targetUserId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [user, vitals, schedules, moods, consultations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: targetUserId },
        include: { patientProfile: true }
      }),
      prisma.vitalLog.findMany({
        where: { userId: targetUserId, loggedAt: { gte: startDate } },
        orderBy: { loggedAt: 'desc' }
      }),
      prisma.schedule.findMany({
        where: { userId: targetUserId }
      }),
      prisma.moodLog.findMany({
        where: { userId: targetUserId, loggedAt: { gte: startDate } },
        orderBy: { loggedAt: 'desc' }
      }),
      prisma.consultationNote.findMany({
        where: { userId: targetUserId, visitDate: { gte: startDate } },
        orderBy: { visitDate: 'desc' }
      })
    ]);

    if (!user) {
      res.status(404).json({ error: 'Patient not found.' });
      return;
    }

    // Glucose Metrics Calculations
    const glucoseLogs = vitals.filter(v => v.type === MetricType.BLOOD_GLUCOSE && typeof v.value === 'number');
    const glucoseValues = glucoseLogs.map(v => v.value as number);

    const totalReadings = glucoseValues.length;
    let avgGlucose = 0;
    let minGlucose = 0;
    let maxGlucose = 0;
    let inRangeCount = 0; // 70 to 140 mg/dL
    let elevatedCount = 0; // 141 to 199 mg/dL
    let highCount = 0; // >= 200 mg/dL
    let lowCount = 0; // < 70 mg/dL

    if (totalReadings > 0) {
      avgGlucose = Math.round((glucoseValues.reduce((a, b) => a + b, 0) / totalReadings) * 10) / 10;
      minGlucose = Math.min(...glucoseValues);
      maxGlucose = Math.max(...glucoseValues);

      glucoseValues.forEach(val => {
        if (val < 70) lowCount++;
        else if (val <= 140) inRangeCount++;
        else if (val < 200) elevatedCount++;
        else highCount++;
      });
    }

    const timeInRangePercent = totalReadings > 0 ? Math.round((inRangeCount / totalReadings) * 100) : 0;

    res.status(200).json({
      reportTitle: `Sukaalife Clinical Summary Report (${range})`,
      generatedAt: new Date(),
      patient: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        diabetesType: user.patientProfile?.diabetesType || 'NONE',
        diagnosisYear: user.patientProfile?.diagnosisYear,
        emergencyContact: user.patientProfile?.emergencyContactName,
        emergencyPhone: user.patientProfile?.emergencyContactPhone,
        latestHba1c: user.patientProfile?.hba1c,
        latestBP: user.patientProfile?.bloodPressure,
        weight: user.patientProfile?.weight
      },
      stats: {
        totalReadings,
        avgGlucose,
        minGlucose,
        maxGlucose,
        timeInRangePercent,
        inRangeCount,
        elevatedCount,
        highCount,
        lowCount
      },
      schedules: schedules.map(s => ({ name: s.name, time: s.time, type: s.type })),
      vitalsHistory: vitals.slice(0, 30).map(v => ({ detail: v.detail, loggedAt: v.loggedAt, verified: v.verified })),
      moodSummary: {
        totalCheckIns: moods.length,
        recentMoods: moods.slice(0, 10).map(m => ({ mood: m.mood, feelingText: m.feelingText, symptoms: m.symptoms, loggedAt: m.loggedAt }))
      },
      consultations: consultations.map(c => ({
        doctorName: c.doctorName,
        clinicName: c.clinicName,
        visitDate: c.visitDate,
        doctorAdvice: c.doctorAdvice,
        prescriptions: c.prescriptions,
        nextAppointment: c.nextAppointment
      }))
    });
  } catch (error) {
    console.error('Generate health report error:', error);
    res.status(500).json({ error: 'Failed to generate health report.' });
  }
};

// ==========================================
// FEATURE 6: DYNAMIC DAILY CHECKLIST
// ==========================================
export const getDailyChecklist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authUserId = req.user?.userId;
    const targetUserId = req.query.patientId as string || authUserId;

    if (!targetUserId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const todayDateStr = new Date().toISOString().split('T')[0];
    const dayOfWeekNumber = (new Date().getDay() || 7); // 1 = Mon ... 7 = Sun

    const [schedules, goals, completedTasks] = await Promise.all([
      prisma.schedule.findMany({ where: { userId: targetUserId } }),
      prisma.healthGoal.findMany({ where: { userId: targetUserId, isCompleted: false } }),
      prisma.dailyTaskLog.findMany({ where: { userId: targetUserId, date: todayDateStr } })
    ]);

    const completedKeySet = new Set(
      completedTasks.filter(t => t.isCompleted).map(t => t.taskKey)
    );

    const checklist: Array<{
      key: string;
      title: string;
      type: 'SCHEDULE' | 'GOAL' | 'ROUTINE';
      timeOrFreq: string;
      category: string;
      isCompleted: boolean;
    }> = [];

    // 1. Add Schedules (Medications & Meals)
    schedules.forEach(s => {
      const days = s.frequencyDays ? s.frequencyDays.split(',') : ['1','2','3','4','5','6','7'];
      if (days.includes(String(dayOfWeekNumber))) {
        const key = `sched_${s.id}_${todayDateStr}`;
        checklist.push({
          key,
          title: s.name,
          type: 'SCHEDULE',
          timeOrFreq: s.time,
          category: s.type,
          isCompleted: completedKeySet.has(key)
        });
      }
    });

    // 2. Add Active Goals (mapped to daily frequency)
    goals.forEach(g => {
      const key = `goal_${g.id}_${todayDateStr}`;
      checklist.push({
        key,
        title: g.title,
        type: 'GOAL',
        timeOrFreq: `${g.currentProgress}/${g.targetValue} ${g.unit}`,
        category: g.category,
        isCompleted: completedKeySet.has(key)
      });
    });

    // 3. Core Daily Routine Tasks
    const coreTasks = [
      { key: `routine_fasting_glucose_${todayDateStr}`, title: 'Morning Fasting Glucose Check', timeOrFreq: 'Morning', category: 'GLUCOSE' },
      { key: `routine_feeling_checkin_${todayDateStr}`, title: 'Daily Feeling & Mood Check-In', timeOrFreq: 'Anytime', category: 'WELLNESS' },
      { key: `routine_water_hydration_${todayDateStr}`, title: 'Drink at least 2 Litres of Water', timeOrFreq: 'Throughout Day', category: 'DIET' },
    ];

    coreTasks.forEach(r => {
      checklist.push({
        key: r.key,
        title: r.title,
        type: 'ROUTINE',
        timeOrFreq: r.timeOrFreq,
        category: r.category,
        isCompleted: completedKeySet.has(r.key)
      });
    });

    const totalCount = checklist.length;
    const completedCount = checklist.filter(c => c.isCompleted).length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    res.status(200).json({
      date: todayDateStr,
      progressPercent,
      completedCount,
      totalCount,
      tasks: checklist
    });
  } catch (error) {
    console.error('Get daily checklist error:', error);
    res.status(500).json({ error: 'Failed to build daily checklist.' });
  }
};

export const toggleDailyTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authUserId = req.user?.userId;
    const targetUserId = req.body.patientId || authUserId;
    const { taskKey, taskTitle, taskType, date } = req.body;

    if (!targetUserId || !taskKey) {
      res.status(400).json({ error: 'Task Key is required.' });
      return;
    }

    const taskDate = date || new Date().toISOString().split('T')[0];

    const existing = await prisma.dailyTaskLog.findUnique({
      where: {
        userId_taskKey_date: {
          userId: targetUserId,
          taskKey,
          date: taskDate
        }
      }
    });

    const newCompleted = existing ? !existing.isCompleted : true;

    const taskLog = await prisma.dailyTaskLog.upsert({
      where: {
        userId_taskKey_date: {
          userId: targetUserId,
          taskKey,
          date: taskDate
        }
      },
      update: {
        isCompleted: newCompleted,
        completedAt: newCompleted ? new Date() : null
      },
      create: {
        userId: targetUserId,
        taskKey,
        taskTitle: taskTitle || taskKey,
        taskType: taskType || 'ROUTINE',
        date: taskDate,
        isCompleted: true,
        completedAt: new Date()
      }
    });

    res.status(200).json({
      message: 'Task state updated',
      isCompleted: taskLog.isCompleted
    });
  } catch (error) {
    console.error('Toggle daily task error:', error);
    res.status(500).json({ error: 'Failed to update daily task.' });
  }
};

// ==========================================
// FEATURE 9: VIRTUAL APPOINTMENT PACKAGES & BOOKINGS
// ==========================================

export const createAppointmentPackage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const specialistId = req.user?.userId;
    const userRole = req.user?.role;
    if (!specialistId || userRole !== 'SPECIALIST') {
      res.status(403).json({ error: 'Only registered specialists can create appointment packages.' });
      return;
    }

    const { title, description, durationMinutes, fee, currency, availableDays, availableTimeSlots, virtualPlatform } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Package title and description are required.' });
      return;
    }

    const appointmentPackage = await prisma.appointmentPackage.create({
      data: {
        specialistId,
        title,
        description,
        durationMinutes: durationMinutes ? parseInt(String(durationMinutes), 10) : 30,
        fee: fee ? parseFloat(String(fee)) : 50000,
        currency: currency || 'UGX',
        availableDays: availableDays || 'Monday, Wednesday, Friday',
        availableTimeSlots: availableTimeSlots || '09:00 AM - 01:00 PM, 03:00 PM - 06:00 PM',
        virtualPlatform: virtualPlatform || 'Sukaalife Telehealth Video Call',
        isVirtual: true,
        isActive: true
      },
      include: {
        specialist: {
          select: {
            id: true,
            fullName: true,
            specialistProfile: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Virtual consultation package created successfully',
      package: appointmentPackage
    });
  } catch (error) {
    console.error('Create appointment package error:', error);
    res.status(500).json({ error: 'Failed to create appointment package.' });
  }
};

export const getAppointmentPackages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { specialistId } = req.query;
    const whereClause: any = { isActive: true };
    if (specialistId) {
      whereClause.specialistId = String(specialistId);
    }

    const packages = await prisma.appointmentPackage.findMany({
      where: whereClause,
      include: {
        specialist: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            specialistProfile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ packages });
  } catch (error) {
    console.error('Get appointment packages error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment packages.' });
  }
};

export const getSpecialistDoctorProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Specialist ID is required.' });
      return;
    }

    const specialist = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        specialistProfile: true,
        authoredResources: {
          where: { isPublished: true },
          take: 5
        },
        appointmentPackages: {
          where: { isActive: true }
        }
      }
    });

    if (!specialist || specialist.role !== 'SPECIALIST') {
      res.status(404).json({ error: 'Specialist profile not found.' });
      return;
    }

    res.status(200).json({ specialist });
  } catch (error) {
    console.error('Get specialist doctor profile error:', error);
    res.status(500).json({ error: 'Failed to fetch specialist details.' });
  }
};

export const deleteAppointmentPackage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const specialistId = req.user?.userId;
    const { id } = req.params;

    const existing = await prisma.appointmentPackage.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Package not found.' });
      return;
    }

    if (existing.specialistId !== specialistId && req.user?.role !== 'SPECIALIST') {
      res.status(403).json({ error: 'Not authorized to delete this package.' });
      return;
    }

    await prisma.appointmentPackage.update({
      where: { id },
      data: { isActive: false }
    });

    res.status(200).json({ message: 'Package deactivated successfully.' });
  } catch (error) {
    console.error('Delete appointment package error:', error);
    res.status(500).json({ error: 'Failed to delete package.' });
  }
};

export const bookAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user?.userId;
    if (!patientId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { packageId, appointmentDate, timeSlot, reason, notes } = req.body;
    if (!packageId || !appointmentDate || !timeSlot) {
      res.status(400).json({ error: 'Package, appointment date, and preferred time slot are required.' });
      return;
    }

    const pkg = await prisma.appointmentPackage.findUnique({
      where: { id: packageId },
      include: { specialist: true }
    });

    if (!pkg) {
      res.status(404).json({ error: 'Appointment package not found.' });
      return;
    }

    const meetingId = `suka-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const meetingLink = `https://meet.sukaalife.org/telehealth/${meetingId}`;

    const booking = await prisma.appointmentBooking.create({
      data: {
        packageId,
        patientId,
        specialistId: pkg.specialistId,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        status: 'CONFIRMED',
        reason: reason || 'General Diabetes Consultation',
        notes: notes || undefined,
        meetingLink,
        feePaid: pkg.fee
      },
      include: {
        package: true,
        specialist: {
          select: {
            id: true,
            fullName: true,
            specialistProfile: true
          }
        },
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            patientProfile: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Virtual appointment confirmed with Dr. ' + pkg.specialist.fullName,
      booking
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment.' });
  }
};

export const getMyAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let bookings;
    if (userRole === 'SPECIALIST') {
      bookings = await prisma.appointmentBooking.findMany({
        where: { specialistId: userId },
        include: {
          package: true,
          patient: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              patientProfile: true
            }
          }
        },
        orderBy: { appointmentDate: 'desc' }
      });
    } else {
      bookings = await prisma.appointmentBooking.findMany({
        where: { patientId: userId },
        include: {
          package: true,
          specialist: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              specialistProfile: true
            }
          }
        },
        orderBy: { appointmentDate: 'desc' }
      });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
};

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await prisma.appointmentBooking.findUnique({ where: { id } });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    if (booking.patientId !== userId && booking.specialistId !== userId) {
      res.status(403).json({ error: 'Unauthorized to modify this appointment.' });
      return;
    }

    const updated = await prisma.appointmentBooking.update({
      where: { id },
      data: {
        status: status || booking.status,
        notes: notes !== undefined ? notes : booking.notes
      },
      include: {
        package: true,
        specialist: { select: { id: true, fullName: true, specialistProfile: true } },
        patient: { select: { id: true, fullName: true, phone: true } }
      }
    });

    res.status(200).json({
      message: 'Appointment status updated successfully.',
      booking: updated
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status.' });
  }
};