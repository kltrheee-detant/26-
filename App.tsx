
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Trophy, 
  LayoutDashboard, 
  MessageSquare, 
  Plus, 
  Search,
  ChevronRight,
  MapPin,
  Clock,
  Settings,
  Wallet,
  CloudCheck,
  RefreshCw
} from 'lucide-react';
import { View, Outing, Member, RoundScore, FeeRecord } from './types';
import Dashboard from './components/Dashboard';
import OutingList from './components/OutingList';
import MemberList from './components/MemberList';
import ScoringBoard from './components/ScoringBoard';
import AICaddy from './components/AICaddy';
import FeeManagement from './components/FeeManagement';
import SettingsView from './components/SettingsView';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // 초기 데이터 상태
  const [members, setMembers] = useState<Member[]>([]);
  const [outings, setOutings] = useState<Outing[]>([]);
  const [scores, setScores] = useState<RoundScore[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);

  // 1. 데이터 로드 (최초 실행시)
  useEffect(() => {
    const savedMembers = storageService.loadMembers();
    const savedOutings = storageService.loadOutings();
    const savedScores = storageService.loadScores();
    const savedFees = storageService.loadFees();

    if (savedMembers) setMembers(savedMembers);
    else setMembers([
      { id: '1', name: '김철수', nickname: '독수리', handicap: 12, avatar: 'https://picsum.photos/seed/chulsoo/100', annualFeeTarget: 600000 },
      { id: '2', name: '이영희', nickname: '버디퀸', handicap: 18, avatar: 'https://picsum.photos/seed/younghee/100', annualFeeTarget: 400000 },
      { id: '3', name: '박지성', nickname: '산소탱크', handicap: 5, avatar: 'https://picsum.photos/seed/jisung/100', annualFeeTarget: 1000000 }
    ]);

    if (savedOutings) setOutings(savedOutings);
    if (savedScores) setScores(savedScores);
    if (savedFees) setFees(savedFees);
  }, []);

  // 2. 데이터 자동 저장 및 싱크 애니메이션
  useEffect(() => {
    if (members.length > 0) {
      storageService.saveMembers(members);
      storageService.saveOutings(outings);
      storageService.saveScores(scores);
      storageService.saveFees(fees);
      
      setIsSyncing(true);
      const timer = setTimeout(() => setIsSyncing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [members, outings, scores, fees]);

  const handleAddOuting = (newOuting: Outing) => setOutings(prev => [newOuting, ...prev]);
  const handleAddMember = (newMember: Member) => setMembers(prev => [...prev, newMember]);
  const handleAddScore = (newScore: RoundScore) => setScores(prev => [newScore, ...prev]);
  const handleAddFee = (newFee: FeeRecord) => setFees(prev => [newFee, ...prev]);
  const handleToggleFeeStatus = (feeId: string) => {
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, status: f.status === 'paid' ? 'unpaid' : 'paid' } : f));
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard outings={outings} scores={scores} members={members} fees={fees} />;
      case 'outings':
        return <OutingList outings={outings} onAdd={handleAddOuting} members={members} />;
      case 'members':
        return <MemberList members={members} onAdd={handleAddMember} />;
      case 'scores':
        return <ScoringBoard scores={scores} members={members} outings={outings} onAdd={handleAddScore} />;
      case 'ai-caddy':
        return <AICaddy />;
      case 'fees':
        return <FeeManagement fees={fees} members={members} onToggleStatus={handleToggleFeeStatus} onAdd={handleAddFee} />;
      case 'settings':
        return <SettingsView onReload={() => window.location.reload()} />;
      default:
        return <Dashboard outings={outings} scores={scores} members={members} fees={fees} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Noto_Sans_KR']">
      {/* 사이드바 - 데스크탑 */}
      <nav className="hidden md:flex flex-col w-64 bg-emerald-900 text-white p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-white p-2 rounded-lg shadow-inner">
            <Trophy className="text-emerald-900 w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">동물원</h1>
        </div>
        
        <div className="space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="대시보드" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
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

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center">
              <Trophy className="text-emerald-700 w-8 h-8 mr-2" />
              <h1 className="text-xl font-bold text-emerald-900">동물원</h1>
            </div>
            {/* 동기화 상태 표시기 */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
              {isSyncing ? <RefreshCw size={10} className="animate-spin" /> : <CloudCheck size={12} />}
              {isSyncing ? '동기화 중...' : '클라우드 보호됨'}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveView('outings')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">새 라운딩</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-200 overflow-hidden flex items-center justify-center text-emerald-700 font-bold">
              KS
            </div>
          </div>
        </header>

        {/* 다이내믹 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderView()}
        </main>

        {/* 모바일 네비게이션 */}
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
