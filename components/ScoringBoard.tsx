
import React, { useState, useRef } from 'react';
import { RoundScore, Member, Outing } from '../types.ts';
import { Trophy, TrendingDown, Target, Plus, X, Camera, Image as ImageIcon, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface Props {
  scores: RoundScore[];
  members: Member[];
  outings: Outing[];
  onAdd: (score: RoundScore) => void;
}

const ScoringBoard: React.FC<Props> = ({ scores, members, outings, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'gallery'>('leaderboard');
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // New Score State
  const [memberId, setMemberId] = useState('');
  const [outingId, setOutingId] = useState('');
  const [scoreVal, setScoreVal] = useState('80');
  const [scoreImage, setScoreImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !outingId) return;

    onAdd({
      id: Date.now().toString(),
      memberId,
      outingId,
      totalScore: parseInt(scoreVal),
      date: new Date().toISOString().split('T')[0],
      imageUrl: scoreImage || undefined
    });

    // Reset
    setMemberId('');
    setOutingId('');
    setScoreImage(null);
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
          <div className="flex bg-slate-100 p-1 rounded-xl">
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
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={18} />
            스코어 입력
          </button>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
        <div className="space-y-6">
          {/* 월 선택 필터 */}
          <div className="flex items-center justify-center gap-6 py-2">
            <button 
              onClick={() => setSelectedMonth(prev => prev === 1 ? 12 : prev - 1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              <ChevronLeft />
            </button>
            <div className="flex items-center gap-2 font-black text-xl text-slate-800">
              <Calendar className="text-emerald-600" size={20} />
              {selectedYear}년 {selectedMonth}월
            </div>
            <button 
              onClick={() => setSelectedMonth(prev => prev === 12 ? 1 : prev + 1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800 text-sm">{selectedMonth}월 명예의 전당</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredScores.length > 0 ? filteredScores.map((score, index) => {
                    const member = members.find(m => m.id === score.memberId);
                    const outing = outings.find(o => o.id === score.outingId);
                    return (
                      <div key={score.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                            index === 0 ? 'bg-amber-100 text-amber-600' : 
                            index === 1 ? 'bg-slate-100 text-slate-500' : 
                            index === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'
                          }`}>
                            {index + 1}
                          </div>
                          <img src={member?.avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800">{member?.name}</h4>
                              {member?.nickname && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">
                                  {member.nickname}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{outing?.courseName} • {score.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          {score.imageUrl && (
                            <button 
                              onClick={() => setPreviewImage(score.imageUrl || null)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="스코어카드 보기"
                            >
                              <ImageIcon size={18} />
                            </button>
                          )}
                          <div className="text-right">
                            <div className="text-2xl font-black text-emerald-600">{score.totalScore}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">타수 (Gross)</div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                      <Target size={40} className="opacity-20" />
                      <p className="text-sm">해당 월의 기록이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-800 opacity-30" />
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                  <Trophy size={20} className="text-amber-400" /> 이달의 챔피언
                </h3>
                {filteredScores[0] ? (
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-400 overflow-hidden">
                      <img src={members.find(m => m.id === filteredScores[0].memberId)?.avatar} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <div className="font-black text-xl flex items-center gap-2">
                        {members.find(m => m.id === filteredScores[0].memberId)?.name}
                        <span className="text-xs text-emerald-300 font-bold">({members.find(m => m.id === filteredScores[0].memberId)?.nickname})</span>
                      </div>
                      <p className="text-emerald-300 text-sm">{filteredScores[0].totalScore}타 기록!</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-emerald-300 text-sm relative z-10 italic">첫 기록을 남겨보세요!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryScores.length > 0 ? galleryScores.map(score => {
            const member = members.find(m => m.id === score.memberId);
            return (
              <div 
                key={score.id} 
                className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                onClick={() => setPreviewImage(score.imageUrl || null)}
              >
                <div className="aspect-[3/4] overflow-hidden bg-slate-100">
                  <img src={score.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1 truncate">
                    <img src={member?.avatar} className="w-5 h-5 rounded-full" alt="" />
                    <span className="text-xs font-bold text-slate-800">{member?.name} {member?.nickname && `(${member.nickname})`}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] text-slate-500">{score.date}</p>
                    <span className="text-sm font-black text-emerald-600">{score.totalScore}타</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center gap-2">
              <ImageIcon size={48} className="opacity-10" />
              <p>기록된 사진이 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 스코어 입력 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">새 스코어 기록</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">플레이어</label>
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">라운딩 일정</label>
                <select 
                  required
                  value={outingId}
                  onChange={e => setOutingId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="">일정 선택</option>
                  {outings.map(o => <option key={o.id} value={o.id}>{o.title} ({o.courseName})</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">총 타수</label>
                  <input 
                    required
                    type="number" 
                    value={scoreVal}
                    onChange={e => setScoreVal(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" 
                    min="50" max="150"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">스코어카드 사진</label>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${
                      scoreImage ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {scoreImage ? <ImageIcon size={20}/> : <Camera size={20} />}
                    <span className="text-xs font-bold">{scoreImage ? '등록완료' : '사진 첨부'}</span>
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {scoreImage && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                  <img src={scoreImage} className="w-full h-full object-cover" alt="" />
                  <button 
                    type="button"
                    onClick={() => setScoreImage(null)}
                    className="absolute top-0 right-0 bg-black/50 text-white p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-4 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-900/10 mt-2"
              >
                기록 완료
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 이미지 미리보기 모달 */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={32} />
          </button>
          <img 
            src={previewImage} 
            className="max-w-full max-h-full rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
            alt="Scorecard" 
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ScoringBoard;
