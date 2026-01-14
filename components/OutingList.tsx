
import React, { useState } from 'react';
import { Outing, Member } from '../types.ts';
import { Calendar, MapPin, Plus, MoreHorizontal, Filter, X, Check, Users, Edit3, Trash2, Utensils, Coffee, Share2, CopyCheck, Search, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { searchRestaurants } from '../services/geminiService.ts';

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

  // AI 검색 상태
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'lunch' | 'dinner' | null>(null);
  const [searchResults, setSearchResults] = useState<{title: string, uri: string}[]>([]);
  const [searchMessage, setSearchMessage] = useState('');

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

  const handleSearchPlaces = async (target: 'lunch' | 'dinner') => {
    const course = editingOuting ? editingOuting.courseName : newOuting.courseName;
    if (!course) {
      alert("먼저 골프장 이름을 입력해주세요.");
      return;
    }

    setIsSearching(true);
    setSearchType(target);
    setSearchMessage("AI가 주변 맛집을 검색 중입니다...");
    
    const result = await searchRestaurants(course, target === 'lunch' ? '점심' : '저녁');
    
    setSearchResults(result.places);
    setSearchMessage(result.text);
    setIsSearching(false);
  };

  const handleSelectPlace = (place: {title: string, uri: string}) => {
    // 텍스트에서 주소 추출 시도 (간단한 로직 또는 텍스트 그대로 활용)
    const addressMatch = searchMessage.split(place.title)[1]?.split('\n')[0]?.replace(/[:\-]/g, '').trim();
    
    if (editingOuting) {
      setEditingOuting({
        ...editingOuting,
        [`${searchType}Location`]: place.title,
        [`${searchType}Address`]: addressMatch || '',
        [`${searchType}Link`]: place.uri
      });
    } else {
      setNewOuting({
        ...newOuting,
        [`${searchType}Location`]: place.title,
        [`${searchType}Address`]: addressMatch || '',
        [`${searchType}Link`]: place.uri
      });
    }
    setSearchType(null);
    setSearchResults([]);
  };

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
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOuting) {
      onUpdate(editingOuting);
      setEditingOuting(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">라운딩 일정</h2>
          <p className="text-slate-500">맛집 자동 검색 기능으로 식사 공지까지 한 번에 해결하세요.</p>
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
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/golf/800/400')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button onClick={() => handleCopyNotice(outing)} className={`backdrop-blur-md p-2 rounded-lg text-white border border-white/20 transition-all ${copiedId === outing.id ? 'bg-emerald-500' : 'bg-white/10 hover:bg-white/20'}`}>
                  {copiedId === outing.id ? <CopyCheck size={16} /> : <Share2 size={16} />}
                </button>
                <button onClick={() => setActiveMenuId(activeMenuId === outing.id ? null : outing.id)} className="bg-white/10 backdrop-blur-md p-2 rounded-lg text-white border border-white/20 hover:bg-white/20">
                  <MoreHorizontal size={20} />
                </button>
                {activeMenuId === outing.id && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30">
                    <button onClick={() => { setEditingOuting(outing); setActiveMenuId(null); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-emerald-50 flex items-center gap-2"><Edit3 size={14} /> 수정</button>
                    <button onClick={() => { onDelete(outing.id); setActiveMenuId(null); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 border-t flex items-center gap-2"><Trash2 size={14} /> 삭제</button>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4">
                 <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">예정됨</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{outing.title}</h3>
                <p className="text-emerald-600 text-sm font-black flex items-center gap-1.5"><MapPin size={14} /> {outing.courseName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="col-span-2 flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar size={16} /> <span>{outing.date}</span>
                </div>
                <div className={`p-2 rounded-lg border ${outing.lunchLocation ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50'}`}>
                  <div className="text-[9px] font-black text-amber-600 uppercase">Lunch</div>
                  <div className="text-[10px] font-bold text-slate-700 truncate">{outing.lunchLocation || "미정"}</div>
                </div>
                <div className={`p-2 rounded-lg border ${outing.dinnerLocation ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50'}`}>
                  <div className="text-[9px] font-black text-emerald-600 uppercase">Dinner</div>
                  <div className="text-[10px] font-bold text-slate-700 truncate">{outing.dinnerLocation || "미정"}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {outing.participants.slice(0, 4).map(id => (
                    <img key={id} src={members.find(m => m.id === id)?.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                  ))}
                </div>
                <button onClick={() => setJoiningOutingId(outing.id)} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black">참가 관리</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 일정 등록/수정 공통 모달 내부 식사 섹션 개선 */}
      {(showAddModal || editingOuting) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold">{editingOuting ? '일정 수정' : '새 라운딩'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingOuting(null); }}><X /></button>
            </div>
            <form onSubmit={editingOuting ? handleUpdateSubmit : handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">제목</label>
                  <input required className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={editingOuting ? editingOuting.title : newOuting.title} onChange={e => editingOuting ? setEditingOuting({...editingOuting, title: e.target.value}) : setNewOuting({...newOuting, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">날짜</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border rounded-xl" value={editingOuting ? editingOuting.date : newOuting.date} onChange={e => editingOuting ? setEditingOuting({...editingOuting, date: e.target.value}) : setNewOuting({...newOuting, date: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">골프장</label>
                  <input className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-emerald-700" value={editingOuting ? editingOuting.courseName : newOuting.courseName} onChange={e => editingOuting ? setEditingOuting({...editingOuting, courseName: e.target.value}) : setNewOuting({...newOuting, courseName: e.target.value})} />
                </div>
              </div>

              {/* 식사 정보 검색 섹션 */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black text-emerald-600 uppercase border-b pb-1 flex items-center gap-2"><Sparkles size={14}/> AI 맛집 자동 완성</h4>
                
                {['lunch', 'dinner'].map((type) => {
                  const target = type === 'lunch' ? '점심' : '저녁';
                  const loc = editingOuting ? (editingOuting as any)[`${type}Location`] : (newOuting as any)[`${type}Location`];
                  const addr = editingOuting ? (editingOuting as any)[`${type}Address`] : (newOuting as any)[`${type}Address`];
                  
                  return (
                    <div key={type} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase">
                          {type === 'lunch' ? <Coffee size={12} className="text-amber-500" /> : <Utensils size={12} className="text-emerald-500" />} {target} 장소
                        </label>
                        <button 
                          type="button"
                          onClick={() => handleSearchPlaces(type as any)}
                          className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Search size={12} /> AI 검색 및 자동입력
                        </button>
                      </div>
                      <input 
                        placeholder={`${target} 장소 이름`}
                        className="w-full p-2 bg-white border rounded-lg text-sm font-bold shadow-inner"
                        value={loc || ''}
                        onChange={e => editingOuting ? setEditingOuting({...editingOuting, [`${type}Location`]: e.target.value}) : setNewOuting({...newOuting, [`${type}Location`]: e.target.value})}
                      />
                      <input 
                        placeholder="주소 (자동 입력됨)"
                        className="w-full p-2 bg-white/50 border rounded-lg text-[11px] text-slate-500 shadow-inner"
                        value={addr || ''}
                        readOnly
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingOuting(null); }} className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl">취소</button>
                <button type="submit" className="flex-1 py-4 text-sm font-black text-white bg-emerald-600 rounded-2xl shadow-lg">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI 검색 결과 팝업 */}
      {searchType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b bg-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles /> AI 주변 맛집 추천</h3>
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mt-0.5">{searchType === 'lunch' ? 'Lunch' : 'Dinner'} Recommendations</p>
              </div>
              <button onClick={() => setSearchType(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
              {isSearching ? (
                <div className="py-20 flex flex-col items-center justify-center text-emerald-600 gap-4">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="font-bold text-sm">골프장 주변 맛집을 수색 중입니다...</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-800 leading-relaxed font-medium whitespace-pre-wrap italic border border-emerald-100">
                    "{searchMessage}"
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">검색된 장소</p>
                    {searchResults.map((place, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border hover:border-emerald-500 transition-all group">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate">{place.title}</h4>
                          <a href={place.uri} target="_blank" className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 mt-1 font-bold">
                            <ExternalLink size={10} /> 지도에서 위치 보기
                          </a>
                        </div>
                        <button 
                          onClick={() => handleSelectPlace(place)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md group-hover:scale-105 transition-transform"
                        >
                          선택 및 자동입력
                        </button>
                      </div>
                    ))}
                    {searchResults.length === 0 && (
                      <p className="text-center py-10 text-slate-400 text-sm italic">추천 장소를 찾지 못했습니다.</p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t">
              <button onClick={() => setSearchType(null)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-sm">닫기</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 참가 신청 모달 생략 (기존 유지) */}
    </div>
  );
};

export default OutingList;
