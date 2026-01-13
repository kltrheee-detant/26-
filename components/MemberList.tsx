
import React, { useState } from 'react';
import { Member } from '../types.ts';
import { UserPlus, Search, Trash2, X, Wallet, Tag } from 'lucide-react';

interface Props {
  members: Member[];
  onAdd: (member: Member) => void;
  onDelete: (id: string) => void;
}

const MemberList: React.FC<Props> = ({ members, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [handicap, setHandicap] = useState('18');
  const [annualFee, setAnnualFee] = useState('500000');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd({
      id: Date.now().toString(),
      name,
      nickname: nickname.trim() || undefined,
      handicap: parseInt(handicap),
      annualFeeTarget: parseInt(annualFee),
      avatar: `https://picsum.photos/seed/${name}/100`
    });
    
    setName('');
    setNickname('');
    setHandicap('18');
    setAnnualFee('500000');
    setShowModal(false);
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">클럽 멤버</h2>
          <p className="text-slate-500">회원들의 닉네임과 개별 연회비 기준을 관리하세요.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          멤버 추가하기
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="멤버 이름 또는 닉네임 검색..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            검색 결과: <span className="font-bold text-emerald-600">{filteredMembers.length}</span> / {members.length}명
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">성명 (닉네임)</th>
                <th className="px-6 py-4">핸디캡</th>
                <th className="px-6 py-4">책정 연회비</th>
                <th className="px-6 py-4 text-right">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{member.name}</span>
                          {member.nickname && (
                            <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-medium">
                              {member.nickname}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Club Member</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {member.handicap}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Wallet size={14} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{(member.annualFeeTarget || 0).toLocaleString()}원</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDelete(member.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="멤버 삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">새 멤버 추가</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">이름</label>
                  <input 
                    required
                    autoFocus
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold" 
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">닉네임</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      type="text" 
                      value={nickname}
                      onChange={e => setNickname(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm" 
                      placeholder="쾌걸조로"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">핸디캡</label>
                  <input 
                    required
                    type="number" 
                    value={handicap}
                    onChange={e => setHandicap(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    min="0" max="72"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">년회비 목표 (원)</label>
                  <input 
                    required
                    type="number" 
                    value={annualFee}
                    onChange={e => setAnnualFee(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-600" 
                    step="10000"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-900/10 mt-2"
              >
                멤버 등록 완료
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
