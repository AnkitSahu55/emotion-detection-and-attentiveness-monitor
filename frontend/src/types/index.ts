export type PageView = 'home' | 'specs' | 'privacy' | 'docs';

export type AttentivenessState = 'optimal' | 'alert' | 'distracted' | 'fatigued';

export type EmotionType = 
  | 'Neutral' 
  | 'Engaged' 
  | 'Focused' 
  | 'Inquisitive' 
  | 'Surprised' 
  | 'Fatigued' 
  | 'Smiling'
  | 'Confused';

export interface HeadPose {
  yaw: number;     // Left/Right rotation (-45 to +45 deg)
  pitch: number;   // Up/Down tilt (-30 to +30 deg)
  roll: number;    // Lateral tilt (-25 to +25 deg)
}

export interface LandmarkPoint {
  x: number;       // 0 to 1 normalized
  y: number;       // 0 to 1 normalized
  z: number;       // depth relative to face center
  id: number;
  region: 'mesh' | 'contour' | 'leftEye' | 'rightEye' | 'leftIris' | 'rightIris' | 'lips' | 'nose' | 'eyebrows';
}

export interface FaceMetrics {
  timestamp: string;
  frameIndex: number;
  faceDetected: boolean;
  earLeft: number;
  earRight: number;
  earAvg: number;
  isBlinking: boolean;
  blinkCount: number;
  blinkRateBpm: number;
  perclos: number; // Percentage of Eye Closure (0-100%)
  headPose: HeadPose;
  attentivenessScore: number; // 0 to 100
  attentivenessState: AttentivenessState;
  dominantEmotion: EmotionType;
  emotionConfidence: number; // 0 to 100
  emotionProbabilities: Record<EmotionType, number>;
  valence: number; // -1 (unpleasant) to +1 (pleasant)
  arousal: number; // 0 (calm) to 1 (excited)
  cpuUtilization: number; // < 30%
  frameLatencyMs: number; // < 60ms
  fps: number;
  meshPoints: LandmarkPoint[];
}

export interface CsvLogEntry {
  timestamp_utc: string;
  frame_id: number;
  face_present: boolean;
  ear_left: number;
  ear_right: number;
  ear_avg: number;
  perclos_pct: number;
  blink_event: boolean;
  head_yaw_deg: number;
  head_pitch_deg: number;
  head_roll_deg: number;
  attentive_score: number;
  dominant_emotion: string;
  emotion_confidence: number;
  inference_latency_ms: number;
  cpu_usage_pct: number;
}
