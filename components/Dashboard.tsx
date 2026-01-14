
import React from 'react';
import { Outing, RoundScore, Member, FeeRecord } from '../types.ts';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Trophy, Calendar, Users, TrendingUp, ChevronRight, Clock, Wallet, ImageIcon, Bell, Utensils, Coffee, MapPin, ExternalLink, Target, Flag, UserPlus } from 'lucide-react';

interface Props {
  outings: Outing[];
  scores: RoundScore[];
  members: Member[];
  fees: FeeRecord[];
  initialCarryover: number;
  onNavigateOutings?: () => void;
}

const Dashboard: React.FC<Props> = ({ outings, scores, members, fees, initialCarryover, onNavigateOutings }) => {
  const upcomingOutings = outings
    .filter(o => o.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  const totalPaidFees = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalBalance = initialCarryover + totalPaidFees;
  const recentPhotos = scores.filter(s => s.imageUrl).slice(-3).reverse();
  const avgScore = scores.length > 0 ? (scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length).toFixed(1) : "0.0";
  
  const trendData = scores.slice(-5).map((s, i) => ({ 
    name: `${i + 1}회차`, 
    score: s.totalScore 
  }));

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const [hour, minute] = timeStr.split(':');
      const h = parseInt(hour);
      const ampm = h < 12 ? '오전' : '오후';
      const displayHour = h % 12 || 12;
      return `${ampm} ${displayHour}:${minute}`;
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            동물원 게시판 <Bell size={20} className="text-amber-500 fill-amber-500" />
          </h2>
          <p className="text-slate-500 text-sm font-medium">라운딩 일정과 클럽 지표를 한눈에 확인하세요.</p>
        </div>
        <div className="hidden md:block">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Live Sync: ON</span>
        </div>
      </header>

      {/* [최상단 공지] 가로 꽉 찬 레이아웃 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
             <Calendar size={16} /> 다음 라운딩 주요 공지
           </h3>
           <button 
             onClick={onNavigateOutings}
             className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
           >
             전체 일정 <ChevronRight size={14} />
           </button>
        </div>
        
        <div className="flex flex-col gap-4">
           {upcomingOutings.length > 0 ? upcomingOutings.slice(0, 1).map((outing) => (
             <div key={outing.id} className="bg-white rounded-[2.5rem] p-8 border-2 border-emerald-100 shadow-md hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                   <Trophy size={120} className="text-emerald-900" />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                   {/* 날짜 박스 */}
                   <div className="bg-emerald-900 text-white w-24 h-24 rounded-3xl flex flex-col items-center justify-center shrink-0 shadow-2xl shadow-emerald-950/40">
                      <span className="text-xs font-black uppercase opacity-60 mb-1">{new Date(outing.date).getMonth() + 1}월</span>
                      <span className="text-4xl font-black">{new Date(outing.date).getDate()}</span>
                   </div>

                   {/* 정보 영역 */}
                   <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                         <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-sm">MUST CHECK</span>
                         <h4 className="font-black text-slate-800 text-2xl truncate">{outing.title}</h4>
                      </div>
                      <p className="text-emerald-600 text-base font-black flex items-center gap-2 mb-6">
                         <MapPin size={18} /> {outing.courseName}
                         <span className="text-slate-300 font-normal ml-2">|</span>
                         <span className="text-slate-500 font-bold ml-2 text-sm">참여 멤버 {(outing.participants || []).length}명</span>
                      </p>
                      
                      {/* 조 편성 현황 - 티업 시간 표시 추가 */}
                      {(outing.groups || []).length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                            <Users size={12} /> 조 편성 및 티업 시간
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {outing.groups.map((group, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                                <div className="flex items-center justify-between mb-2 border-b border-emerald-100 pb-1">
                                  <div className="text-[10px] font-black text-emerald-700">{group.name}</div>
                                  {group.teeOffTime && (
                                    <div className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <Clock size={8} /> {formatTime(group.teeOffTime)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {(group.memberIds || []).map(mid => {
                                    const member = members.find(m => m.id === mid);
                                    return (
                                      <div key={mid} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                        <img src={member?.avatar} className="w-4 h-4 rounded-full" alt="" />
                                        <span className="text-[11px] font-bold text-slate-700">{member?.name}</span>
                                      </div>
                                    );
                                  })}
                                  {(group.guests || []).map((guest, gIdx) => (
                                    <div key={`g-${gIdx}`} className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shadow-sm">
                                      <UserPlus size={10} className="text-amber-600" />
                                      <span className="text-[11px] font-bold text-amber-800">{guest}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 식사 계획 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {type: 'lunch', label: '점심 식사', loc: outing.lunchLocation, time: outing.lunchTime, addr: outing.lunchAddress, link: outing.lunchLink, icon: <Coffee size={14} />, color: 'amber'},
                          {type: 'dinner', label: '저녁 식사', loc: outing.dinnerLocation, time: outing.dinnerTime, addr: outing.dinnerAddress, link: outing.dinnerLink, icon: <Utensils size={14} />, color: 'emerald'}
                        ].map((meal) => (
                          <div key={meal.type} className={`flex flex-col p-4 rounded-3xl border ${meal.loc ? `bg-${meal.color}-50 border-${meal.color}-100` : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className={`flex items-center gap-2 text-xs font-black text-${meal.color}-600 uppercase`}>
                                {meal.icon} {meal.label}
                              </div>
                              {meal.time && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                  <Clock size={10} /> {formatTime(meal.time)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-black text-slate-800 truncate">{meal.loc || "추후 공지 예정"}</div>
                              {meal.link && (
                                <a href={meal.link} target="_blank" rel="noreferrer" className="shrink-0 p-1.5 bg-white rounded-xl border border-slate-200 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                            {meal.addr && <div className="text-[11px] text-slate-400 font-bold mt-2 truncate flex items-center gap-1"><MapPin size={10} /> {meal.addr}</div>}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="flex -space-x-3">
                        {(outing.participants || []).slice(0, 6).map(id => (
                           <img key={id} src={members.find(m => m.id === id)?.avatar} className="w-9 h-9 rounded-full border-4 border-white shadow-md" alt="" />
                        ))}
                        {(outing.participants || []).length > 6 && (
                           <div className="w-9 h-9 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-500 shadow-md">
                              +{(outing.participants || []).length - 6}
                           </div>
                        )}
                     </div>
                     <span className="text-xs font-black text-slate-400 uppercase ml-2">참여 멤버 현황</span>
                   </div>
                   <button 
                     onClick={onNavigateOutings}
                     className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-900/20 hover:scale-105 transition-transform"
                   >
                     상세 일정 및 관리
                   </button>
                </div>
             </div>
           )) : (
             <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
                <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold italic">현재 예정된 라운딩 공지가 없습니다.</p>
             </div>
           )}
        </div>
      </section>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp className="text-emerald-600" />} label="클럽 평균 타수" value={avgScore} trend="전체" color="emerald" />
        <StatCard icon={<Wallet className="text-blue-600" />} label="운영 가용 자산" value={`${(totalBalance / 10000).toFixed(0)}만`} trend="이월금 합산" color="blue" />
        <StatCard icon={<Users className="text-purple-600" />} label="등록된 멤버" value={members.length.toString()} trend="동물원 정회원" color="purple" />
        <StatCard icon={<Calendar className="text-amber-500" />} label="남은 일정" value={upcomingOutings.length.toString()} trend="다가오는 달" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-800 mb-8 text-sm uppercase tracking-widest flex items-center gap-2">
               <TrendingUp size={16} className="text-emerald-500" /> 클럽 스코어 트렌드
            </h3>
            <div className="h-64 w-full">
              {scores.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} domain={['auto', 'auto']} reversed />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                   <Target size={32} className="opacity-20" />
                   <p className="text-xs font-black italic uppercase">Insufficent Data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-800 mb-8 text-sm uppercase tracking-widest flex items-center gap-2">
             <ImageIcon size={16} className="text-emerald-600" /> 멤버 갤러리
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {recentPhotos.length > 0 ? recentPhotos.map(s => {
              const member = members.find(m => m.id === s.memberId);
              return (
                <div key={s.id} className="relative aspect-[16/9] rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
                  <img src={s.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-5">
                    <div className="flex items-center gap-3">
                       <img src={member?.avatar} className="w-8 h-8 rounded-full border-2 border-white/20" alt="" />
                       <div>
                          <div className="text-xs font-black text-white">{member?.name}</div>
                          <div className="text-[10px] text-emerald-400 font-bold tracking-widest">{s.totalScore}타 기록</div>
                       </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">No Recent Photos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, trend: string, color: string }> = ({ icon, label, value, trend, color }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-emerald-200 transition-all group">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-50 shrink-0 shadow-sm`}>{icon}</div>
      <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest truncate">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black text-slate-800 tabular-nums">{value}</span>
      <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter shrink-0">{trend}</span>
    </div>
  </div>
);

export default Dashboard;
