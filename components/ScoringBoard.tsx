
import React, { useState, useRef, useEffect } from 'react';
import { RoundScore, Member, Outing } from '../types.ts';
import { Trophy, TrendingDown, Target, Plus, X, Camera, Image as ImageIcon, Calendar, ChevronLeft, ChevronRight, Eye, Edit3, Trash2 } from 'lucide-react';

interface Props {
  scores: RoundScore[];
  members: Member[];
  outings: Outing[];
  onAdd: (score: RoundScore) => void;
  onUpdate: (score: RoundScore) => void;
  onDelete: (id: string) => void;
}

const ScoringBoard: React.FC<Props> = ({ scores, members, outings, onAdd, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'gallery'>('leaderboard');
  const [showModal, setShowModal] = useState(false);
  const [editingScore, setEditingScore] = useState<RoundScore | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Input State
  const [memberId, setMemberId] = useState('');
  const [outingId, setOutingId] = useState('');
  const [scoreDate, setScoreDate] = useState('');
  const [scoreVal, setScoreVal] = useState('80');
  const [scoreImage, setScoreImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setMemberId('');
    setOutingId('');
    // 현재 리더보드에서 보고 있는 년/월의 1일로 기본값 설정 (오늘 날짜가 해당 월이 아닐 경우를 대비)
    const now = new Date();
    const isCurrentMonthView = now.getFullYear() === selectedYear && (now.getMonth() + 1) === selectedMonth;
    
    if (isCurrentMonthView) {
      setScoreDate(now.toISOString().split('T')[0]);
    } else {
      const monthStr = selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth;
      setScoreDate(`${selectedYear}-${monthStr}-01`);
    }
    
    setScoreVal('80');
    setScoreImage(null);
    setEditingScore(null);
  };

  // 라운딩 일정 선택 시 날짜 자동 업데이트
  useEffect(() => {
    if (outingId && outingId !== 'external') {
      const selectedOuting = outings.find(o => o.id === outingId);
      if (selectedOuting) {
        setScoreDate(selectedOuting.date);
      }
    }
  }, [outingId, outings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScoreImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (score: RoundScore) => {
    setEditingScore(score);
    setMemberId(score.memberId);
    setOutingId(score.outingId);
    setScoreDate(score.date);
    setScoreVal(score.totalScore.toString());
    setScoreImage(score.imageUrl || null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !outingId) return;

    if (editingScore) {
      onUpdate({
        ...editingScore,
        memberId,
        outingId,
        totalScore: parseInt(scoreVal),
        date: scoreDate,
        imageUrl: scoreImage || undefined
      });
    } else {
      onAdd({
        id: Date.now().toString(),
        memberId,
        outingId,
        totalScore: parseInt(scoreVal),
        date: scoreDate,
        imageUrl: scoreImage || undefined
      });
    }

    resetForm();
    setShowModal(false);
  };

  const filteredScores = scores.filter(s => {
    const d = new Date(s.date);
    return d.getFullYear() === selectedYear && (d.getMonth() + 1) === selectedMonth;
  }).sort((a, b) => a.totalScore - b.totalScore);

  const galleryScores = scores.filter(s => s.imageUrl).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">스코어 & 갤러리</h2>
          <p className="text-slate-500">회원들의 닉네임과 함께 기록된 성적을 확인하세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'leaderboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
            >
              리더보드
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'gallery' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
            >
              사진첩
            </button>
          </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={18} />
            스코어 입력
          </button>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-6 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xs mx-auto">
            <button 
              onClick={() => setSelectedMonth(prev => prev === 1 ? 12 : prev - 1)}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-emerald-600"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 font-black text-lg text-slate-800 min-w-[120px] justify-center">
              <Calendar className="text-emerald-600" size={18} />
              {selectedYear}년 {selectedMonth}월
            </div>
            <button 
              onClick={() => setSelectedMonth(prev => prev === 12 ? 1 : prev + 1)}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-emerald-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Trophy size={14} className="text-amber-500" /> {selectedMonth}월 명예의 전당
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredScores.length} Records</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredScores.length > 0 ? filteredScores.map((score, index) => {
                    const member = members.find(m => m.id === score.memberId);
                    const outing = outings.find(o => o.id === score.outingId);
                    return (
                      <div key={score.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-xs ${
                            index === 0 ? 'bg-amber-100 text-amber-600' : 
                            index === 1 ? 'bg-slate-100 text-slate-500' : 
                            index === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-300'
                          }`}>
                            {index + 1}
                          </div>
                          <img src={member?.avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm ring-1 ring-slate-100" alt="" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 leading-none">{member?.name}</h4>
                              {member?.nickname && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-bold">
                                  {member.nickname}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                               <ImageIcon size={10} className="text-slate-300" /> {outing?.courseName || '외부 라운딩'} • {score.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {score.imageUrl && (
                            <button 
                              onClick={() => setPreviewImage(score.imageUrl || null)}
                              className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="스코어카드 보기"
                            >
                              <ImageIcon size={18} />
                            </button>
                          )}
                          <div className="text-right min-w-[60px]">
                            <div className="text-2xl font-black text-emerald-600 leading-none">{score.totalScore}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Gross</div>
                          </div>
                          <div className="flex items-center gap-1 border-l border-slate-100 pl-3 ml-2">
                             <button 
                               onClick={() => openEditModal(score)}
                               className="p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                               title="수정"
                             >
                               <Edit3 size={16} />
                             </button>
                             <button 
                               onClick={() => onDelete(score.id)}
                               className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                               title="삭제"
                             >
                               <Trash2 size={16} />
                             </button>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                        <Target size={32} className="opacity-20 text-slate-800" />
                      </div>
                      <p className="text-sm font-medium">해당 월의 기록이 아직 없네요.</p>
                      <button 
                         onClick={() => { resetForm(); setShowModal(true); }}
                         className="text-emerald-600 text-xs font-bold hover:underline"
                      >
                         첫 기록 남기기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-emerald-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                <Trophy className="absolute -right-6 -bottom-6 w-40 h-40 text-emerald-800 opacity-30 group-hover:rotate-12 transition-transform duration-700" />
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                  <Trophy size={20} className="text-amber-400" /> 이달의 챔피언
                </h3>
                {filteredScores[0] ? (
                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-[2rem] border-4 border-amber-400 overflow-hidden shadow-2xl shadow-black/20">
                          <img src={members.find(m => m.id === filteredScores[0].memberId)?.avatar} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <div className="font-black text-2xl flex items-center gap-2">
                            {members.find(m => m.id === filteredScores[0].memberId)?.name}
                          </div>
                          <div className="text-amber-400 text-xs font-bold tracking-widest mt-1">
                             @{members.find(m => m.id === filteredScores[0].memberId)?.nickname}
                          </div>
                        </div>
                    </div>
                    <div className="bg-emerald-800/50 backdrop-blur-sm p-4 rounded-2xl border border-emerald-700">
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">최종 스코어</div>
                        <div className="text-3xl font-black text-white">{filteredScores[0].totalScore}타 <span className="text-sm font-bold text-emerald-300 ml-1">Gross 기록!</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-emerald-300 text-sm relative z-10 italic">첫 챔피언이 되어보세요!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryScores.length > 0 ? galleryScores.map(score => {
            const member = members.find(m => m.id === score.memberId);
            return (
              <div 
                key={score.id} 
                className="group relative bg-white rounded-[2rem] border border-slate-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[3/4] overflow-hidden bg-slate-100 relative" onClick={() => setPreviewImage(score.imageUrl || null)}>
                  <img src={score.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="text-white" size={32} />
                  </div>
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditModal(score); }}
                      className="p-2.5 bg-white/90 backdrop-blur text-slate-700 rounded-xl shadow-lg hover:bg-emerald-600 hover:text-white transition-all transform hover:scale-110"
                      title="수정"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(score.id); }}
                      className="p-2.5 bg-white/90 backdrop-blur text-rose-600 rounded-xl shadow-lg hover:bg-rose-600 hover:text-white transition-all transform hover:scale-110"
                      title="삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3 truncate">
                    <img src={member?.avatar} className="w-8 h-8 rounded-xl shadow-sm border border-slate-100" alt="" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 leading-none">{member?.name}</span>
                      {member?.nickname && <span className="text-[10px] text-emerald-600 font-bold mt-1">@{member.nickname}</span>}
                    </div>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 tracking-tighter">{score.date}</p>
                    <span className="text-lg font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-xl">{score.totalScore}타</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-32 text-center text-slate-400 flex flex-col items-center gap-4">
              <div className="p-6 bg-slate-50 rounded-[2rem]">
                <ImageIcon size={64} className="opacity-10 text-slate-800" />
              </div>
              <p className="font-medium text-slate-500">사진과 함께 기록된 스코어가 없습니다.</p>
              <button 
                 onClick={() => { resetForm(); setShowModal(true); }}
                 className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/10"
              >
                첫 사진 올리기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 스코어 입력/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{editingScore ? '기록 수정하기' : '라운딩 결과 등록'}</h3>
                <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-widest">{editingScore ? 'Update Record' : 'Add New Record'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">플레이어</label>
                    <select 
                    required
                    value={memberId}
                    onChange={e => setMemberId(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold shadow-inner"
                    >
                    <option value="">멤버 선택</option>
                    {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} {m.nickname && `(${m.nickname})`}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">라운딩 일정</label>
                    <select 
                    required
                    value={outingId}
                    onChange={e => setOutingId(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold shadow-inner"
                    >
                    <option value="">일정 선택</option>
                    <option value="external">외부 라운딩 (개별)</option>
                    {outings.map(o => <option key={o.id} value={o.id}>{o.title} ({o.courseName})</option>)}
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">라운딩 날짜</label>
                  <input 
                    required
                    type="date" 
                    value={scoreDate}
                    onChange={e => setScoreDate(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold shadow-inner" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">최종 타수 (Gross)</label>
                  <input 
                    required
                    type="number" 
                    value={scoreVal}
                    onChange={e => setScoreVal(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-black text-xl text-emerald-600 shadow-inner" 
                    min="50" max="150"
                  />
                </div>
              </div>

              <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">스코어카드 사진</label>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-4 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed transition-all ${
                      scoreImage ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {scoreImage ? <ImageIcon size={20}/> : <Camera size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-tighter">{scoreImage ? 'Image Selected' : 'Add Photo'}</span>
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>

              {scoreImage && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-lg group">
                  <img src={scoreImage} className="w-full h-full object-cover" alt="" />
                  <button 
                    type="button"
                    onClick={() => setScoreImage(null)}
                    className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                 <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 text-sm font-black text-slate-500 hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all"
                 >
                    취소
                 </button>
                 <button 
                    type="submit" 
                    className="flex-[2] py-4 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-xl shadow-emerald-900/10"
                 >
                    {editingScore ? '정보 수정 완료' : '스코어 등록하기'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 이미지 미리보기 모달 */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[200] p-4 sm:p-10"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={40} />
          </button>
          <img 
            src={previewImage} 
            className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500 border border-white/10" 
            alt="Scorecard Full View" 
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ScoringBoard;
