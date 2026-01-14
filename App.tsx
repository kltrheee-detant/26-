
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Trophy, 
  LayoutDashboard, 
  MessageSquare, 
  Plus, 
  Settings,
  Wallet,
  CloudCheck,
  RefreshCw
} from 'lucide-react';
import { View, Outing, Member, RoundScore, FeeRecord } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import OutingList from './components/OutingList.tsx';
import MemberList from './components/MemberList.tsx';
import ScoringBoard from './components/ScoringBoard.tsx';
import AICaddy from './components/AICaddy.tsx';
import FeeManagement from './components/FeeManagement.tsx';
import SettingsView from './components/SettingsView.tsx';
import { storageService } from './services/storageService.ts';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [outings, setOutings] = useState<Outing[]>([]);
  const [scores, setScores] = useState<RoundScore[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [initialCarryover, setInitialCarryover] = useState(0);

  useEffect(() => {
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

    if (savedOutings) setOutings(savedOutings);
    if (savedScores) setScores(savedScores);
    if (savedFees) setFees(savedFees);
  }, []);

  useEffect(() => {
    storageService.saveMembers(members);
    storageService.saveOutings(outings);
    storageService.saveScores(scores);
    storageService.saveFees(fees);
    storageService.saveCarryover(initialCarryover);
    
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 1000);
    return () => clearTimeout(timer);
  }, [members, outings, scores, fees, initialCarryover]);

  const handleAddOuting = (newOuting: Outing) => setOutings(prev => [newOuting, ...prev]);
  const handleUpdateOuting = (updatedOuting: Outing) => {
    setOutings(prev => prev.map(o => o.id === updatedOuting.id ? updatedOuting : o));
  };
  const handleDeleteOuting = (id: string) => {
    if (window.confirm('이 라운딩 일정을 삭제하시겠습니까?')) {
      setOutings(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleAddMember = (newMember: Member) => setMembers(prev => [...prev, newMember]);
  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };
  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('이 멤버를 정말 삭제하시겠습니까? 관련 기록에서 해당 멤버의 정보가 표시되지 않을 수 있습니다.')) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };
  
  const handleAddScore = (newScore: RoundScore) => setScores(prev => [newScore, ...prev]);
  const handleUpdateScore = (updatedScore: RoundScore) => {
    setScores(prev => prev.map(s => s.id === updatedScore.id ? updatedScore : s));
  };
  const handleDeleteScore = (id: string) => {
    if (window.confirm('이 스코어 기록을 삭제하시겠습니까?')) {
      setScores(prev => prev.filter(s => s.id !== id));
    }
  };
  
  const handleAddFee = (newFee: FeeRecord) => setFees(prev => [newFee, ...prev]);
  const handleUpdateFee = (updatedFee: FeeRecord) => {
    setFees(prev => prev.map(f => f.id === updatedFee.id ? updatedFee : f));
  };
  const handleDeleteFee = (id: string) => {
    if (window.confirm('이 회비 내역을 삭제하시겠습니까?')) {
      setFees(prev => prev.filter(f => f.id !== id));
    }
  };
  const handleToggleFeeStatus = (feeId: string) => {
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, status: f.status === 'paid' ? 'unpaid' : 'paid' } : f));
  };
  
  const handleToggleParticipant = (outingId: string, memberId: string) => {
    setOutings(prev => prev.map(o => {
      if (o.id !== outingId) return o;
      const isAlreadyIn = o.participants.includes(memberId);
      return {
        ...o,
        participants: isAlreadyIn 
          ? o.participants.filter(id => id !== memberId)
          : [...o.participants, memberId]
      };
    }));
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard outings={outings} scores={scores} members={members} fees={fees} initialCarryover={initialCarryover} onNavigateOutings={() => setActiveView('outings')} />;
      case 'outings':
        return (
          <OutingList 
            outings={outings} 
            onAdd={handleAddOuting} 
            onUpdate={handleUpdateOuting}
            onDelete={handleDeleteOuting}
            onToggleParticipant={handleToggleParticipant} 
            members={members} 
          />
        );
      case 'members':
        return <MemberList members={members} onAdd={handleAddMember} onUpdate={handleUpdateMember} onDelete={handleDeleteMember} />;
      case 'scores':
        return <ScoringBoard scores={scores} members={members} outings={outings} onAdd={handleAddScore} onUpdate={handleUpdateScore} onDelete={handleDeleteScore} />;
      case 'ai-caddy':
        return <AICaddy />;
      case 'fees':
        return (
          <FeeManagement 
            fees={fees} 
            members={members} 
            onToggleStatus={handleToggleFeeStatus} 
            onAdd={handleAddFee} 
            onUpdate={handleUpdateFee} 
            onDelete={handleDeleteFee} 
            initialCarryover={initialCarryover}
            onUpdateCarryover={setInitialCarryover}
          />
        );
      case 'settings':
        return <SettingsView onReload={() => window.location.reload()} />;
      default:
        return <Dashboard outings={outings} scores={scores} members={members} fees={fees} initialCarryover={initialCarryover} onNavigateOutings={() => setActiveView('outings')} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Noto_Sans_KR']">
      <nav className="hidden md:flex flex-col w-64 bg-emerald-900 text-white p-6">
        <div 
          className="flex items-center gap-3 mb-10 px-2 cursor-pointer group"
          onClick={() => setActiveView('dashboard')}
        >
          <div className="bg-white p-2 rounded-lg shadow-inner group-hover:scale-110 transition-transform">
            <Trophy className="text-emerald-900 w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">동물원</h1>
        </div>
        
        <div className="space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="게시판" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={<Calendar size={20} />} label="라운딩 일정" active={activeView === 'outings'} onClick={() => setActiveView('outings')} />
          <NavItem icon={<Users size={20} />} label="멤버 관리" active={activeView === 'members'} onClick={() => setActiveView('members')} />
          <NavItem icon={<Trophy size={20} />} label="스코어보드" active={activeView === 'scores'} onClick={() => setActiveView('scores')} />
          <NavItem icon={<Wallet size={20} />} label="회비 관리" active={activeView === 'fees'} onClick={() => setActiveView('fees')} />
          <NavItem icon={<MessageSquare size={20} />} label="AI 캐디" active={activeView === 'ai-caddy'} onClick={() => setActiveView('ai-caddy')} />
        </div>

        <div className="pt-6 border-t border-emerald-800">
           <button 
             onClick={() => setActiveView('settings')}
             className={`w-full flex items-center gap-3 p-2 hover:bg-emerald-800/50 rounded-lg transition-colors ${activeView === 'settings' ? 'bg-emerald-800' : ''}`}
           >
             <Settings size={20} className="text-emerald-300" />
             <span className="font-medium">설정</span>
           </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div 
              className="md:hidden flex items-center cursor-pointer"
              onClick={() => setActiveView('dashboard')}
            >
              <Trophy className="text-emerald-700 w-8 h-8 mr-2" />
              <h1 className="text-xl font-bold text-emerald-900">동물원</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
              {isSyncing ? <RefreshCw size={10} className="animate-spin" /> : <CloudCheck size={12} />}
              {isSyncing ? '동기화 중...' : '클라우드 보호됨'}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 우측 상단 '새 라운딩' 버튼이 제거되었습니다. */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderView()}
        </main>

        <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around p-3 sticky bottom-0 z-10">
          <MobileNavItem icon={<LayoutDashboard />} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <MobileNavItem icon={<Calendar />} active={activeView === 'outings'} onClick={() => setActiveView('outings')} />
          <MobileNavItem icon={<Wallet />} active={activeView === 'fees'} onClick={() => setActiveView('fees')} />
          <MobileNavItem icon={<Trophy />} active={activeView === 'scores'} onClick={() => setActiveView('scores')} />
          <MobileNavItem icon={<Settings />} active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </nav>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      active ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-950/20' : 'text-emerald-100 hover:bg-emerald-800'
    }`}
  >
    {icon}
    {label}
  </button>
);

const MobileNavItem: React.FC<Omit<NavItemProps, 'label'>> = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-lg transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
  </button>
);

export default App;
