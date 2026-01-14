
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Trophy, 
  LayoutDashboard, 
  MessageSquare, 
  Wallet,
  AlertTriangle
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
  const [isKakao, setIsKakao] = useState(false);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [outings, setOutings] = useState<Outing[]>([]);
  const [scores, setScores] = useState<RoundScore[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [initialCarryover, setInitialCarryover] = useState(0);

  const loadAllData = () => {
    const savedMembers = storageService.loadMembers();
    const savedOutings = storageService.loadOutings();
    const savedScores = storageService.loadScores();
    const savedFees = storageService.loadFees();
    const savedCarryover = storageService.loadCarryover();

    setInitialCarryover(savedCarryover);

    if (savedMembers && savedMembers.length > 0) {
      setMembers(savedMembers);
    } else {
      setMembers([
        { id: '1', name: '김철수', nickname: '독수리', handicap: 12, avatar: 'https://picsum.photos/seed/chulsoo/100', annualFeeTarget: 600000 },
        { id: '2', name: '이영희', nickname: '버디퀸', handicap: 18, avatar: 'https://picsum.photos/seed/younghee/100', annualFeeTarget: 400000 },
        { id: '3', name: '박지성', nickname: '산소탱크', handicap: 5, avatar: 'https://picsum.photos/seed/jisung/100', annualFeeTarget: 1000000 }
      ]);
    }
    setOutings(savedOutings || []);
    setScores(savedScores || []);
    setFees(savedFees || []);
  };

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('kakaotalk')) setIsKakao(true);
    loadAllData();
  }, []);

  useEffect(() => {
    storageService.saveMembers(members);
    storageService.saveOutings(outings);
    storageService.saveScores(scores);
    storageService.saveFees(fees);
    storageService.saveCarryover(initialCarryover);
    
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [members, outings, scores, fees, initialCarryover]);

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
      {/* 사이드바 */}
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

        <div className="mt-8 pt-8 border-t border-emerald-900">
          <div className="flex items-center gap-3 p-4 bg-emerald-900/30 rounded-2xl border border-emerald-800/50">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">System Active</span>
          </div>
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
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Club Finance Tracker</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-12 pb-32 lg:pb-12 bg-slate-50/50">
          {renderView()}
        </main>

        {/* 모바일 하단 내비게이션 */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-18 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[2rem] flex justify-around items-center px-4 z-50">
          <MobileNavItem icon={<LayoutDashboard />} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <MobileNavItem icon={<Wallet />} active={activeView === 'fees'} onClick={() => setActiveView('fees')} />
          <MobileNavItem icon={<Users />} active={activeView === 'members'} onClick={() => setActiveView('members')} />
          <MobileNavItem icon={<Calendar />} active={activeView === 'outings'} onClick={() => setActiveView('outings')} />
          <MobileNavItem icon={<Trophy />} active={activeView === 'scores'} onClick={() => setActiveView('scores')} />
        </nav>
      </div>

      {isKakao && (
        <div className="fixed top-24 left-6 right-6 z-[100] bg-amber-900/95 backdrop-blur-md text-white p-5 rounded-3xl shadow-2xl border border-amber-500/30">
           <div className="flex items-start gap-4">
              <div className="bg-amber-500 p-2 rounded-2xl text-amber-950 shrink-0"><AlertTriangle size={20} /></div>
              <p className="text-[11px] leading-relaxed text-amber-100/70 font-medium flex-1">
                카톡 브라우저에서는 일부 기능이 제한될 수 있습니다. <b>'다른 브라우저로 열기'</b>를 이용해 주세요.
              </p>
           </div>
        </div>
      )}
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
