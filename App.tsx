
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Users, 
  Trophy, 
  LayoutDashboard, 
  MessageSquare, 
  Wallet,
  AlertTriangle,
  Share2,
  Check,
  Cloud,
  CloudOff,
  Globe,
  Loader2,
  Copy
} from 'lucide-react';
import { View, Outing, Member, RoundScore, FeeRecord } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import OutingList from './components/OutingList.tsx';
import MemberList from './components/MemberList.tsx';
import ScoringBoard from './components/ScoringBoard.tsx';
import AICaddy from './components/AICaddy.tsx';
import FeeManagement from './components/FeeManagement.tsx';
import { storageService } from './services/storageService.ts';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudEnabled, setIsCloudEnabled] = useState(storageService.loadSyncEnabled());
  const [clubId, setClubId] = useState(storageService.loadClubId());
  const [isKakao, setIsKakao] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [outings, setOutings] = useState<Outing[]>([]);
  const [scores, setScores] = useState<RoundScore[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [initialCarryover, setInitialCarryover] = useState(0);

  const loadLocalData = useCallback(() => {
    const savedMembers = storageService.loadMembers();
    const savedOutings = storageService.loadOutings();
    const savedScores = storageService.loadScores();
    const savedFees = storageService.loadFees();
    const savedCarryover = storageService.loadCarryover();

    setInitialCarryover(savedCarryover);
    if (savedMembers && savedMembers.length > 0) setMembers(savedMembers);
    setOutings(savedOutings || []);
    setScores(savedScores || []);
    setFees(savedFees || []);
  }, []);

  // 클라우드에서 데이터 가져오기
  const syncFromCloud = useCallback(async () => {
    if (!isCloudEnabled || !clubId) return;
    setIsSyncing(true);
    const remoteData = await storageService.pullFromCloud(clubId);
    if (remoteData) {
      const localData = storageService.getFullData();
      // 원격 데이터가 더 최신일 경우에만 반영 (간단한 타임스탬프 비교)
      if (remoteData.updatedAt > (localData.updatedAt || 0)) {
        storageService.importFullData(remoteData);
        loadLocalData();
      }
    }
    setTimeout(() => setIsSyncing(false), 800);
  }, [clubId, isCloudEnabled, loadLocalData]);

  // 데이터 변경 시 클라우드에 업로드
  const syncToCloud = useCallback(async () => {
    if (isCloudEnabled && clubId) {
      setIsSyncing(true);
      await storageService.pushToCloud(clubId);
      setTimeout(() => setIsSyncing(false), 800);
    }
  }, [clubId, isCloudEnabled]);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('kakaotalk')) setIsKakao(true);
    loadLocalData();

    // 초기 클라우드 동기화 및 10초마다 폴링
    if (isCloudEnabled && clubId) {
      syncFromCloud();
      const interval = setInterval(syncFromCloud, 10000);
      return () => clearInterval(interval);
    }
  }, [clubId, isCloudEnabled, syncFromCloud, loadLocalData]);

  // 로컬 상태 변경 시 저장 및 업로드 트리거
  useEffect(() => {
    storageService.saveMembers(members);
    storageService.saveOutings(outings);
    storageService.saveScores(scores);
    storageService.saveFees(fees);
    storageService.saveCarryover(initialCarryover);
    syncToCloud();
  }, [members, outings, scores, fees, initialCarryover, syncToCloud]);

  const handleToggleCloud = () => {
    if (!clubId && !isCloudEnabled) {
      const newId = 'CLUB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      setClubId(newId);
      storageService.saveClubId(newId);
    }
    const nextState = !isCloudEnabled;
    setIsCloudEnabled(nextState);
    storageService.saveSyncEnabled(nextState);
  };

  const handleCopyClubId = () => {
    navigator.clipboard.writeText(clubId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard outings={outings} scores={scores} members={members} fees={fees} initialCarryover={initialCarryover} onNavigateOutings={() => setActiveView('outings')} />;
      case 'outings':
        return <OutingList outings={outings} members={members} onAdd={(o) => setOutings([...outings, o])} onUpdate={(updated) => setOutings(outings.map(o => o.id === updated.id ? updated : o))} onDelete={(id) => setOutings(outings.filter(o => o.id !== id))} onToggleParticipant={(outingId, memberId) => { setOutings(outings.map(o => { if (o.id === outingId) { const pts = o.participants || []; return { ...o, participants: pts.includes(memberId) ? pts.filter(id => id !== memberId) : [...pts, memberId] }; } return o; })); }} />;
      case 'members':
        return <MemberList members={members} onAdd={(m) => setMembers([...members, m])} onUpdate={(updated) => setMembers(members.map(m => m.id === updated.id ? updated : m))} onDelete={(id) => setMembers(members.filter(m => m.id !== id))} fees={fees} />;
      case 'scores':
        return <ScoringBoard scores={scores} members={members} outings={outings} onAdd={(s) => setScores([...scores, s])} onUpdate={(updated) => setScores(scores.map(s => s.id === updated.id ? updated : s))} onDelete={(id) => setScores(scores.filter(s => s.id !== id))} />;
      case 'ai-caddy':
        return <AICaddy />;
      case 'fees':
        return <FeeManagement fees={fees} members={members} onToggleStatus={(id) => { setFees(fees.map(f => f.id === id ? { ...f, status: f.status === 'paid' ? 'unpaid' : 'paid' } : f)); }} onAdd={(f) => setFees([...fees, f])} onUpdate={(updated) => setFees(fees.map(f => f.id === updated.id ? updated : f))} onDelete={(id) => setFees(fees.filter(f => f.id !== id))} initialCarryover={initialCarryover} onUpdateCarryover={setInitialCarryover} />;
      default:
        return <Dashboard outings={outings} scores={scores} members={members} fees={fees} initialCarryover={initialCarryover} onNavigateOutings={() => setActiveView('outings')} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Noto_Sans_KR'] selection:bg-emerald-100 selection:text-emerald-900">
      <nav className="hidden lg:flex flex-col w-72 bg-emerald-950 text-white p-8 border-r border-emerald-900/50">
        <div className="flex items-center gap-4 mb-12 px-2 cursor-pointer group" onClick={() => setActiveView('dashboard')}>
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-all duration-500">
            <Trophy className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">동물원</h1>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Club Hub</p>
          </div>
        </div>
        
        <div className="space-y-2.5 flex-1">
          <NavItem icon={<LayoutDashboard size={22} />} label="게시판" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={<Wallet size={22} />} label="회비 관리" active={activeView === 'fees'} onClick={() => setActiveView('fees')} />
          <NavItem icon={<Users size={22} />} label="회원 관리" active={activeView === 'members'} onClick={() => setActiveView('members')} />
          <NavItem icon={<Calendar size={22} />} label="라운딩 일정" active={activeView === 'outings'} onClick={() => setActiveView('outings')} />
          <NavItem icon={<Trophy size={22} />} label="스코어" active={activeView === 'scores'} onClick={() => setActiveView('scores')} />
          <NavItem icon={<MessageSquare size={22} />} label="AI 캐디" active={activeView === 'ai-caddy'} onClick={() => setActiveView('ai-caddy')} />
        </div>

        <div className="mt-8 pt-8 border-t border-emerald-900 space-y-4">
          <button 
            onClick={handleToggleCloud}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isCloudEnabled ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-emerald-900/30 border-emerald-800/50 text-emerald-400'}`}
          >
            <div className="flex items-center gap-3">
              {isCloudEnabled ? <Cloud size={18} /> : <CloudOff size={18} />}
              <span className="text-xs font-black uppercase tracking-widest">라이브 동기화</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-all ${isCloudEnabled ? 'bg-white/30' : 'bg-emerald-950'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isCloudEnabled ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </button>
          
          {isCloudEnabled && (
            <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/50 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5">클럽 코드</p>
              <div className="flex items-center justify-between gap-2">
                <input 
                  type="text" 
                  value={clubId} 
                  onChange={(e) => { setClubId(e.target.value.toUpperCase()); storageService.saveClubId(e.target.value.toUpperCase()); }}
                  className="bg-transparent border-none text-white font-black text-sm p-0 focus:ring-0 w-full"
                />
                <button onClick={handleCopyClubId} className="text-emerald-500 hover:text-white transition-colors">
                  {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-6 lg:px-12 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <div className="lg:hidden flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <div className="bg-emerald-600 p-2 rounded-xl shadow-md"><Trophy className="text-white w-5 h-5" /></div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">동물원</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
               <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : isCloudEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 {isSyncing ? '동기화 중...' : isCloudEnabled ? '라이브 연결됨' : '로컬 모드'}
               </span>
            </div>
          </div>
          
          {isCloudEnabled && (
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl animate-pulse">
                <Globe size={14} className="text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{clubId}</span>
             </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-12 pb-32 lg:pb-12 bg-slate-50/50">
          {renderView()}
        </main>

        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-18 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[2rem] flex justify-around items-center px-4 z-50">
          <MobileNavItem icon={<LayoutDashboard />} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <MobileNavItem icon={<Wallet />} active={activeView === 'fees'} onClick={() => setActiveView('fees')} />
          <MobileNavItem icon={<Users />} active={activeView === 'members'} onClick={() => setActiveView('members')} />
          <MobileNavItem icon={<Calendar />} active={activeView === 'outings'} onClick={() => setActiveView('outings')} />
          <MobileNavItem icon={<Trophy />} active={activeView === 'scores'} onClick={() => setActiveView('scores')} />
        </nav>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${active ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-emerald-100/40 hover:bg-emerald-900 hover:text-emerald-100'}`}>
    {icon}
    {label}
  </button>
);

const MobileNavItem: React.FC<{ icon: React.ReactNode; active?: boolean; onClick: () => void; }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl transition-all duration-300 ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 -translate-y-2' : 'text-slate-400 hover:text-slate-600'}`}>
    {React.cloneElement(icon as React.ReactElement<any>, { size: 22, strokeWidth: active ? 2.5 : 2 })}
  </button>
);

export default App;
