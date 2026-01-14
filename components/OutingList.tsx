
import React, { useState } from 'react';
import { Outing, Member } from '../types.ts';
import { Calendar, MapPin, Plus, MoreHorizontal, Filter, X, Check, Users, Edit3, Trash2, Utensils, Coffee, Share2, CopyCheck, ExternalLink, Link as LinkIcon } from 'lucide-react';

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
    lunchAddress: '',
    lunchLink: '',
    dinnerLocation: '',
    dinnerAddress: '',
    dinnerLink: ''
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
🍱 점심: ${outing.lunchLocation || '미정'}
📍 주소: ${outing.lunchAddress || '현장 안내'}
🔗 지도: ${outing.lunchLink || '-'}

🍖 저녁: ${outing.dinnerLocation || '미정'}
📍 주소: ${outing.dinnerAddress || '현장 안내'}
🔗 지도: ${outing.dinnerLink || '-'}

👥 참여 멤버 (${outing.participants.length}명)
${participatingMembers || '참여 신청 진행 중'}

⛳ 즐거운 라운딩 되세요!`;

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
    setNewOuting({ title: '', date: '', courseName: '', location: '', lunchLocation: '', lunchAddress: '', lunchLink: '', dinnerLocation: '', dinnerAddress: '', dinnerLink: '' });
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
          <p className="text-slate-500">라운딩 장소와 식사 정보를 관리하고 공지문을 복사하세요.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> 새 일정 만들기
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outings.map((outing) => (
          <div key={outing.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group relative">
            <div className="h-32 bg-emerald-900 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/golf/800/400')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button 
                  onClick={() => handleCopyNotice(outing)}
                  className={`backdrop-blur-md p-2 rounded-lg text-white border border-white/20 transition-all ${copiedId === outing.id ? 'bg-emerald-500 border-emerald-400' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {copiedId === outing.id ? <CopyCheck size={16} /> : <Share2 size={16} />}
                </button>
                <button 
                  onClick={() => setActiveMenuId(activeMenuId === outing.id ? null : outing.id)}
                  className="bg-white/10 backdrop-blur-md p-2 rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <MoreHorizontal size={20} />
                </button>
                {activeMenuId === outing.id && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30">
                    <button 
                      onClick={() => { setEditingOuting(outing); setActiveMenuId(null); }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                    >
                      <Edit3 size={14} /> 수정하기
                    </button>
                    <button 
                      onClick={() => { onDelete(outing.id); setActiveMenuId(null); }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t"
                    >
                      <Trash2 size={14} /> 삭제하기
                    </button>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4">
                 <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 shadow-sm">예정됨</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">{outing.title}</h3>
                <p className="text-emerald-600 text-sm font-black flex items-center gap-1.5"><MapPin size={14} /> {outing.courseName}</p>
              </div>
              
              <div className="space-y-2 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{new Date(outing.date).toLocaleDateString('ko-KR', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <div className={`flex flex-col p-2 rounded-lg border ${outing.lunchLocation ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase mb-0.5"><Coffee size={10} /> Lunch</div>
                    <div className="text-[10px] font-bold text-slate-700 truncate">{outing.lunchLocation || "미정"}</div>
                  </div>
                  <div className={`flex flex-col p-2 rounded-lg border ${outing.dinnerLocation ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase mb-0.5"><Utensils size={10} /> Dinner</div>
                    <div className="text-[10px] font-bold text-slate-700 truncate">{outing.dinnerLocation || "미정"}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {outing.participants.slice(0, 4).map(id => (
                    <img key={id} src={members.find(m => m.id === id)?.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                  ))}
                  {outing.participants.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-emerald-700 shadow-sm">+{outing.participants.length - 4}</div>
                  )}
                </div>
                <button onClick={() => setJoiningOutingId(outing.id)} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100">참가 관리</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 일정 등록/수정 모달 */}
      {(showAddModal || editingOuting) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">{editingOuting ? '일정 수정하기' : '새 라운딩 일정'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingOuting(null); }} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={editingOuting ? handleUpdateSubmit : handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">일정 제목</label>
                  <input required type="text" value={editingOuting ? editingOuting.title : newOuting.title} onChange={e => editingOuting ? setEditingOuting({...editingOuting, title: e.target.value}) : setNewOuting({...newOuting, title: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold" placeholder="예: 6월 정기 라운딩" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">날짜</label>
                  <input required type="date" value={editingOuting ? editingOuting.date : newOuting.date} onChange={e => editingOuting ? setEditingOuting({...editingOuting, date: e.target.value}) : setNewOuting({...newOuting, date: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">골프장 이름</label>
                  <input required type="text" value={editingOuting ? editingOuting.courseName : newOuting.courseName} onChange={e => editingOuting ? setEditingOuting({...editingOuting, courseName: e.target.value}) : setNewOuting({...newOuting, courseName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-700" placeholder="예: 포천힐스 CC" />
                </div>
              </div>

              {/* 식사 정보 수동 입력 섹션 */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black text-emerald-600 uppercase border-b border-emerald-50 pb-1 flex items-center gap-2">식사 및 공지 정보</h4>
                
                {['lunch', 'dinner'].map((type) => {
                  const target = type === 'lunch' ? '점심' : '저녁';
                  const loc = editingOuting ? (editingOuting as any)[`${type}Location`] : (newOuting as any)[`${type}Location`];
                  const addr = editingOuting ? (editingOuting as any)[`${type}Address`] : (newOuting as any)[`${type}Address`];
                  const link = editingOuting ? (editingOuting as any)[`${type}Link`] : (newOuting as any)[`${type}Link`];
                  
                  return (
                    <div key={type} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {type === 'lunch' ? <Coffee size={12} className="text-amber-500" /> : <Utensils size={12} className="text-emerald-500" />} {target} 장소 정보
                      </label>
                      <input 
                        placeholder={`${target} 식당 이름`}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-inner"
                        value={loc || ''}
                        onChange={e => editingOuting ? setEditingOuting({...editingOuting, [`${type}Location`]: e.target.value}) : setNewOuting({...newOuting, [`${type}Location`]: e.target.value})}
                      />
                      <input 
                        placeholder="상세 주소"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 shadow-inner"
                        value={addr || ''}
                        onChange={e => editingOuting ? setEditingOuting({...editingOuting, [`${type}Address`]: e.target.value}) : setNewOuting({...newOuting, [`${type}Address`]: e.target.value})}
                      />
                      <div className="relative">
                        <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          placeholder="네이버/구글 지도 링크"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] text-emerald-600 font-medium shadow-inner"
                          value={link || ''}
                          onChange={e => editingOuting ? setEditingOuting({...editingOuting, [`${type}Link`]: e.target.value}) : setNewOuting({...newOuting, [`${type}Link`]: e.target.value})}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingOuting(null); }} className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl transition-all">취소</button>
                <button type="submit" className="flex-1 py-4 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg">일정 저장 완료</button>
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
              {members.map(member => {
                const isParticipating = currentJoiningOuting.participants.includes(member.id);
                return (
                  <button 
                    key={member.id}
                    onClick={() => onToggleParticipant(currentJoiningOuting.id, member.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isParticipating ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'
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
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white"><Check size={14} strokeWidth={4} /></div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-100 bg-slate-50"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <button onClick={() => setJoiningOutingId(null)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-lg">관리 완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutingList;
