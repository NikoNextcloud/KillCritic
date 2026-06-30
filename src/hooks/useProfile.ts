import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AIInsight,
  CostEntry,
  CravingEntry,
  emptyProfile,
  MoodEntry,
  Profile,
  RadarEntry,
  ReasonEntry,
  RiskPlace,
  SobrietyDayState,
  SobrietyParts,
  SoberSession,
} from '../types';

const STORAGE_KEY = 'killcritic';

function loadProfile(): Profile {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || saved.schemaVersion !== 2) return emptyProfile();
    return { ...emptyProfile(), ...saved };
  } catch {
    return emptyProfile();
  }
}

export function localDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function calculateSobrietyParts(start: Date | null, end: Date): SobrietyParts {
  if (!start || start > end) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  let cursor = new Date(start);
  let years = end.getFullYear() - cursor.getFullYear();
  let candidate = new Date(cursor);
  candidate.setFullYear(candidate.getFullYear() + years);
  if (candidate > end) {
    years--;
    candidate = new Date(cursor);
    candidate.setFullYear(candidate.getFullYear() + years);
  }
  cursor = candidate;
  let months = (end.getFullYear() - cursor.getFullYear()) * 12 + end.getMonth() - cursor.getMonth();
  candidate = new Date(cursor);
  candidate.setMonth(candidate.getMonth() + months);
  if (candidate > end) {
    months--;
    candidate = new Date(cursor);
    candidate.setMonth(candidate.getMonth() + months);
  }
  cursor = candidate;
  let secondsLeft = Math.max(0, Math.floor((end.getTime() - cursor.getTime()) / 1000));
  const days = Math.floor(secondsLeft / 86400);
  secondsLeft %= 86400;
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft %= 3600;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return { years, months, days, hours, minutes, seconds };
}

export function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days) return `${days} д. ${hours} ч.`;
  if (hours) return `${hours} ч. ${minutes} мин.`;
  return `${minutes} мин.`;
}

function normalizedText(text: string): string {
  return text
    .toLocaleLowerCase('bg-BG')
    .replace(/[^a-zа-я0-9 ]/gi, '')
    .trim();
}

function localRadarAnalysis(text: string, planned: number, radarEntries: RadarEntry[]): string {
  const normalized = normalizedText(text);
  const phrases = ['само една', 'заслужавам', 'няма проблем', 'контролирам се', 'последно', 'от утре', 'всички пият'];
  const found = phrases.filter((phrase) => normalized.includes(phrase));
  const similar = radarEntries.filter((item) => {
    const old = normalizedText(item.text);
    return found.some((phrase) => old.includes(phrase)) || (normalized.length > 5 && old.includes(normalized.slice(0, Math.min(12, normalized.length))));
  });
  const exceeded = similar.filter((item) => Number(item.actual) > Number(item.planned)).length;
  if (similar.length) return `Тази мисъл прилича на ${similar.length} твои предишни случая. В ${exceeded} от тях си изпил повече от планираното. Това е модел за наблюдение, не присъда.`;
  if (found.length) return `Радарът разпозна типична фраза: „${found[0]}“. Все още няма достатъчно лична история за сравнение. Планът ти в момента е ${planned} напитки.`;
  return 'Това е първи подобен запис. Запазваме го, за да сравняваме бъдещите решения с реалния резултат.';
}

async function requestAI(mode: 'radar' | 'deep', payload: unknown): Promise<string> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, payload }),
    });
    if (!response.ok) return '';
    const result = await response.json();
    return result.analysis || '';
  } catch {
    return '';
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [now, setNow] = useState(new Date());
  const audioUrlRef = useRef<string>(localStorage.getItem('kc_audio') || '');
  const [audioUrl, setAudioUrl] = useState(audioUrlRef.current);

  // Жив тик за брояча
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Персистиране при всяка промяна
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const update = useCallback((updater: (draft: Profile) => Profile) => {
    setProfile((prev) => updater(prev));
  }, []);

  // ---- Профил / Onboarding ----
  const createProfile = useCallback((name: string) => {
    const fresh = emptyProfile();
    fresh.profileName = name;
    fresh.createdAt = new Date().toISOString();
    localStorage.removeItem('kc_audio');
    audioUrlRef.current = '';
    setAudioUrl('');
    setProfile(fresh);
  }, []);

  const resetData = useCallback(() => {
    setProfile((prev) => {
      const fresh = emptyProfile();
      fresh.profileName = prev.profileName;
      fresh.createdAt = new Date().toISOString();
      return fresh;
    });
    localStorage.removeItem('kc_audio');
    audioUrlRef.current = '';
    setAudioUrl('');
  }, []);

  const newProfileFromScratch = useCallback(() => {
    localStorage.removeItem('kc_audio');
    localStorage.removeItem(STORAGE_KEY);
    audioUrlRef.current = '';
    setAudioUrl('');
    setProfile(emptyProfile());
  }, []);

  const setContact = useCallback((contact: string) => {
    update((draft) => ({ ...draft, contact }));
  }, [update]);

  // ---- Брояч на трезвеност ----
  const startSobriety = useCallback(() => {
    update((draft) => (draft.soberStart ? draft : { ...draft, soberStart: new Date().toISOString() }));
  }, [update]);

  const stopSobriety = useCallback(() => {
    update((draft) => {
      if (!draft.soberStart) return draft;
      const end = new Date();
      const start = new Date(draft.soberStart);
      const session: SoberSession = {
        id: String(Date.now()),
        start: start.toISOString(),
        end: end.toISOString(),
        durationMs: Math.max(0, end.getTime() - start.getTime()),
        action: 'stop',
      };
      return { ...draft, soberStart: '', soberSessions: [...draft.soberSessions, session] };
    });
  }, [update]);

  const sobrietyParts = calculateSobrietyParts(profile.soberStart ? new Date(profile.soberStart) : null, now);
  const sobrietyTotalDays = profile.soberStart
    ? Math.max(0, Math.floor((now.getTime() - new Date(profile.soberStart).getTime()) / 86400000))
    : 0;

  // ---- Ежедневни предизвикателства ----
  const toggleChallenge = useCallback((index: number) => {
    const key = localDateKey();
    update((draft) => {
      const completed = draft.challengeCompletions[key] || [];
      const isDone = completed.includes(index);
      return {
        ...draft,
        wins: Math.max(0, draft.wins + (isDone ? -1 : 1)),
        challengeCompletions: {
          ...draft.challengeCompletions,
          [key]: isDone ? completed.filter((i) => i !== index) : [...completed, index],
        },
      };
    });
  }, [update]);

  const refreshChallenges = useCallback(() => {
    const key = localDateKey();
    update((draft) => {
      const completedCount = (draft.challengeCompletions[key] || []).length;
      return {
        ...draft,
        wins: Math.max(0, draft.wins - completedCount),
        challengeVariant: { ...draft.challengeVariant, [key]: (draft.challengeVariant[key] || 0) + 1 },
        challengeCompletions: { ...draft.challengeCompletions, [key]: [] },
      };
    });
  }, [update]);

  // ---- Календар ----
  const cycleCalendarDay = useCallback((key: string) => {
    update((draft) => {
      const current = draft.sobrietyDays[key];
      const next: SobrietyDayState = !current ? 'sober' : current === 'sober' ? 'drink' : '';
      const sobrietyDays = { ...draft.sobrietyDays };
      if (next) sobrietyDays[key] = next;
      else delete sobrietyDays[key];
      return { ...draft, sobrietyDays };
    });
  }, [update]);

  // ---- Настроения ----
  const addMood = useCallback((mood: string, emoji: string) => {
    const entry: MoodEntry = { mood, emoji, at: new Date().toISOString() };
    update((draft) => ({ ...draft, moods: [...draft.moods, entry] }));
  }, [update]);

  // ---- Мисии ----
  const completeMission = useCallback(() => {
    update((draft) => ({ ...draft, missions: draft.missions + 1, wins: draft.wins + 1 }));
  }, [update]);

  // ---- Причини ----
  const addReason = useCallback((reason: string) => {
    const entry: ReasonEntry = { reason, at: new Date().toISOString() };
    update((draft) => ({ ...draft, reasons: [...draft.reasons, entry], wins: draft.wins + 1 }));
  }, [update]);

  // ---- Истинската цена ----
  const addCost = useCallback((entry: Omit<CostEntry, 'id' | 'at'>) => {
    const full: CostEntry = { ...entry, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), at: new Date().toISOString() };
    update((draft) => ({ ...draft, costs: [...draft.costs, full], wins: draft.wins + 1 }));
  }, [update]);

  const deleteCost = useCallback((id: string) => {
    update((draft) => ({ ...draft, costs: draft.costs.filter((item) => item.id !== id) }));
  }, [update]);

  // ---- Радар за самозаблуда ----
  const analyzeRadar = useCallback(
    async (text: string, planned: number, actual: number): Promise<RadarEntry> => {
      const local = localRadarAnalysis(text, planned, profile.radarEntries);
      const entry: RadarEntry = { id: String(Date.now()), text, planned, actual, at: new Date().toISOString(), analysis: local };
      update((draft) => ({ ...draft, radarEntries: [...draft.radarEntries, entry] }));
      const ai = await requestAI('radar', { current: entry, history: profile.radarEntries.slice(-20), costs: profile.costs.slice(-10), reasons: profile.reasons.slice(-20) });
      if (ai) {
        const updatedEntry = { ...entry, analysis: ai };
        update((draft) => ({
          ...draft,
          radarEntries: draft.radarEntries.map((item) => (item.id === entry.id ? updatedEntry : item)),
        }));
        return updatedEntry;
      }
      return entry;
    },
    [profile.radarEntries, profile.costs, profile.reasons, update]
  );

  // ---- Дълбок AI анализ ----
  const runDeepAnalysis = useCallback(async (): Promise<{ insight: AIInsight; usedAI: boolean }> => {
    const local = buildLocalDeepInsight(profile);
    const ai = await requestAI('deep', {
      moods: profile.moods.slice(-30),
      reasons: profile.reasons.slice(-30),
      cravings: profile.cravings.slice(-30),
      costs: profile.costs.slice(-20),
      radar: profile.radarEntries.slice(-20),
    });
    const insight: AIInsight = { text: ai || local, at: new Date().toISOString(), source: ai ? 'ai' : 'local' };
    update((draft) => ({ ...draft, aiInsights: [...draft.aiInsights, insight] }));
    return { insight, usedAI: Boolean(ai) };
  }, [profile, update]);

  // ---- Рискови места ----
  const addRiskPlace = useCallback((place: Omit<RiskPlace, 'id' | 'createdAt'>) => {
    const entry: RiskPlace = { ...place, id: String(Date.now()), createdAt: new Date().toISOString() };
    update((draft) => ({ ...draft, riskPlaces: [...draft.riskPlaces, entry], wins: draft.wins + 1 }));
  }, [update]);

  const deleteRiskPlace = useCallback((id: string) => {
    update((draft) => ({ ...draft, riskPlaces: draft.riskPlaces.filter((p) => p.id !== id) }));
  }, [update]);

  // ---- Кризисен момент (вълна) ----
  const addCraving = useCallback((level: number) => {
    const entry: CravingEntry = { level, at: new Date().toISOString() };
    update((draft) => ({ ...draft, cravings: [...draft.cravings, entry], wins: draft.wins + 1 }));
  }, [update]);

  const registerWaveSurvived = useCallback(() => {
    update((draft) => ({ ...draft, wins: draft.wins + 1 }));
  }, [update]);

  const saveAudioMessage = useCallback((dataUrl: string) => {
    try {
      localStorage.setItem('kc_audio', dataUrl);
      audioUrlRef.current = dataUrl;
      setAudioUrl(dataUrl);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'killcritic-my-data.json';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }, [profile]);

  return {
    profile,
    now,
    audioUrl,
    sobrietyParts,
    sobrietyTotalDays,
    createProfile,
    resetData,
    newProfileFromScratch,
    setContact,
    startSobriety,
    stopSobriety,
    toggleChallenge,
    refreshChallenges,
    cycleCalendarDay,
    addMood,
    completeMission,
    addReason,
    addCost,
    deleteCost,
    analyzeRadar,
    runDeepAnalysis,
    addRiskPlace,
    deleteRiskPlace,
    addCraving,
    registerWaveSurvived,
    saveAudioMessage,
    exportData,
  };
}

function buildLocalDeepInsight(profile: Profile): string {
  if (!profile.costs.length && !profile.reasons.length && !profile.radarEntries.length) {
    return 'Нужни са още няколко лични записа, за да се появи надежден модел.';
  }
  const averageAnxiety = profile.costs.length ? profile.costs.reduce((sum, item) => sum + item.anxiety, 0) / profile.costs.length : 0;
  const exceeded = profile.radarEntries.filter((item) => item.actual > item.planned).length;
  return `Имаш ${profile.costs.length} записа за цена и ${profile.radarEntries.length} записа в радара. Средната отбелязана тревожност е ${averageAnxiety.toFixed(1)}/10. В ${exceeded} случая реалното количество е било над планираното.`;
}
