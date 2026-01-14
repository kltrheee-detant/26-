
import React, { useState } from 'react';
import { Outing, Member } from '../types.ts';
import { Calendar, MapPin, Plus, MoreHorizontal, Filter, X, Check, Users, Edit3, Trash2, Utensils, Coffee, Share2, CopyCheck } from 'lucide-react';

interface Props {
  outings: Outing[];
  members: Member[];
  onAdd: (outing: Outing) => void;
  onUpdate: (outing: Outing) => void;
  onDelete: (id: string) => void;
  onToggleParticipant: (outingId: string, memberId: string) => void;
}

const OutingList: React.FC<Props> = ({ outings, members, onAdd, onUpdate, onDelete, onToggleParticipant }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOuting, setEditingOuting] = useState<Outing | null>(null);
  const [joiningOutingId, setJoiningOutingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newOuting, setNewOuting] = useState({
    title: '',
    date: '',
    courseName: '',
    location: '',
    lunchLocation: '',
    dinnerLocation: ''
  });

  const handleCopyNotice = (outing: Outing) => {
    const participatingMembers = outing.participants
      .map(id => members.find(m => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const text = `[동물원 라운딩 공지]
📌 제목: ${outing.title}
📅 일시: ${new Date(outing.date).toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⛳ 장소: ${outing.courseName} (${outing.location})

🍽 식사 안내
🍱 점심: ${outing.lunchLocation || '미정 (추후공지)'}
🍖 저녁: ${outing.dinnerLocation || '미정 (추후공지)'}

👥 참여 멤버 (${outing.participants.length}명)
${participatingMembers || '참여 신청 진행 중'}

⛳ 많은 참석 바랍니다!`;

    navigator.clipboard.writeText(text);
    setCopiedId(outing.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newOuting,
      id: Date.now().toString(),
      participants: [],
      status: 'upcoming'
    } as Outing);
    setShowAddModal(false);
    setNewOuting({ title: '', date: '', courseName: '', location: '', lunchLocation: '', dinnerLocation: '' });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOuting) {
      onUpdate(editingOuting);
      setEditingOuting(null);
    }
  };

  const currentJoiningOuting = outings.find(o => o.id === joiningOutingId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">라운딩 일정</h2>
          <p className="text-slate-500">다가오는 라운딩을 계획하고 식사 장소 및 참여 멤버를 관리하세요.</p>
        </div>
        <div className="flex gap-3">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} />
            필터
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            새 일정 만들기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outings.map((outing) => (
          <div key={outing.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group relative">
            <div className="h-32 bg-emerald-900 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/golf/800/400')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button 
                  onClick={() => handleCopyNotice(outing)}
                  className={`backdrop-blur-md p-2 rounded-lg text-white border border-white/20 transition-all flex items-center gap-1.5 ${copiedId === outing.id ? 'bg-emerald-500 border-emerald-400' : 'bg-white/10 hover:bg-white/20'}`}
                  title="공지문 복사"
                >
                  {copiedId === outing.id ? <CopyCheck size={16} /> : <Share2 size={16} />}
                  <span className="text-[10px] font-black uppercase">{copiedId === outing.id ? 'Copied' : 'Share'}</span>
                </button>
                <button 
                  onClick={() => setActiveMenuId(activeMenuId === outing.id ? null : outing.id)}
                  className="bg-white/10 backdrop-blur-md p-2 rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <MoreHorizontal size={20} />
                </button>
                {activeMenuId === outing.id && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button 
                      onClick={() => {
                        setEditingOuting(outing);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors"
                    >
                      <Edit3 size={14} /> 수정하기
                    </button>
                    <button 
                      onClick={() => {
                        onDelete(outing.id);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-slate-50"
                    >
                      <Trash2 size={14} /> 삭제하기
                    </button>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 left-4">
                 <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                   outing.status === 'upcoming' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'bg-slate-200 text-slate-700'
                 }`}>
                   {outing.status === 'upcoming' ? '예정됨' : '종료됨'}
                 </span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">{outing.title}</h3>
                <p className="text-emerald-600 text-sm font-black flex items-center gap-1.5">
                  <MapPin size={14} /> {outing.courseName}
                </p>
              </div>
              
              <div className="space-y-2 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{new Date(outing.date).toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                {/* 식사 공지 표시 강화 */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <div className={`flex flex-col p-2 rounded-lg border ${outing.lunchLocation ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase mb-0.5">
                      <Coffee size={10} /> Lunch
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 truncate">
                      {outing.lunchLocation || "미정"}
                    </div>
                  </div>
                  <div className={`flex flex-col p-2 rounded-lg border ${outing.dinnerLocation ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase mb-0.5">
                      <Utensils size={10} /> Dinner
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 truncate">
                      {outing.dinnerLocation || "미정"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {outing.participants.length > 0 ? (
                    outing.participants.slice(0, 4).map(id => {
                      const m = members.find(mem => mem.id === id);
                      return (
                        <div key={id} className="relative group/avatar">
                          <img src={m?.avatar} alt={m?.name} className="w-9 h-9 rounded-full border-2 border-white ring-1 ring-slate-100 shadow-sm" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {m?.name}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                      <Plus size={14} />
                    </div>
                  )}
                  {outing.participants.length > 4 && (
                    <div className="w-9 h-9 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100 shadow-sm">
                      +{outing.participants.length - 4}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setJoiningOutingId(outing.id)}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                >
                  참가 신청
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 새 일정 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">새 라운딩 일정</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">일정 제목</label>
                <input 
                  required
                  type="text" 
                  value={newOuting.title}
                  onChange={e => setNewOuting({...newOuting, title: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" 
                  placeholder="예: 6월 정기 라운딩"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">날짜</label>
                  <input 
                    required
                    type="date" 
                    value={newOuting.date}
                    onChange={e => setNewOuting({...newOuting, date: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">지역/도시</label>
                  <input 
                    required
                    type="text" 
                    value={newOuting.location}
                    onChange={e => setNewOuting({...newOuting, location: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    placeholder="예: 경기도 이천"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">골프장 이름</label>
                <input 
                  required
                  type="text" 
                  value={newOuting.courseName}
                  onChange={e => setNewOuting({...newOuting, courseName: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-700" 
                  placeholder="예: 클럽 나인브릿지"
                />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-50 pb-1">식사 정보 (선택)</h4>
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <Coffee size={12} className="text-amber-500" /> 점심 식사 장소
                  </label>
                  <input 
                    type="text" 
                    value={newOuting.lunchLocation}
                    onChange={e => setNewOuting({...newOuting, lunchLocation: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs" 
                    placeholder="예: 클럽하우스 또는 근처 식당"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <Utensils size={12} className="text-emerald-500" /> 저녁 식사 장소
                  </label>
                  <input 
                    type="text" 
                    value={newOuting.dinnerLocation}
                    onChange={e => setNewOuting({...newOuting, dinnerLocation: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs" 
                    placeholder="예: 라운딩 후 뒤풀이 장소"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-900/10"
                >
                  일정 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 일정 수정 모달 */}
      {editingOuting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">일정 정보 수정</h3>
              <button onClick={() => setEditingOuting(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">일정 제목</label>
                <input 
                  required
                  type="text" 
                  value={editingOuting.title}
                  onChange={e => setEditingOuting({...editingOuting, title: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">날짜</label>
                  <input 
                    required
                    type="date" 
                    value={editingOuting.date}
                    onChange={e => setEditingOuting({...editingOuting, date: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">지역/도시</label>
                  <input 
                    required
                    type="text" 
                    value={editingOuting.location}
                    onChange={e => setEditingOuting({...editingOuting, location: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">골프장 이름</label>
                <input 
                  required
                  type="text" 
                  value={editingOuting.courseName}
                  onChange={e => setEditingOuting({...editingOuting, courseName: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-700" 
                />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-50 pb-1">식사 정보 (선택)</h4>
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <Coffee size={12} className="text-amber-500" /> 점심 식사 장소
                  </label>
                  <input 
                    type="text" 
                    value={editingOuting.lunchLocation || ''}
                    onChange={e => setEditingOuting({...editingOuting, lunchLocation: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs" 
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <Utensils size={12} className="text-emerald-500" /> 저녁 식사 장소
                  </label>
                  <input 
                    type="text" 
                    value={editingOuting.dinnerLocation || ''}
                    onChange={e => setEditingOuting({...editingOuting, dinnerLocation: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs" 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={() => setEditingOuting(null)}
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

      {/* 참가 신청 멤버 선택 모달 */}
      {joiningOutingId && currentJoiningOuting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">참가 멤버 관리</h3>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">{currentJoiningOuting.title}</p>
              </div>
              <button onClick={() => setJoiningOutingId(null)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="px-2 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} /> 전체 클럽 멤버 ({members.length})
              </div>
              {members.map(member => {
                const isParticipating = currentJoiningOuting.participants.includes(member.id);
                return (
                  <button 
                    key={member.id}
                    onClick={() => onToggleParticipant(currentJoiningOuting.id, member.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isParticipating 
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt="" className="w-10 h-10 rounded-xl shadow-sm" />
                      <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm leading-none">{member.name}</div>
                        {member.nickname && <div className="text-[10px] text-slate-400 font-medium mt-1">@{member.nickname}</div>}
                      </div>
                    </div>
                    {isParticipating ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-100 bg-slate-50"></div>
                    )}
                  </button>
                );
              })}
              {members.length === 0 && (
                <div className="py-10 text-center text-slate-400 italic text-sm">
                  등록된 멤버가 없습니다.<br/>먼저 멤버 관리에서 추가해주세요.
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <button 
                onClick={() => setJoiningOutingId(null)}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-lg"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutingList;
