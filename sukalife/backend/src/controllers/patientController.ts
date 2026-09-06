import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DiabetesType, MetricType, ScheduleType, GoalCategory, MoodState } from '@prisma/client';
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
        },
        achievements: {
          create: {
            badgeKey: 'WELCOME',
            title: 'Welcome to Sukaalife',
            description: 'Started your digital diabetes journey.',
            iconName: 'Sparkles'
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
        },
        healthGoals: {
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
      schedules: user.schedules,
      healthGoals: user.healthGoals,
      achievements: user.achievements,
      moodLogs: user.moodLogs,
      consultationNotes: user.consultationNotes
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

    // Auto-increment relevant active goals if any
    if (metricType === MetricType.BLOOD_GLUCOSE) {
      await prisma.healthGoal.updateMany({
        where: { userId, category: 'GLUCOSE', isCompleted: false },
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

// ==========================================
// FEATURE 1: WEEKLY ACTIVITY SUMMARY
// ==========================================
export const getWeeklyActivitySummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const now = new Date();
    // Compute current week's Monday (00:00:00)
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Fetch vital logs, mood logs, and schedules for this week
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

    // Build 7-day daily activity array
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

    // Calculate active logging streak (consecutive days leading up to today with logs)
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
    // If no log today yet, check if yesterday was logged to maintain streak
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

// ==========================================
// FEATURE 2: GOALS & ACHIEVEMENTS
// ==========================================
export const getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
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
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { title, targetValue, unit, category } = req.body;
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
    const { incrementBy, setProgress, isCompleted } = req.body;

    if (!userId || !id) {
      res.status(400).json({ error: 'Goal ID is required.' });
      return;
    }

    const goal = await prisma.healthGoal.findFirst({
      where: { id, userId }
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found.' });
      return;
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
      }
    });

    // Check achievement triggers
    if (completed) {
      const existingAchievement = await prisma.achievement.findFirst({
        where: { userId, badgeKey: 'GOAL_CRUSHER' }
      });

      if (!existingAchievement) {
        await prisma.achievement.create({
          data: {
            userId,
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
      where: { id, userId }
    });

    res.status(200).json({ message: 'Goal removed successfully.' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal.' });
  }
};

// ==========================================
// FEATURE 3: MOOD / FEELING LOGS
// ==========================================
export const getMoodLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
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
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { mood, energyLevel, symptoms, notes } = req.body;
    if (!mood) {
      res.status(400).json({ error: 'Mood selection is required.' });
      return;
    }

    // Normalize mood string to MoodState enum
    let moodEnum: MoodState = MoodState.NEUTRAL;
    const moodUpper = String(mood).toUpperCase().replace(/\s+/g, '_');
    if (Object.values(MoodState).includes(moodUpper as MoodState)) {
      moodEnum = moodUpper as MoodState;
    }

    const newMoodLog = await prisma.moodLog.create({
      data: {
        userId,
        mood: moodEnum,
        energyLevel: energyLevel ? parseInt(String(energyLevel), 10) : null,
        symptoms: symptoms ? (Array.isArray(symptoms) ? symptoms.join(', ') : String(symptoms)) : null,
        notes: notes ? String(notes).trim() : null
      }
    });

    res.status(201).json({
      message: 'Mood check-in recorded successfully',
      moodLog: newMoodLog
    });
  } catch (error) {
    console.error('Create mood log error:', error);
    res.status(500).json({ error: 'Failed to record mood check-in.' });
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
      where: { id, userId }
    });

    res.status(200).json({ message: 'Mood log removed successfully.' });
  } catch (error) {
    console.error('Delete mood log error:', error);
    res.status(500).json({ error: 'Failed to delete mood log.' });
  }
};

// ==========================================
// FEATURE 4: CONSULTATION NOTES
// ==========================================
export const getConsultationNotes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
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
    const userId = req.user?.userId;
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
      where: { id, userId }
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
      where: { id, userId }
    });

    res.status(200).json({ message: 'Consultation note deleted successfully.' });
  } catch (error) {
    console.error('Delete consultation note error:', error);
    res.status(500).json({ error: 'Failed to delete consultation note.' });
  }
};