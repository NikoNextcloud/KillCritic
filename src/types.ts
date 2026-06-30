// Основни типове, отразяващи структурата на данните в оригиналния KillCritic app.js

export type MoodEntry = {
  mood: string;
  emoji: string;
  at: string; // ISO date
};

export type ReasonEntry = {
  reason: string;
  at: string;
};

export type CravingEntry = {
  level: number; // 1-10
  at: string;
};

export type CostEntry = {
  id: string;
  at: string;
  money: number;
  sleep: number;
  energy: number;
  workouts: number;
  anxiety: number;
  productivity: number;
  note: string;
};

export type RiskPlace = {
  id: string;
  name: string;
  radius: number;
  lat: number;
  lng: number;
  createdAt: string;
};

export type RadarEntry = {
  id: string;
  text: string;
  planned: number;
  actual: number;
  at: string;
  analysis: string;
};

export type AIInsight = {
  text: string;
  at: string;
  source: 'ai' | 'local';
};

export type SoberSession = {
  id: string;
  start: string;
  end: string;
  durationMs: number;
  action: 'stop' | 'reset';
};

export type SobrietyDayState = 'sober' | 'drink' | '';

export type Profile = {
  schemaVersion: 2;
  profileName: string;
  createdAt: string;
  moods: MoodEntry[];
  reasons: ReasonEntry[];
  cravings: CravingEntry[];
  missions: number;
  contact: string;
  wins: number;
  costs: CostEntry[];
  riskPlaces: RiskPlace[];
  radarEntries: RadarEntry[];
  aiInsights: AIInsight[];
  soberStart: string;
  soberSessions: SoberSession[];
  sobrietyDays: Record<string, SobrietyDayState>;
  challengeCompletions: Record<string, number[]>;
  challengeVariant: Record<string, number>;
};

export type SobrietyParts = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type TabId = 'counter' | 'today' | 'calendar' | 'more';
export type SubpageId = 'insights' | 'you' | null;

export const emptyProfile = (): Profile => ({
  schemaVersion: 2,
  profileName: '',
  createdAt: '',
  moods: [],
  reasons: [],
  cravings: [],
  missions: 0,
  contact: '',
  wins: 0,
  costs: [],
  riskPlaces: [],
  radarEntries: [],
  aiInsights: [],
  soberStart: '',
  soberSessions: [],
  sobrietyDays: {},
  challengeCompletions: {},
  challengeVariant: {},
});
