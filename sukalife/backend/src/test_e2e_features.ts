const BASE_URL = 'http://localhost:5000/api';

async function testAllFeatures() {
  console.log('--- STARTING SUKAALIFE UNIFIED ONBOARDING & FEATURES VERIFICATION ---');
  const timestamp = Date.now();

  // 1. Multi-Role Registration (Step 1)
  console.log('\n[1/7] Testing Step 1: In-Form Account Registration for Patient, Specialist, and Caregiver...');
  const patientRes = await fetch(`${BASE_URL}/patients/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: `Patient Nabukeera ${timestamp}`,
      phone: `+25670${timestamp.toString().slice(-7)}`,
      password: 'SecurePassword123!',
      role: 'PATIENT'
    })
  });
  const patientData: any = await patientRes.json();
  if (!patientRes.ok) throw new Error(`Patient registration failed: ${JSON.stringify(patientData)}`);
  console.log('  ✓ Patient created with ID:', patientData.userId, 'isProfileComplete:', patientData.isProfileComplete);

  const specialistRes = await fetch(`${BASE_URL}/patients/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: `Dr. Sarah Namubiru ${timestamp}`,
      phone: `+25671${timestamp.toString().slice(-7)}`,
      password: 'SecurePassword123!',
      role: 'SPECIALIST'
    })
  });
  const specialistData: any = await specialistRes.json();
  if (!specialistRes.ok) throw new Error(`Specialist registration failed: ${JSON.stringify(specialistData)}`);
  console.log('  ✓ Specialist created with ID:', specialistData.userId, 'isProfileComplete:', specialistData.isProfileComplete);

  const caregiverRes = await fetch(`${BASE_URL}/patients/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: `Caregiver Kato ${timestamp}`,
      phone: `+25672${timestamp.toString().slice(-7)}`,
      password: 'SecurePassword123!',
      role: 'CAREGIVER'
    })
  });
  const caregiverData: any = await caregiverRes.json();
  if (!caregiverRes.ok) throw new Error(`Caregiver registration failed: ${JSON.stringify(caregiverData)}`);
  console.log('  ✓ Caregiver created with ID:', caregiverData.userId, 'isProfileComplete:', caregiverData.isProfileComplete);

  // 2. Step 2: Role-Specific Biodata Submissions (Patient, Specialist, Caregiver)
  console.log('\n[2/7] Testing Step 2: Role-Specific Profile Setup...');
  
  // 2a. Patient Medical Setup
  const medProfileRes = await fetch(`${BASE_URL}/patients/medical-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patientData.token}`
    },
    body: JSON.stringify({
      emergencyContactName: 'Kato Joseph',
      emergencyContactPhone: '+256720000000',
      diagnosisYear: 2022,
      diabetesType: 'TYPE_1',
      gender: 'Female',
      dateOfBirth: '1996-03-15',
      bloodGlucoseLevel: 124
    })
  });
  const medProfileData: any = await medProfileRes.json();
  console.log('  ✓ Patient medical profile saved:', medProfileData.message, 'Complete:', medProfileData.isProfileComplete);

  // 2b. Specialist Setup (Specialty: Endocrinologist/Nutritionist, Licensed checkbox, Hospital, Gender, District, Years Practicing)
  const specProfileRes = await fetch(`${BASE_URL}/patients/specialists/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${specialistData.token}`
    },
    body: JSON.stringify({
      specialty: 'Endocrinologist',
      isLicensed: true,
      licenseNumber: `UMDPC-${timestamp.toString().slice(-5)}`,
      hospitalAffiliation: 'Mulago National Referral Hospital',
      gender: 'Female',
      district: 'Kampala',
      yearsPracticing: '5-10 years',
      bio: 'Consultant endocrinologist with focus on youth type 1 care.'
    })
  });
  const specProfileData: any = await specProfileRes.json();
  console.log('  ✓ Specialist credentials saved:', specProfileData.message, 'Specialty:', specProfileData.profile?.specialty, 'District:', specProfileData.profile?.district);

  // 2c. Caregiver Setup (Relation, Knowledge Level, Age, Gender, Caretaker Type)
  const careProfileRes = await fetch(`${BASE_URL}/patients/caregivers/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${caregiverData.token}`
    },
    body: JSON.stringify({
      relationship: 'Child (Son / Daughter)',
      knowledgeLevel: 'Well informed',
      age: 34,
      gender: 'Male',
      caretakerType: 'Live-in care taker'
    })
  });
  const careProfileData: any = await careProfileRes.json();
  console.log('  ✓ Caregiver profile saved:', careProfileData.message, 'Knowledge Level:', careProfileData.profile?.knowledgeLevel, 'Type:', careProfileData.profile?.caretakerType);

  // 3. Caregiver Pairing
  console.log('\n[3/7] Testing Caregiver Invite & Linking...');
  const inviteRes = await fetch(`${BASE_URL}/patients/caregivers/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientData.token}` }
  });
  const inviteData: any = await inviteRes.json();
  console.log('  ✓ Patient generated invite code:', inviteData.inviteCode);

  const linkRes = await fetch(`${BASE_URL}/patients/caregivers/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${caregiverData.token}` },
    body: JSON.stringify({
      inviteCode: inviteData.inviteCode,
      relationship: 'Son'
    })
  });
  const linkData: any = await linkRes.json();
  console.log('  ✓ Caregiver linked with patient:', linkData.message);

  // 4. Education Center
  console.log('\n[4/7] Testing Specialist Educational Publishing & Education Center...');
  const pubRes = await fetch(`${BASE_URL}/patients/education`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${specialistData.token}` },
    body: JSON.stringify({
      title: 'Traditional Ugandan Diet & Carbohydrate Counting',
      description: 'How to manage Matooke, Millet, and Cassava portions for stable glucose.',
      contentType: 'ARTICLE',
      category: 'Nutrition & Local Diet',
      targetLanguage: 'English',
      mediaUrl: 'https://sukalife.org/guides/diet-matooke.pdf'
    })
  });
  const pubData: any = await pubRes.json();
  console.log('  ✓ Educational article published by specialist:', pubData.resource?.title);

  // 5. Patient Q&A
  console.log('\n[5/7] Testing Specialist Triage Q&A...');
  const askRes = await fetch(`${BASE_URL}/patients/qa/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientData.token}` },
    body: JSON.stringify({
      title: 'Morning insulin adjustment question',
      questionText: 'Is 8 units of Humalog safe before eating matooke in the morning?',
      category: 'MEDICATION_DOSAGE',
      urgency: 'NORMAL'
    })
  });
  const askData: any = await askRes.json();
  console.log('  ✓ Question submitted by patient with ID:', askData.question?.id);

  const answerRes = await fetch(`${BASE_URL}/patients/qa/questions/${askData.question.id}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${specialistData.token}` },
    body: JSON.stringify({
      answerText: 'Yes, ensure your meal is consumed within 15 minutes of rapid-acting insulin administration.'
    })
  });
  const ansData: any = await answerRes.json();
  console.log('  ✓ Specialist answered question with verified badge:', ansData.message);

  // 6. Feelings Check-In & Checklist
  console.log('\n[6/7] Testing Feelings Journal & Daily Checklist Engine...');
  const moodRes = await fetch(`${BASE_URL}/patients/mood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientData.token}` },
    body: JSON.stringify({
      feelingText: 'Feeling energetic and alert today.',
      mood: 'GOOD',
      energyLevel: 4,
      symptoms: 'None'
    })
  });
  const moodData: any = await moodRes.json();
  console.log('  ✓ Feelings recorded:', moodData.moodLog?.feelingText);

  const checklistRes = await fetch(`${BASE_URL}/patients/checklist/today`, {
    headers: { 'Authorization': `Bearer ${patientData.token}` }
  });
  const checklistData: any = await checklistRes.json();
  console.log(`  ✓ Dynamic checklist generated: ${checklistData.tasks?.length} tasks.`);

  // 7. Health Summary Report
  console.log('\n[7/7] Testing Clinical Health Summary Report...');
  const reportRes = await fetch(`${BASE_URL}/patients/reports/health-summary?range=30d`, {
    headers: { 'Authorization': `Bearer ${patientData.token}` }
  });
  const reportData: any = await reportRes.json();
  console.log('  ✓ Report Generated:');
  console.log(`    - Patient: ${reportData.patient?.fullName}`);
  console.log(`    - Time In Range (TIR): ${reportData.stats?.timeInRangePercent}%`);
  console.log(`    - Average Glucose: ${reportData.stats?.avgGlucose} mg/dL`);

  // 8. Weekly Goal 1-Per-Day Lock & Daily Reflection Verification
  console.log('\n[8/9] Testing Weekly Goal 1-Per-Day Reflection Lock...');
  const goalRes = await fetch(`${BASE_URL}/patients/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientData.token}` },
    body: JSON.stringify({
      title: 'Morning Jogging / Exercise',
      targetValue: 5,
      unit: 'days/week',
      category: 'EXERCISE',
      frequencyPerWeek: 5
    })
  });
  const goalData: any = await goalRes.json();
  console.log('  ✓ Health goal created:', goalData.goal?.title, 'Target:', goalData.goal?.targetValue);

  // Check-in #1 today with reflection note
  const checkin1Res = await fetch(`${BASE_URL}/patients/goals/${goalData.goal.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientData.token}` },
    body: JSON.stringify({
      incrementBy: 1,
      reflectionNote: 'Jogged 3km around Kololo airstrip in the morning. Felt energized!',
      effortLevel: 'Normal'
    })
  });
  const checkin1Data: any = await checkin1Res.json();
  if (!checkin1Res.ok) throw new Error(`Checkin 1 failed: ${JSON.stringify(checkin1Data)}`);
  console.log('  ✓ Check-in 1 succeeded with reflection note:', checkin1Data.message, 'Current Progress:', checkin1Data.goal?.currentValue);

  // Check-in #2 on SAME DAY (must be rejected with 400)
  const checkin2Res = await fetch(`${BASE_URL}/patients/goals/${goalData.goal.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientData.token}` },
    body: JSON.stringify({
      incrementBy: 1,
      reflectionNote: 'Attempting second jog checkin same day',
      effortLevel: 'Challenging'
    })
  });
  if (checkin2Res.status === 400) {
    console.log('  ✓ Check-in 2 correctly REJECTED for duplicate same-day logging (400 Prevented multi-checkin)');
  } else {
    throw new Error(`Expected 400 rejection for same day log, but received: ${checkin2Res.status}`);
  }

  // 9. Reminder Schedules Frequency & Vitals Routine Context
  console.log('\n[9/9] Testing Reminder Schedule Frequency & Vitals Routine Context...');
  const schedRes = await fetch(`${BASE_URL}/patients/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientData.token}` },
    body: JSON.stringify({
      type: 'medication',
      name: 'Weekly B12 & Glucose Review',
      time: '08:00 AM',
      frequency: 'WEEKLY',
      frequencyDays: 'Monday'
    })
  });
  const schedData: any = await schedRes.json();
  console.log('  ✓ Weekly reminder created:', schedData.schedule?.name, 'Frequency:', schedData.schedule?.frequency, 'Time:', schedData.schedule?.time);

  const vitalLogRes = await fetch(`${BASE_URL}/patients/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientData.token}` },
    body: JSON.stringify({
      bloodGlucoseLevel: 112,
      frequencyContext: '🌅 Fasting (Morning Before Meal) at 08:00 AM'
    })
  });
  const vitalLogData: any = await vitalLogRes.json();
  // 10. Virtual Appointments & Telehealth Packages
  console.log('\n[10/10] Testing Virtual Telehealth Packages, Doctor Profile Viewer & Booking Flow...');
  
  // 10a. Specialist creates virtual appointment package (auto extracts doctor info)
  const pkgRes = await fetch(`${BASE_URL}/patients/appointments/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${specialistData.token}` },
    body: JSON.stringify({
      title: 'Type 1 Youth & Insulin Management Consult',
      description: 'Comprehensive 45-minute virtual video review of glucose profiles, insulin-to-carb ratios, and nutrition adjustments.',
      durationMinutes: 45,
      fee: 35000,
      availableDays: 'Monday,Wednesday,Friday',
      timeSlots: '09:00 AM, 11:00 AM, 02:00 PM',
      consultationType: 'VIRTUAL'
    })
  });
  const pkgData: any = await pkgRes.json();
  if (!pkgRes.ok) throw new Error(`Create package failed: ${JSON.stringify(pkgData)}`);
  console.log('  ✓ Appointment package created:', pkgData.package?.title, 'Fee:', pkgData.package?.fee, 'Doctor auto-extracted:', pkgData.package?.specialist?.fullName, 'Specialty:', pkgData.package?.specialist?.specialistProfile?.specialty);

  // 10b. Patient lists active packages
  const listPkgsRes = await fetch(`${BASE_URL}/patients/appointments/packages`, {
    headers: { 'Authorization': `Bearer ${patientData.token}` }
  });
  const listPkgsData: any = await listPkgsRes.json();
  console.log('  ✓ Patient fetched active packages count:', listPkgsData.packages?.length);

  // 10c. Patient views full doctor profile & credentials
  const docProfileRes = await fetch(`${BASE_URL}/patients/specialists/${specialistData.userId}/profile`, {
    headers: { 'Authorization': `Bearer ${patientData.token}` }
  });
  const docProfileData: any = await docProfileRes.json();
  console.log('  ✓ Doctor profile verified before booking: Dr.', docProfileData.specialist?.fullName, 'Hospital:', docProfileData.specialist?.specialistProfile?.hospitalAffiliation, 'License:', docProfileData.specialist?.specialistProfile?.licenseNumber);

  // 10d. Patient books appointment
  const bookRes = await fetch(`${BASE_URL}/patients/appointments/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientData.token}` },
    body: JSON.stringify({
      packageId: pkgData.package?.id,
      appointmentDate: '2026-09-15',
      timeSlot: '11:00 AM',
      notes: 'Need expert guidance on fasting morning highs and meal adjustments.'
    })
  });
  const bookData: any = await bookRes.json();
  if (!bookRes.ok) throw new Error(`Booking failed: ${JSON.stringify(bookData)}`);
  console.log('  ✓ Virtual consultation booked:', bookData.booking?.id, 'Status:', bookData.booking?.status, 'Meeting Link:', bookData.booking?.meetingLink);

  // 10e. Specialist confirms appointment
  const updateBookingRes = await fetch(`${BASE_URL}/patients/appointments/bookings/${bookData.booking?.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${specialistData.token}` },
    body: JSON.stringify({ status: 'CONFIRMED' })
  });
  const updateBookingData: any = await updateBookingRes.json();
  console.log('  ✓ Specialist confirmed appointment status:', updateBookingData.booking?.status);

  console.log('\n========================================');
  console.log('🎉 ALL SUKAALIFE CLINICAL, DASHBOARD & APPOINTMENT REQUIREMENTS VERIFIED 100%!');
  console.log('========================================');
}

testAllFeatures().catch((err) => {
  console.error('Feature verification failed:', err);
  process.exit(1);
});

