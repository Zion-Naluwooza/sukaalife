import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Register User
export const registerPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, phone, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email: email || undefined }] }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this phone or email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        phone,
        email,
        passwordHash,
        role: 'PATIENT',
        patientProfile: { create: {} }
      },
      include: { patientProfile: true }
    });

    res.status(201).json({
      message: 'Registration successful',
      userId: newUser.id
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

// Login User
export const loginPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { patientProfile: true }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      isProfileComplete: user.patientProfile?.isProfileComplete ?? false
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// Save Medical Biodata & Conditional Metrics
export const saveMedicalProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
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

    const updateData: any = {
      emergencyContactName,
      emergencyContactPhone,
      diagnosisYear: diagnosisYear ? parseInt(diagnosisYear) : null,
      diabetesType,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      isProfileComplete: true
    };

    if (diabetesType === 'TYPE_1') {
      updateData.bloodGlucoseLevel = bloodGlucoseLevel ? parseFloat(bloodGlucoseLevel) : null;
      updateData.bloodGlucoseLoggedAt = bloodGlucoseLevel ? new Date() : null;
    } else if (diabetesType === 'TYPE_2') {
      updateData.hba1c = hba1c ? parseFloat(hba1c) : null;
      updateData.bloodPressure = bloodPressure || null;
      updateData.weight = weight ? parseFloat(weight) : null;
    }

    const updatedProfile = await prisma.patientProfile.update({
      where: { userId },
      data: updateData
    });

    res.status(200).json({
      message: 'Medical profile saved successfully',
      isProfileComplete: updatedProfile.isProfileComplete
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save medical profile.' });
  }
};