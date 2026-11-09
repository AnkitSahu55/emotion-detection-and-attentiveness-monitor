export type PageView = 'home' | 'specs' | 'privacy' | 'docs' | 'analytics' | 'settings';

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
  yaw: number;
  pitch: number;
  roll: number;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
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
  perclos: number;
  headPose: HeadPose;
  attentivenessScore: number;
  attentivenessState: AttentivenessState;
  dominantEmotion: EmotionType;
  emotionConfidence: number;
  emotionProbabilities: Record<EmotionType, number>;
  valence: number;
  arousal: number;
  cpuUtilization: number;
  frameLatencyMs: number;
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

export interface SessionSummary {
  id: string;
  startedAt: string;
  durationSeconds: number;
  avgAttentiveness: number;
  dominantEmotion: EmotionType;
  blinkCount: number;
  frameCount: number;
}
