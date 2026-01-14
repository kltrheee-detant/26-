
import React, { useState } from 'react';
import { Member, FeeRecord } from '../types.ts';
import { UserPlus, Search, Trash2, X, Wallet, Tag, Edit3, MoreVertical, Trophy, Target } from 'lucide-react';

interface Props {
  members: Member[];
  onAdd: (member: Member) => void;
  onUpdate: (member: Member) => void;
  onDelete: (id: string) => void;
  fees: FeeRecord[];
}

const MemberList: React.FC<Props> = ({ members, onAdd, onUpdate, onDelete, fees }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [handicap, setHandicap] = useState('18');
  const [annualFee, setAnnualFee] = useState('500000');

  const getPaidTotal = (mid: string) => {
    return fees.filter(f => f.memberId === mid && f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  };

  const resetForm = () => {
    setName('');
    setNickname('');
    setHandicap('18');
    setAnnualFee('500000');
    setEditingMember(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const memberData = {
      name,
      nickname: nickname.trim() || undefined,
      handicap: parseInt(handicap),
      annualFeeTarget: parseInt(annualFee.replace(/,/g, '')),
    };

    if (editingMember) {
      onUpdate({ ...editingMember, ...memberData });
    } else {
      onAdd({ ...memberData, id: Date.now().toString(), avatar: `https://picsum.photos/seed/${name}/100` } as Member);
    }
    
    resetForm();
    setShowModal(false);
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">멤버 프로필</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">우리 클럽의 정회원 명단과 핸디캡을 관리하세요.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/10 active:scale-95"
        >
          <UserPlus size={20} /> 멤버 추가
        </button>
      </div>

      <div className="relative px-2">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="이름이나 닉네임으로 검색..." 
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
        {filteredMembers.map(member => {
          const paid = getPaidTotal(member.id);
          const target = member.annualFeeTarget || 1;
          const progress = Math.min((paid / target) * 100, 100);

          return (
            <div key={member.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               {/* 장식용 배경 요소 */}
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
               
               <div className="flex items-start justify-between relative z-10 mb-6">
                  <div className="relative">
                    <img src={member.avatar} className="w-20 h-20 rounded-[2rem] object-cover shadow-lg ring-4 ring-slate-50" alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-md border-2 border-white">
                       <Trophy size={14} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingMember(member); setName(member.name); setNickname(member.nickname || ''); setHandicap(member.handicap.toString()); setAnnualFee(member.annualFeeTarget.toString()); setShowModal(true); }} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => onDelete(member.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
               </div>

               <div className="relative z-10 mb-8">
                  <h3 className="text-xl font-black text-slate-900 leading-none">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest">Handicap {member.handicap}</span>
                    {member.nickname && <span className="text-xs text-slate-400 font-bold italic">@{member.nickname}</span>}
                  </div>
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-100 relative z-10">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual Fee Progress</span>
                     <span className="text-xs font-black text-slate-900">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                     <div 
                       className={`h-full transition-all duration-1000 ${progress >= 100 ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                       style={{ width: `${progress}%` }} 
                     />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                     <span className="text-slate-400">납부 {paid.toLocaleString()}원</span>
                     <span className="text-slate-800">목표 {target.toLocaleString()}원</span>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{editingMember ? '멤버 정보 수정' : '새 멤버 등록'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">이름</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold shadow-inner" placeholder="홍길동" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">닉네임</label>
                  <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold shadow-inner" placeholder="독수리" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">핸디캡</label>
                  <input required type="number" value={handicap} onChange={e => setHandicap(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-black text-xl text-emerald-600 shadow-inner" min="0" max="72" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">연회비 목표(원)</label>
                  <input required type="text" value={annualFee} onChange={e => setAnnualFee(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-sm font-black shadow-inner" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10 mt-2">
                {editingMember ? '수정 완료' : '멤버 등록 완료'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
