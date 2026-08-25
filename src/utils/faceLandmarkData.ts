import type { LandmarkPoint, FaceMetrics, EmotionType, CsvLogEntry } from '../types';

// Canonical 3D Face Landmark Topology Base Model (468 points generator)
export function generateCanonicalMesh(
  yawDeg: number = 0,
  pitchDeg: number = 0,
  rollDeg: number = 0,
  blinkRatio: number = 0, // 0 = open, 1 = closed
  mouthOpenRatio: number = 0,
  smileRatio: number = 0
): LandmarkPoint[] {
  const points: LandmarkPoint[] = [];
  const radYaw = (yawDeg * Math.PI) / 180;
  const radPitch = (pitchDeg * Math.PI) / 180;
  const radRoll = (rollDeg * Math.PI) / 180;

  const cosY = Math.cos(radYaw);
  const sinY = Math.sin(radYaw);
  const cosP = Math.cos(radPitch);
  const sinP = Math.sin(radPitch);
  const cosR = Math.cos(radRoll);
  const sinR = Math.sin(radRoll);

  // Helper to rotate and project 3D relative coordinate (-1..1) to normalized screen space (0..1)
  const project = (x3d: number, y3d: number, z3d: number, id: number, region: LandmarkPoint['region']) => {
    // 3D rotation: Yaw -> Pitch -> Roll
    const x1 = x3d * cosY + z3d * sinY;
    const y1 = y3d;
    const z1 = -x3d * sinY + z3d * cosY;

    const x2 = x1;
    const y2 = y1 * cosP - z1 * sinP;
    const z2 = y1 * sinP + z1 * cosP;

    const x3 = x2 * cosR - y2 * sinR;
    const y3 = x2 * sinR + y2 * cosR;
    const z3 = z2;

    // Perspective projection
    const fov = 2.4;
    const projFactor = fov / (fov + z3 * 0.4);
    const screenX = 0.5 + x3 * 0.28 * projFactor;
    const screenY = 0.48 + y3 * 0.32 * projFactor;

    points.push({
      x: Math.max(0.05, Math.min(0.95, screenX)),
      y: Math.max(0.05, Math.min(0.95, screenY)),
      z: z3,
      id,
      region,
    });
  };

  let idCounter = 0;

  // 1. Face Contour (36 points)
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const rx = 0.72 * (1 + 0.05 * Math.sin(angle * 2));
    const ry = 0.95 * (1 + 0.08 * Math.cos(angle));
    const x = Math.sin(angle) * rx;
    const y = -Math.cos(angle) * ry + 0.1;
    const z = -Math.cos(angle) * 0.35;
    project(x, y, z, idCounter++, 'contour');
  }

  // 2. Left Eyebrow (12 points)
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const x = -0.52 + t * 0.32;
    const y = -0.42 - Math.sin(t * Math.PI) * 0.12 + (smileRatio > 0.3 ? -0.03 : 0);
    const z = 0.18 + Math.sin(t * Math.PI) * 0.1;
    project(x, y, z, idCounter++, 'eyebrows');
  }

  // 3. Right Eyebrow (12 points)
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const x = 0.20 + t * 0.32;
    const y = -0.42 - Math.sin(t * Math.PI) * 0.12 + (smileRatio > 0.3 ? -0.03 : 0);
    const z = 0.18 + Math.sin(t * Math.PI) * 0.1;
    project(x, y, z, idCounter++, 'eyebrows');
  }

  // 4. Left Eye & Contour (16 points)
  const leftEyeOpen = Math.max(0.02, 1 - blinkRatio);
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const x = -0.34 + Math.cos(angle) * 0.13;
    const y = -0.22 + Math.sin(angle) * 0.07 * leftEyeOpen;
    const z = 0.22 + Math.cos(angle) * 0.05;
    project(x, y, z, idCounter++, 'leftEye');
  }

  // 5. Left Iris (5 points)
  project(-0.34, -0.22, 0.28, idCounter++, 'leftIris');
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const x = -0.34 + Math.cos(angle) * 0.04;
    const y = -0.22 + Math.sin(angle) * 0.04 * leftEyeOpen;
    project(x, y, 0.28, idCounter++, 'leftIris');
  }

  // 6. Right Eye & Contour (16 points)
  const rightEyeOpen = Math.max(0.02, 1 - blinkRatio);
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const x = 0.34 + Math.cos(angle) * 0.13;
    const y = -0.22 + Math.sin(angle) * 0.07 * rightEyeOpen;
    const z = 0.22 + Math.cos(angle) * 0.05;
    project(x, y, z, idCounter++, 'rightEye');
  }

  // 7. Right Iris (5 points)
  project(0.34, -0.22, 0.28, idCounter++, 'rightIris');
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const x = 0.34 + Math.cos(angle) * 0.04;
    const y = -0.22 + Math.sin(angle) * 0.04 * rightEyeOpen;
    project(x, y, 0.28, idCounter++, 'rightIris');
  }

  // 8. Nose Bridge & Tip (20 points)
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const y = -0.26 + t * 0.38;
    const z = 0.22 + Math.sin(t * Math.PI * 0.8) * 0.25;
    project(0, y, z, idCounter++, 'nose');
  }
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI;
    const x = Math.cos(angle) * 0.12;
    const y = 0.12 + Math.sin(angle) * 0.04;
    const z = 0.42;
    project(x, y, z, idCounter++, 'nose');
  }

  // 9. Lips & Mouth (28 points)
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const x = Math.cos(angle) * (0.24 + smileRatio * 0.06);
    const y = 0.42 + Math.sin(angle) * (0.08 + mouthOpenRatio * 0.15) - (smileRatio * 0.04 * Math.cos(angle * 2));
    const z = 0.32 + Math.cos(angle) * 0.08;
    project(x, y, z, idCounter++, 'lips');
  }
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const x = Math.cos(angle) * 0.15;
    const y = 0.42 + Math.sin(angle) * (0.03 + mouthOpenRatio * 0.10);
    const z = 0.30;
    project(x, y, z, idCounter++, 'lips');
  }

  // 10. Facial Tesselation Grid (fill up to 468 landmarks)
  const remainingCount = 468 - idCounter;
  const gridRows = Math.ceil(Math.sqrt(remainingCount));
  const gridCols = Math.ceil(remainingCount / gridRows);

  for (let r = 0; r < gridRows && idCounter < 468; r++) {
    for (let c = 0; c < gridCols && idCounter < 468; c++) {
      const u = (c / (gridCols - 1)) * 2 - 1; // -1 to 1
      const v = (r / (gridRows - 1)) * 2 - 1; // -1 to 1
      
      // Elliptical boundary constraint
      if (u * u * 0.9 + v * v * 0.8 <= 0.85) {
        const x = u * 0.65;
        const y = v * 0.78 + 0.02;
        const dist = Math.sqrt(u * u + v * v);
        const z = Math.max(0, 0.4 - dist * 0.35);
        project(x, y, z, idCounter++, 'mesh');
      } else {
        // Fold toward center
        const x = u * 0.5;
        const y = v * 0.6;
        project(x, y, 0.15, idCounter++, 'mesh');
      }
    }
  }

  // Ensure exact 468 points
  while (idCounter < 468) {
    const randAngle = Math.random() * Math.PI * 2;
    const randRadius = Math.random() * 0.5;
    project(
      Math.cos(randAngle) * randRadius,
      Math.sin(randAngle) * randRadius,
      0.2,
      idCounter++,
      'mesh'
    );
  }

  return points;
}

// Calculate Eye Aspect Ratio (EAR) from vertical & horizontal landmarks
export function calculateEAR(p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }, p4: { x: number; y: number }, p5: { x: number; y: number }, p6: { x: number; y: number }): number {
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => 
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const vertical1 = dist(p2, p6);
  const vertical2 = dist(p3, p5);
  const horizontal = dist(p1, p4);

  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

// Generate real-time synthetic metrics based on active simulation state & elapsed ticks
export function computeLiveMetrics(
  tick: number,
  preset: 'focus' | 'discussion' | 'fatigue' | 'distracted' | 'expressive'
): FaceMetrics {
  const t = tick * 0.05;

  let yaw = 0;
  let pitch = 0;
  let roll = 0;
  let isBlinking = false;
  let blinkRatio = 0;
  let attentivenessScore = 92;
  let dominantEmotion: EmotionType = 'Focused';
  let emotionConfidence = 91.5;
  let perclos = 4.2; // 0-100%

  // Blink generation cycle: natural blinks every ~3.5s (70 ticks)
  const blinkCycle = tick % 70;
  if (blinkCycle >= 65 && blinkCycle <= 69) {
    isBlinking = true;
    blinkRatio = Math.sin(((blinkCycle - 65) / 4) * Math.PI);
  }

  switch (preset) {
    case 'focus':
      yaw = Math.sin(t * 0.4) * 2.8;
      pitch = Math.cos(t * 0.3) * 1.5 - 1.0;
      roll = Math.sin(t * 0.2) * 1.0;
      attentivenessScore = Math.min(99, Math.max(88, 94 + Math.sin(t * 0.8) * 3.5));
      dominantEmotion = 'Focused';
      emotionConfidence = 94.2;
      perclos = 3.8;
      break;

    case 'discussion':
      yaw = Math.sin(t * 0.9) * 8.5;
      pitch = Math.cos(t * 0.7) * 4.2 + 2.0;
      roll = Math.sin(t * 0.5) * 3.0;
      attentivenessScore = 86 + Math.cos(t * 0.6) * 6.0;
      dominantEmotion = 'Engaged';
      emotionConfidence = 88.7;
      perclos = 5.6;
      break;

    case 'fatigue':
      yaw = Math.sin(t * 0.2) * 4.0;
      pitch = 5.0 + Math.sin(t * 0.3) * 3.5; // Head droop
      roll = Math.sin(t * 0.25) * 4.2;
      // Frequent long blinks & micro-sleep
      if (blinkCycle >= 55 && blinkCycle <= 69) {
        isBlinking = true;
        blinkRatio = 0.85;
      }
      attentivenessScore = Math.max(28, 48 - Math.sin(t * 0.5) * 15);
      dominantEmotion = 'Fatigued';
      emotionConfidence = 93.1;
      perclos = 28.4;
      break;

    case 'distracted':
      yaw = 22.0 * Math.sin(t * 0.8); // Looking sideways away from display
      pitch = -8.0 + Math.cos(t * 0.6) * 5.0;
      roll = Math.sin(t * 0.7) * 6.5;
      attentivenessScore = Math.max(15, 34 + Math.sin(t * 1.2) * 12);
      dominantEmotion = 'Confused';
      emotionConfidence = 82.4;
      perclos = 12.0;
      break;

    case 'expressive':
      yaw = Math.sin(t * 1.1) * 6.0;
      pitch = Math.cos(t * 0.9) * 3.0;
      roll = Math.sin(t * 0.8) * 3.0;
      attentivenessScore = 89 + Math.sin(t) * 4;
      dominantEmotion = 'Smiling';
      emotionConfidence = 96.0;
      perclos = 4.0;
      break;
  }

  const baseEar = 0.32 - blinkRatio * 0.26 + (Math.sin(t * 2) * 0.01);
  const earLeft = Math.max(0.04, baseEar + Math.sin(t * 3.1) * 0.008);
  const earRight = Math.max(0.04, baseEar - Math.sin(t * 2.8) * 0.007);
  const earAvg = (earLeft + earRight) / 2;

  let attentivenessState: FaceMetrics['attentivenessState'] = 'optimal';
  if (attentivenessScore < 45) attentivenessState = 'fatigued';
  else if (attentivenessScore < 65) attentivenessState = 'distracted';
  else if (attentivenessScore < 85) attentivenessState = 'alert';

  // Compute emotion distribution
  const emotionProbabilities: Record<EmotionType, number> = {
    Neutral: 0.12,
    Engaged: 0.15,
    Focused: 0.20,
    Inquisitive: 0.08,
    Surprised: 0.05,
    Fatigued: 0.05,
    Smiling: 0.05,
    Confused: 0.05,
  };

  // Bias dominant emotion
  emotionProbabilities[dominantEmotion] = (emotionConfidence / 100);
  // Normalize
  const sumOther = Object.keys(emotionProbabilities)
    .filter(k => k !== dominantEmotion)
    .reduce((acc, k) => acc + emotionProbabilities[k as EmotionType], 0);
  const remaining = 1 - (emotionConfidence / 100);
  Object.keys(emotionProbabilities).forEach(k => {
    if (k !== dominantEmotion) {
      emotionProbabilities[k as EmotionType] = (emotionProbabilities[k as EmotionType] / sumOther) * remaining;
    }
  });

  const meshPoints = generateCanonicalMesh(
    yaw,
    pitch,
    roll,
    blinkRatio,
    preset === 'discussion' ? Math.abs(Math.sin(t * 2.5) * 0.4) : 0.05,
    dominantEmotion === 'Smiling' ? 0.8 : (dominantEmotion === 'Focused' ? 0.1 : 0)
  );

  return {
    timestamp: new Date().toISOString(),
    frameIndex: tick,
    faceDetected: true,
    earLeft: parseFloat(earLeft.toFixed(3)),
    earRight: parseFloat(earRight.toFixed(3)),
    earAvg: parseFloat(earAvg.toFixed(3)),
    isBlinking,
    blinkCount: Math.floor(tick / 70) + (preset === 'fatigue' ? Math.floor(tick / 35) : 0),
    blinkRateBpm: preset === 'fatigue' ? 26 : (preset === 'focus' ? 14 : 19),
    perclos: parseFloat(perclos.toFixed(1)),
    headPose: {
      yaw: parseFloat(yaw.toFixed(1)),
      pitch: parseFloat(pitch.toFixed(1)),
      roll: parseFloat(roll.toFixed(1)),
    },
    attentivenessScore: Math.round(attentivenessScore),
    attentivenessState,
    dominantEmotion,
    emotionConfidence: parseFloat(emotionConfidence.toFixed(1)),
    emotionProbabilities,
    valence: (dominantEmotion as EmotionType) === 'Smiling' ? 0.85 : ((dominantEmotion as EmotionType) === 'Fatigued' ? -0.4 : 0.2),
    arousal: (dominantEmotion as EmotionType) === 'Surprised' ? 0.88 : ((dominantEmotion as EmotionType) === 'Fatigued' ? 0.15 : 0.45),
    cpuUtilization: parseFloat((18.4 + Math.sin(t * 0.4) * 3.2).toFixed(1)), // <30%
    frameLatencyMs: parseFloat((41.2 + Math.cos(t * 0.5) * 4.8).toFixed(1)), // <60ms
    fps: 60,
    meshPoints,
  };
}

// Generate sample session CSV data structure
export function generateSampleCsvRows(count: number = 25): CsvLogEntry[] {
  const rows: CsvLogEntry[] = [];
  const baseTime = Date.now() - count * 1000;

  for (let i = 0; i < count; i++) {
    const metrics = computeLiveMetrics(i * 30, i > 18 ? 'fatigue' : 'focus');
    rows.push({
      timestamp_utc: new Date(baseTime + i * 1000).toISOString(),
      frame_id: i * 30,
      face_present: true,
      ear_left: metrics.earLeft,
      ear_right: metrics.earRight,
      ear_avg: metrics.earAvg,
      perclos_pct: metrics.perclos,
      blink_event: metrics.isBlinking,
      head_yaw_deg: metrics.headPose.yaw,
      head_pitch_deg: metrics.headPose.pitch,
      head_roll_deg: metrics.headPose.roll,
      attentive_score: metrics.attentivenessScore,
      dominant_emotion: metrics.dominantEmotion,
      emotion_confidence: metrics.emotionConfidence,
      inference_latency_ms: metrics.frameLatencyMs,
      cpu_usage_pct: metrics.cpuUtilization,
    });
  }

  return rows;
}

export function convertToCsvString(entries: CsvLogEntry[]): string {
  if (entries.length === 0) return '';
  const headers = Object.keys(entries[0]).join(',');
  const lines = entries.map(row => Object.values(row).join(','));
  return [headers, ...lines].join('\n');
}

export function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
