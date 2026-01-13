
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

  useEffect(() => {
    const savedMembers = storageService.loadMembers();
    const savedOutings = storageService.loadOutings();
    const savedScores = storageService.loadScores();
    const savedFees = storageService.loadFees();

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
    
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 1000);
    return () => clearTimeout(timer);
  }, [members, outings, scores, fees]);

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
  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('이 멤버를 정말 삭제하시겠습니까? 관련 기록에서 해당 멤버의 정보가 표시되지 않을 수 있습니다.')) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };
  const handleAddScore = (newScore: RoundScore) => setScores(prev => [newScore, ...prev]);
  
  const handleAddFee = (newFee: FeeRecord) => setFees(prev => [newFee, ...prev]);
  const handleUpdateFee = (updatedFee: FeeRecord) => {
    setFees(prev => prev.map(f => f.id === updatedFee.id ? updatedFee : f));
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
          : [...