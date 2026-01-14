
import React, { useState } from 'react';
import { FeeRecord, Member } from '../types.ts';
import { Wallet, Search, Filter, CheckCircle2, XCircle, Plus, X, Info, Edit3, Trash2, Settings2, ReceiptText } from 'lucide-react';

interface Props {
  fees: FeeRecord[];
  members: Member[];
  onToggleStatus: (feeId: string) => void;
  onAdd: (fee: FeeRecord) => void;
  onUpdate: (fee: FeeRecord) => void;
  onDelete: (id: string) => void;
  initialCarryover: number;
  onUpdateCarryover: (amount: number) => void;
}

const FeeManagement: React.FC<Props> = ({ fees, members, onToggleStatus, onAdd, onUpdate, onDelete, initialCarryover, onUpdateCarryover }) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCarryoverModal, setShowCarryoverModal] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  
  const [memberId, setMemberId] = useState('');
  const [purpose, setPurpose] = useState('정기회비');
  const [amount, setAmount] = useState('50000');
  const [memo, setMemo] = useState('');
  const [tempCarryover, setTempCarryover] = useState(initialCarryover.toString());

  const formatNumber = (num: string | number) => {
    const value = num.toString().replace(/\D/g, '');
    return value ? Number(value).toLocaleString() : '';
  };

  const parseNumber = (str: string) => {
    return str.replace(/,/g, '');
  };

  const filteredFees = fees.filter(fee => {
    const member = members.find(m => m.id === fee.memberId);
    return (member?.name.includes(searchTerm) || fee.purpose.includes(searchTerm)) && 
           (filter === 'all' || fee.status === filter);
  });

  const totalPaidFees = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalBalance = initialCarryover + totalPaidFees;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;
    onAdd({
      id: Date.now().toString(),
      memberId,
      purpose,
      amount: parseInt(parseNumber(amount)),
      date: new Date().toISOString().split('T')[0],
      status: 'unpaid',
      memo: memo.trim() || undefined
    });
    setMemberId('');
    setAmount('50000');
    setShowModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">회비 및 자산</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">클럽의 모든 수입과 기초 자산을 투명하게 관리하세요.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCarryoverModal(true)} className="bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Settings2 size={18} /> 이월금 설정
          </button>
          <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10">
            <Plus size={18} /> 내역 추가
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
        <BalanceCard label="기초 이월금" value={initialCarryover} color="slate" />
        <BalanceCard label="이번 달 수납액" value={totalPaidFees} color="emerald" />
        <div className="bg-emerald-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <Wallet className="absolute -right-2 -bottom-2 w-24 h-24 text-emerald-800 opacity-20" />
          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">총 가용 자산</p>
          <p className="text-3xl font-black relative z-10">{totalBalance.toLocaleString()}원</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <FilterBtn active={filter === 'all'} label="전체" onClick={() => setFilter('all')} />
            <FilterBtn active={filter === 'paid'} label="완납" onClick={() => setFilter('paid')} />
            <FilterBtn active={filter === 'unpaid'} label="미납" onClick={() => setFilter('unpaid')} />
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="멤버 이름 또는 항목 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none w-full md:w-80 shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">멤버 정보</th>
                <th className="px-8 py-5">납부 항목</th>
                <th className="px-8 py-5">금액</th>
                <th className="px-8 py-5">상태</th>
                <th className="px-8 py-5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.map(fee => {
                const member = members.find(m => m.id === fee.memberId);
                return (
                  <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={member?.avatar} className="w-10 h-10 rounded-xl shadow-sm border border-slate-100" />
                        <div>
                          <div className="font-black text-slate-800 leading-none">{member?.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold mt-1">@{member?.nickname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 text-sm font-black text-slate-700">
                        <ReceiptText size={14} className="text-emerald-500" /> {fee.purpose}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1">{fee.date}</div>
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-slate-900">{fee.amount.toLocaleString()}원</td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                        fee.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {fee.status === 'paid' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {fee.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onToggleStatus(fee.id)} className={`px-4 py-2 rounded-xl text-[11px] font-black border transition-all ${
                          fee.status === 'paid' ? 'bg-white text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white'
                        }`}>
                          {fee.status === 'paid' ? '취소' : '수납 확인'}
                        </button>
                        <button onClick={() => onDelete(fee.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showCarryoverModal && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
             <div className="p-10 space-y-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">기초 이월금 설정</h3>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">현재 통장 잔고 (원)</label>
                   <input 
                     autoFocus
                     type="text" 
                     value={formatNumber(tempCarryover)}
                     onChange={e => setTempCarryover(parseNumber(e.target.value))}
                     className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none font-black text-3xl text-emerald-600" 
                   />
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setShowCarryoverModal(false)} className="flex-1 py-5 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl">취소</button>
                   <button onClick={() => { onUpdateCarryover(parseInt(parseNumber(tempCarryover)) || 0); setShowCarryoverModal(false); }} className="flex-1 py-5 text-sm font-black text-white bg-slate-900 rounded-2xl">저장</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-md flex items-center justify-center z-[200] p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-10 space-y-6">
              <h3 className="text-2xl font-black text-slate-800">회비 내역 추가</h3>
              <div className="space-y-4">
                <select value={memberId} onChange={e => setMemberId(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none">
                  <option value="">멤버 선택</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input type="text" placeholder="금액" value={formatNumber(amount)} onChange={e => setAmount(parseNumber(e.target.value))} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-emerald-600 outline-none" />
                <input type="text" placeholder="항목 (예: 7월 회비, 찬조 등)" value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-5 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl">취소</button>
                <button onClick={handleSubmit} className="flex-1 py-5 text-sm font-black text-white bg-emerald-600 rounded-2xl">등록</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BalanceCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${color}-50 rounded-full group-hover:scale-125 transition-transform duration-700 opacity-50`} />
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">{label}</p>
    <p className={`text-2xl font-black text-${color}-600 relative z-10`}>{value.toLocaleString()}원</p>
  </div>
);

const FilterBtn = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button onClick={onClick} className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${active ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
    {label}
  </button>
);

// Removed redundant local CheckCircle2 and manual SVG definitions to resolve conflicts with lucide-react imports

export default FeeManagement;
