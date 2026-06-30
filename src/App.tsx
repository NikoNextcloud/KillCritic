import React, { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useProfile } from './hooks/useProfile';
import { useToast, ToastProvider } from './components/Toast';
import { Onboarding } from './components/Onboarding';
import { CounterPage } from './components/CounterPage';
import { ChallengesPage } from './components/ChallengesPage';
import { CalendarPage } from './components/CalendarPage';
import { MorePage } from './components/MorePage';
import { InsightsPage } from './components/InsightsPage';
import { YouPage } from './components/YouPage';
import { CrisisOverlay } from './components/CrisisOverlay';
import { Modal } from './components/Modal';
import { CostModal } from './components/modals/CostModal';
import { RadarModal } from './components/modals/RadarModal';
import { PlacesModal } from './components/modals/PlacesModal';
import { SimulatorModal } from './components/modals/SimulatorModal';
import { ReasonModal } from './components/modals/ReasonModal';
import { MessageModal } from './components/modals/MessageModal';
import { missions } from './data/content';
import { TabId, SubpageId } from './types';

type ModalKind = 'cost' | 'radar' | 'places' | 'simulator' | 'reason' | 'message' | 'contact' | null;

function AppInner() {
  const profileState = useProfile();
  const toast = useToast();
  const { profile } = profileState;

  const [activeTab, setActiveTab] = useState<TabId>('counter');
  const [subpage, setSubpage] = useState<SubpageId>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mission, setMission] = useState(missions[Math.floor(Math.random() * missions.length)]);
  const watcherRef = useRef<number | null>(null);
  const warnedPlaces = useRef<Set<string>>(new Set());

  // GPS наблюдение за рискови места
  useEffect(() => {
    if (!profile.profileName) return;
    if (watcherRef.current) navigator.geolocation.clearWatch(watcherRef.current);
    if (!navigator.geolocation || !profile.riskPlaces.length) return;
    watcherRef.current = navigator.geolocation.watchPosition(
      (position) => {
        profile.riskPlaces.forEach((place) => {
          const distance = distanceInMeters(position.coords.latitude, position.coords.longitude, place.lat, place.lng);
          if (distance <= place.radius && !warnedPlaces.current.has(place.id)) {
            warnedPlaces.current.add(place.id);
            navigator.vibrate?.([200, 100, 200]);
            toast(`Наближаваш „${place.name}“. Искаш ли да избереш друг маршрут?`, 6500);
          }
          if (distance > place.radius * 1.5) warnedPlaces.current.delete(place.id);
        });
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 30000 }
    );
    return () => {
      if (watcherRef.current) navigator.geolocation.clearWatch(watcherRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.riskPlaces, profile.profileName]);

  if (!profile.profileName) {
    return <Onboarding onCreate={(name) => { profileState.createProfile(name); toast('Твоят профил започна от 0'); }} />;
  }

  const handleNewProfile = () => {
    if (!confirm('Новият профил ще изтрие сегашните локални записи. Да продължим ли?')) return;
    profileState.newProfileFromScratch();
  };

  const handleResetData = () => {
    if (!confirm('Сигурен ли си? Всички стойности ще се върнат на 0 и локалните записи ще бъдат изтрити.')) return;
    profileState.resetData();
    toast('Всичко е върнато на 0');
  };

  const handleShare = async () => {
    if (!profile.soberStart) return toast('Първо натисни „Трезвеност“');
    const text = `Моят път с KILLCRITIC: ${profileState.sobrietyTotalDays} дни без алкохол.`;
    try {
      if (navigator.share) await navigator.share({ title: 'Моят прогрес', text });
      else {
        await navigator.clipboard.writeText(text);
        toast('Прогресът е копиран');
      }
    } catch {
      /* отказан share - тих изход */
    }
  };

  const handleRunDeepAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { usedAI } = await profileState.runDeepAnalysis();
      toast(usedAI ? 'AI анализът е готов' : 'Показан е локален анализ; AI endpoint не е активен', 3500);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const goTab = (tab: TabId) => {
    setActiveTab(tab);
    setSubpage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSubpage = (page: SubpageId) => {
    setSubpage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderMainContent = () => {
    if (subpage === 'insights') {
      return <InsightsPage profile={profile} onBack={() => setSubpage(null)} onRunDeepAnalysis={handleRunDeepAnalysis} isAnalyzing={isAnalyzing} />;
    }
    if (subpage === 'you') {
      return (
        <YouPage
          profile={profile}
          onBack={() => setSubpage(null)}
          onNewProfile={handleNewProfile}
          onSetContact={(c) => {
            profileState.setContact(c);
            toast('Контактът е запазен');
          }}
          onExport={profileState.exportData}
          onReset={handleResetData}
        />
      );
    }
    switch (activeTab) {
      case 'counter':
        return (
          <CounterPage
            profile={profile}
            parts={profileState.sobrietyParts}
            totalDays={profileState.sobrietyTotalDays}
            onStart={() => {
              profileState.startSobriety();
              toast('Броячът започна от нула');
            }}
            onStop={() => {
              if (!confirm('Да спрем брояча и да запазим това постижение в историята?')) return;
              profileState.stopSobriety();
              toast('Постижението е запазено');
            }}
            onShare={handleShare}
          />
        );
      case 'today':
        return <ChallengesPage profile={profile} onToggle={profileState.toggleChallenge} onRefresh={() => { profileState.refreshChallenges(); toast('Днешният план е обновен'); }} />;
      case 'calendar':
        return <CalendarPage profile={profile} onCycleDay={profileState.cycleCalendarDay} />;
      case 'more':
      default:
        return (
          <MorePage
            profile={profile}
            onOpenInsights={() => openSubpage('insights')}
            onOpenYou={() => openSubpage('you')}
            onStartCraving={() => setCrisisOpen(true)}
            onSelectMood={(mood, emoji) => {
              profileState.addMood(mood, emoji);
              toast('Настроението е отбелязано');
            }}
            onOpenSimulator={() => setActiveModal('simulator')}
            onOpenMessage={() => setActiveModal('message')}
            onOpenReason={() => setActiveModal('reason')}
            onOpenPlaces={() => setActiveModal('places')}
            onOpenCost={() => setActiveModal('cost')}
            onOpenRadar={() => setActiveModal('radar')}
            mission={mission}
            onNewMission={() => setMission(missions[Math.floor(Math.random() * missions.length)])}
            onCompleteMission={() => {
              profileState.completeMission();
              toast('Мисията е твоя победа ✦');
              setMission(missions[Math.floor(Math.random() * missions.length)]);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#e5e7eb] font-sans">
      {/* Status bar */}
      <div className="bg-[#0c0c0e] px-4 sm:px-6 py-2.5 flex justify-between items-center text-[10px] text-gray-500 font-mono tracking-wider border-b border-white/[0.03]">
        <div className="font-semibold">{new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="flex items-center space-x-1.5">
          <span className="text-[9px] text-emerald-500 font-bold tracking-widest">● {profile.soberStart ? 'LIVE STATUS' : 'СПРЯН'}</span>
        </div>
      </div>

      {/* Header */}
      <header className="px-4 sm:px-6 pt-5 pb-3 flex justify-between items-center max-w-2xl mx-auto">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold tracking-tighter uppercase italic text-white font-display">KillCritic</h1>
          <p className="text-[10px] text-red-500 uppercase tracking-widest font-extrabold">кризата има край</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <span className="text-sm">👤</span>
            <span className="text-[11px] font-bold text-gray-200">{profile.profileName}</span>
          </div>
          <button
            onClick={handleNewProfile}
            title="Нов профил"
            className="p-1.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-full border border-white/5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-2 pb-28">{renderMainContent()}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0c0c0e]/95 backdrop-blur-md border-t border-white/[0.03] py-3 px-4 z-40">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1">
          <NavButton label="Брояч" icon="◷" active={!subpage && activeTab === 'counter'} onClick={() => goTab('counter')} />
          <NavButton label="Днес" icon="✦" active={!subpage && activeTab === 'today'} onClick={() => goTab('today')} />
          <NavButton label="Календар" icon="▦" active={!subpage && activeTab === 'calendar'} onClick={() => goTab('calendar')} />
          <NavButton label="Още" icon="•••" active={activeTab === 'more'} onClick={() => goTab('more')} />
        </div>
      </nav>

      {/* Crisis overlay */}
      <CrisisOverlay
        open={crisisOpen}
        onClose={() => setCrisisOpen(false)}
        onSurvived={() => {
          profileState.registerWaveSurvived();
          toast('Запазено. Всяка вълна има край.');
        }}
        onSaveIntensity={(level) => {
          profileState.addCraving(level);
          toast('Запазено. Всяка вълна има край.');
        }}
        contact={profile.contact}
        audioUrl={profileState.audioUrl}
      />

      {/* Modals */}
      <Modal open={activeModal === 'cost'} onClose={() => setActiveModal(null)}>
        <CostModal costs={profile.costs} onSave={(entry) => { profileState.addCost(entry); toast('Истинската цена е записана'); }} onDelete={profileState.deleteCost} />
      </Modal>

      <Modal open={activeModal === 'radar'} onClose={() => setActiveModal(null)}>
        <RadarModal radarEntries={profile.radarEntries} onAnalyze={profileState.analyzeRadar} />
      </Modal>

      <Modal open={activeModal === 'places'} onClose={() => setActiveModal(null)}>
        <PlacesModal places={profile.riskPlaces} onSave={(p) => { profileState.addRiskPlace(p); toast('Рисковото място е запазено'); }} onDelete={profileState.deleteRiskPlace} watching={Boolean(watcherRef.current)} />
      </Modal>

      <Modal open={activeModal === 'simulator'} onClose={() => setActiveModal(null)}>
        <SimulatorModal onClose={() => setActiveModal(null)} />
      </Modal>

      <Modal open={activeModal === 'reason'} onClose={() => setActiveModal(null)}>
        <ReasonModal
          onSave={(reason) => {
            profileState.addReason(reason);
            toast('Наблюдението е запазено');
            setActiveModal(null);
          }}
        />
      </Modal>

      <Modal open={activeModal === 'message'} onClose={() => setActiveModal(null)}>
        <MessageModal audioUrl={profileState.audioUrl} onSave={profileState.saveAudioMessage} toast={toast} />
      </Modal>
    </div>
  );
}

function NavButton({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-bold transition ${
        active ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </button>
  );
}

function distanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
