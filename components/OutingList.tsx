
import React, { useState } from 'react';
import { Outing, Member } from '../types';
import { Calendar, MapPin, Plus, MoreHorizontal, Filter } from 'lucide-react';

interface Props {
  outings: Outing[];
  members: Member[];
  onAdd: (outing: Outing) => void;
}

const OutingList: React.FC<Props> = ({ outings, members, onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [newOuting, setNewOuting] = useState({
    title: '',
    date: '',
    courseName: '',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newOuting,
      id: Date.now().toString(),
      participants: [],
      status: 'upcoming'
    } as Outing);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">라운딩 일정</h2>
          <p className="text-slate-500">다가오는 라운딩을 계획하고 관리하세요.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            필터
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            새 일정 만들기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outings.map((outing) => (
          <div key={outing.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
            <div className="h-32 bg-emerald-900 relative">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/golf/800/400')] bg-cover opacity-50 mix-blend-overlay"></div>
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-lg text-white border border-white/20">
                <MoreHorizontal size={20} />
              </div>
              <div className="absolute bottom-4 left-4">
                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                   outing.status === 'upcoming' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                 }`}>
                   {outing.status === 'upcoming' ? '예정됨' : '종료됨'}
                 </span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{outing.title}</h3>
                <p className="text-emerald-600 text-sm font-semibold">{outing.courseName}</p>
              </div>
              
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(outing.date).toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{outing.location}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {outing.participants.slice(0, 3).map(id => {
                    const m = members.find(mem => mem.id === id);
                    return (
                      <img key={id} src={m?.avatar} alt={m?.name} className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-slate-100" />
                    );
                  })}
                  {outing.participants.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                      +{outing.participants.length - 3}
                    </div>
                  )}
                  {outing.participants.length === 0 && (
                    <span className="text-xs text-slate-400">참여자 없음</span>
                  )}
                </div>
                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">참가 신청</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">새 라운딩 등록</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">일정 제목</label>
                <input 
                  required
                  type="text" 
                  value={newOuting.title}
                  onChange={e => setNewOuting({...newOuting, title: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="예: 주말 정기 모임"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">날짜</label>
                <input 
                  required
                  type="date" 
                  value={newOuting.date}
                  onChange={e => setNewOuting({...newOuting, date: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">골프장 이름</label>
                <input 
                  required
                  type="text" 
                  value={newOuting.courseName}
                  onChange={e => setNewOuting({...newOuting, courseName: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="예: 클럽 나인브릿지"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">지역</label>
                <input 
                  required
                  type="text" 
                  value={newOuting.location}
                  onChange={e => setNewOuting({...newOuting, location: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="예: 경기도 이천"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutingList;
