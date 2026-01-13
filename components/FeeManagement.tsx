
import React, { useState } from 'react';
import { FeeRecord, Member } from '../types.ts';
import { Wallet, Search, Filter, CheckCircle2, XCircle, Plus, Calendar, X, Target, Info, Edit3 } from 'lucide-react';

interface Props {
  fees: FeeRecord[];
  members: Member[];
  onToggleStatus: (feeId: string) => void;
  onAdd: (fee: FeeRecord) => void;
  onUpdate: (fee: FeeRecord) => void;
}

const FeeManagement: React.FC<Props> = ({ fees, members, onToggleStatus, onAdd, onUpdate }) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  
  // New fee states
  const [memberId, setMemberId] = useState('');
  const [purpose, setPurpose] = useState('정기회비');
  const [amount, setAmount] = useState('50000');

  const filteredFees = fees.filter(fee => {
    const member = members.find(m => m.id === fee.memberId);
    const matchesSearch = member?.name.includes(searchTerm) || member?.nickname?.includes(searchTerm) || fee.purpose.includes(searchTerm);
    const matchesFilter = filter === 'all' || fee.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    onAdd({
      id: Date.now().toString(),
      memberId,
      purpose,
      amount: parseInt(amount),
      date: new Date().toISOString().split('T')[0],
      status: 'unpaid'
    });

    setMemberId('');
    setShowModal(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFee) {
      onUpdate(editingFee);
      setEditingFee(null);
    }
  };

  const totalCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalUnpaid = fees.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);

  // 멤버별 납부 합계 계산
  const getMemberPaidTotal = (mid: string) => {
    return fees
      .filter(f => f.memberId === mid && f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">회비 및 납부 현황</h2>
          <p className="text-slate-500">회원별 닉네임과 연회비 목표 대비 납부 현황을 관리합니다.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus size={18} />
          내역 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">총 수납액</p>
          <p className="text-3xl font-black text-emerald-600 relative z-10">{totalCollected.toLocaleString()}원</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-50 rounded-full group-hover:scale-110 transition-transform" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">미납액 (청구기준)</p>
          <p className="text-3xl font-black text-rose-500 relative z-10">{totalUnpaid.toLocaleString()}원</p>
        </div>
        <div className="bg-emerald-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
          <Wallet className="absolute -right-2 -bottom-2 w-24 h-24 text-emerald-800 opacity-40 group-hover:rotate-12 transition-transform" />
          <div className="relative z-10">
            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-2">클럽 가용 자산</p>
            <p className="text-3xl font-black">{(totalCollected - 150000).toLocaleString()}원</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400">
               <Info size={10} />
               <span className="text-[10px] font-bold italic">최근 공통 지출액 제외</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-inner">
            <FilterButton active={filter === 'all'} label="전체" onClick={() => setFilter('all')} />
            <FilterButton active={filter === 'paid'} label="완납/납부" onClick={() => setFilter('paid')} />
            <FilterButton active={filter === 'unpaid'} label="미납" onClick={() => setFilter('unpaid')} />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="이름 또는 닉네임 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">회원명 (닉네임)</th>
                <th className="px-6 py-4">년회비 납부 현황</th>
                <th className="px-6 py-4">상세 항목</th>
                <th className="px-6 py-4">금액</th>
                <th className="px-6 py-4">상태</th>
                <th className="px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.map(fee => {
                const member = members.find(m => m.id === fee.memberId);
                const paidTotal = getMemberPaidTotal(fee.memberId);
                const target = member?.annualFeeTarget || 0;
                const progress = target > 0 ? Math.min((paidTotal / target) * 100, 100) : 0;
                const isGoalMet = paidTotal >= target && target > 0;

                return (
                  <tr key={fee.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={member?.avatar} alt="" className="w-8 h-8 rounded-xl shadow-sm" />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 leading-none">{member?.name}</span>
                          {member?.nickname && <span className="text-[10px] text-emerald-600 font-bold mt-1">@{member.nickname}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[180px]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className={isGoalMet ? 'text-emerald-600' : 'text-slate-500'}>
                            {paidTotal.toLocaleString()} / {target.toLocaleString()}원
                          </span>
                          <span className={isGoalMet ? 'text-emerald-600' : 'text-slate-400'}>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                          <div 
                            className={`h-full transition-all duration-1000 ${isGoalMet ? 'bg-emerald-500' : 'bg-emerald-300'}`} 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 font-medium">{fee.purpose}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{fee.date}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800">{fee.amount.toLocaleString()}원</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        fee.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {fee.status === 'paid' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {fee.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingFee(fee)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="금액 수정"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => onToggleStatus(fee.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shadow-sm ${
                            fee.status === 'paid' 
                            ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-600' 
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                          }`}
                        >
                          {fee.status === 'paid' ? '취소' : '확인'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-300 text-sm italic">내역이 없습니다.</td>
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
              <h3 className="text-xl font-bold text-slate-800">회비 청구 등록</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">대상 멤버</label>
                <select 
                  required
                  value={memberId}
                  onChange={e => setMemberId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
                >
                  <option value="">멤버 선택</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} {m.nickname && `(${m.nickname})`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">항목명</label>
                <input 
                  required
                  type="text" 
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="예: 정기회비, 라운딩 참가비"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">금액 (원)</label>
                <input 
                  required
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" 
                  step="1000"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-4 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-900/10 mt-2"
              >
                청구서 발송
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 회비 내역 수정 모달 */}
      {editingFee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">청구 내역 수정</h3>
              <button onClick={() => setEditingFee(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">대상 멤버</label>
                <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500">
                  {members.find(m => m.id === editingFee.memberId)?.name} {members.find(m => m.id === editingFee.memberId)?.nickname && `(${members.find(m => m.id === editingFee.memberId)?.nickname})`}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">항목명</label>
                <input 
                  required
                  type="text" 
                  value={editingFee.purpose}
                  onChange={e => setEditingFee({...editingFee, purpose: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">금액 (원)</label>
                <input 
                  required
                  type="number" 
                  value={editingFee.amount}
                  onChange={e => setEditingFee({...editingFee, amount: parseInt(e.target.value)})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-600" 
                  step="1000"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setEditingFee(null)}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg"
                >
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterButton = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
      active ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {label}
  </button>
);

export default FeeManagement;
