
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
  RefreshCw,
  DownloadCloud,
  UserPlus,
  QrCode,
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  AlertTriangle,
  ExternalLink,
  MoreVertical
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
  const [showImportPrompt, setShowImportPrompt] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [pendingData, setPendingData] = useState<string | null>(null);
  const [appLinkCopied, setAppLinkCopied] = useState(false);
  const [isKakao, setIsKakao] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  
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

    if (savedOutings) {
      const migratedOutings = savedOutings.map(o => ({
        ...o,
        groups: (o.groups || []).map(g => ({
          ...g,
          memberIds: g.memberIds || [],
          guests: g.guests || [],
          teeOffTime: g.teeOffTime || ''
        })),
        participants: o.participants || []
      }));
      setOutings(migratedOutings);
    } else {
      setOutings([]);
    }
    
    if (savedScores) setScores(savedScores); else setScores([]);
    if (savedFees) setFees(savedFees); else setFees([]);
  };

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('kakaotalk')) {
      setIsKakao(true);
    }

    loadAllData();
    const hash = window.location.hash;
    if (hash.startsWith('#import=')) {
      const data = hash.replace('#import=', '');
      
      try {
        // Base64 디코딩 시도 및 데이터 정합성 확인
        const decoded = decodeURIComponent(atob(data));
        JSON.parse(decoded);
        setPendingData(data);
        setShowImportPrompt(true);
      } catch (e) {
        // 링크가 잘렸거나 형식이 잘못된 경우
        setImportError("카톡방의 '전체보기'를 누르면 링크가 중간에 잘릴 수 있습니다. 주소 전체를 꾹 눌러 복사한 뒤, 크롬이나 사파리 앱을 열어 주소창에 직접 붙여넣어 주세요.");
      }
      // 주소창의 지저분한 hash 제거
      window.history.replaceState(null, '', window.location.pathname);
    }
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

  const handleCopyAppUrl = () => {
    const appUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(appUrl);
    setAppLinkCopied(true);
    setTimeout(() => setAppLinkCopied(false), 2000);
  };

  const handleConfirmImport = () => {
    if (pendingData && storageService.importFullData(pendingData)) {
      loadAllData();
      setShowImportPrompt(false);
      setPendingData(null);
      alert('데이터가 성공적으로 통합되었습니다!');
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard outings={outings} scores={scores} members={members} fees={fees} initialCarryover={initialCarryover} onNavigateOutings={() => setActiveView('outings')} />;
      case 'outings':
        return <OutingList outings={outings} members={members} onAdd={(o) => setOutings([...outings, o])} onUpdate={(updated) => setOutings(outings.map(o => o.id === updated.id ? updated : o))} onDelete={(id) => setOutings(outings.filter(o => o.id !== id))} onToggleParticipant={(outingId, memberId) => { setOutings(outings.map(o => { if (o.id === outingId) { const pts = o.participants || []; return { ...o, participants: pts.includes(memberId) ? pts.filter(id => id !== memberId) : [...pts, memberId] }; } return o; })); }} />;
      case 'members':
        return <MemberList members={members} onAdd={(m) => setMembers([...members, m])} onUpdate={(updated) => setMembers(members.map(m => m.id === updated.id ? updated : m))} onDelete={(id) => setMembers(members.filter(m => m.id !== id))} />;
      case 'scores':
        return <ScoringBoard scores={scores} members={members} outings={outings} onAdd={(s) => setScores([...scores, s])} onUpdate={(updated) => setScores(scores.map(s => s.id === updated.id ? updated : s))} onDelete={(id) => setScores(scores.filter(s => s.id !== id))} />;
      case 'ai-caddy':
        return <AICaddy />;
      case 'fees':
        return <FeeManagement fees={fees} members={members} onToggleStatus={(id) => { setFees(fees.map(f => f.id === id ? { ...f, status: f.status === 'paid' ? 'unpaid' : 'paid' } : f)); }} onAdd={(f) => setFees([...fees, f])} onUpdate={(updated) => setFees(fees.map(f => f.id === updated.id ? updated : f))} onDelete={(id) => setFees(fees.filter(f => f.id !== id))} initialCarryover={initialCarryover} onUpdateCarryover={setInitialCarryover} />;
      case 'settings':
        return <SettingsView onReload={loadAllData} />;
      default:
        return <Dashboard outings={outings} scores={scores} members={members} fees={fees} initialCarryover={initialCarryover} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Noto_Sans_KR']">
      <nav className="hidden md:flex flex-col w-64 bg-emerald-900 text-white p-6">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group" onClick={() => setActiveView('dashboard')}>
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
        <div className="pt-6 border-t border-emerald-800 space-y-2">
           <button onClick={() => setShowInviteModal(true)} className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-emerald-300 font-bold text-sm">
             <UserPlus size={20} />
             <span>어플 멤버 초대</span>
           </button>
           <button onClick={() => setActiveView('settings')} className={`w-full flex items-center gap-3 p-3 hover:bg-emerald-800/50 rounded-xl transition-colors ${activeView === 'settings' ? 'bg-emerald-800' : ''}`}>
             <Settings size={20} className="text-emerald-300" />
             <span className="font-medium">설정</span>
           </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <Trophy className="text-emerald-700 w-8 h-8 mr-2" />
              <h1 className="text-xl font-bold text-emerald-900">동물원</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
              {isSyncing ? <RefreshCw size={10} className="animate-spin" /> : <CloudCheck size={12} />}
              {isSyncing ? '동기화 중...' : '클라우드 보호됨'}
            </div>
          </div>
          <button onClick={() => setShowInviteModal(true)} className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black border border-emerald-100">
             <Share2 size={12} /> 초대
          </button>
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

      {isKakao && (
        <div className="fixed top-4 left-4 right-4 z-[200] bg-amber-900 text-white p-5 rounded-[2rem] shadow-2xl border-2 border-amber-500 animate-in slide-in-from-top-4">
           <div className="flex items-start gap-4">
              <div className="bg-amber-500 p-2 rounded-xl text-amber-950 shrink-0"><AlertTriangle size={24} /></div>
              <div className="flex-1">
                 <h4 className="text-sm font-black mb-1">카카오톡 전용 브라우저 경고</h4>
                 <p className="text-[11px] leading-relaxed text-amber-100 font-medium">
                   구글 보안 정책상 카톡 내부에서는 로그인이 막힙니다. 원활한 이용을 위해 우측 상단 <span className="text-white font-bold underline">점 세개(...)</span>를 눌러 <span className="text-white font-bold underline">'다른 브라우저로 열기'</span>를 선택해 주세요.
                 </p>
              </div>
              <button onClick={() => setIsKakao(false)} className="text-amber-500 p-1"><X size={20} /></button>
           </div>
        </div>
      )}

      {importError && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[250] p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 text-center space-y-6 shadow-2xl">
             <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><AlertTriangle size={40} /></div>
             <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">링크가 손상되었습니다</h3>
                <p className="text-sm text-slate-500 mt-4 leading-relaxed font-medium">{importError}</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">해결 방법</p>
                <ol className="text-xs text-slate-600 space-y-3 font-bold">
                   <li className="flex gap-2"><span className="text-emerald-600">1.</span> 카톡방에서 해당 링크를 길게 꾹 눌러 '복사'</li>
                   <li className="flex gap-2"><span className="text-emerald-600">2.</span> 휴대폰의 크롬이나 사파리 앱 실행</li>
                   <li className="flex gap-2"><span className="text-emerald-600">3.</span> 주소창에 붙여넣고 이동</li>
                </ol>
             </div>
             <button onClick={() => setImportError(null)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl">확인했습니다</button>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-12"></div>
                <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <UserPlus size={40} strokeWidth={2.5} />
                </div>
                <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">멤버들을 초대하세요</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">동물원 클럽의 새 멤버에게 어플 주소를 보냅니다.</p>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left relative group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">어플 주소 (URL)</label>
                  <div className="text-xs font-mono text-emerald-700 font-bold truncate pr-10">{window.location.origin + window.location.pathname}</div>
                  <button onClick={handleCopyAppUrl} className="absolute right-3 bottom-3 p-2 bg-white rounded-lg shadow-sm border border-slate-100 hover:bg-emerald-600 hover:text-white transition-all">
                    {appLinkCopied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleCopyAppUrl} className="flex flex-col items-center gap-2 p-5 bg-emerald-50 text-emerald-700 rounded-3xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm group">
                    <Share2 size={24} />
                    <span className="text-xs font-black">카톡 링크 복사</span>
                  </button>
                  <div className="flex flex-col items-center gap-2 p-5 bg-slate-50 text-slate-700 rounded-3xl border border-slate-200 relative overflow-hidden">
                    <QrCode size={24} />
                    <span className="text-xs font-black">QR 코드 공유</span>
                    <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                       <span className="text-[10px] text-white font-bold">준비 중</span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg">닫기</button>
            </div>
          </div>
        </div>
      )}

      {showImportPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto"><DownloadCloud size={32} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-800">데이터 공유 감지</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium">멤버가 공유한 새로운 클럽 데이터를 불러올까요?<br/><span className="text-rose-500 font-bold">※ 현재 내 기기의 데이터가 교체됩니다.</span></p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowImportPrompt(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm">취소</button>
                <button onClick={handleConfirmImport} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-900/20">데이터 통합하기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface NavItemProps { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; }
const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-950/20' : 'text-emerald-100 hover:bg-emerald-800'}`}>{icon}{label}</button>
);
const MobileNavItem: React.FC<Omit<NavItemProps, 'label'>> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-2 rounded-lg transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}</button>
);

export default App;
