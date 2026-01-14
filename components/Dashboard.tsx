
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
import { Trophy, Calendar, Users, TrendingUp, ChevronRight, Clock, Wallet, ImageIcon, Bell, Utensils, Coffee, MapPin, ExternalLink } from 'lucide-react';

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            동물원 게시판 <Bell size={20} className="text-amber-500 fill-amber-500" />
          </h2>
          <p className="text-slate-500 text-sm">월례 라운딩 일정과 클럽의 주요 지표를 확인하세요.</p>
        </div>
        <div className="hidden md:block">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Last Updated: {new Date().toLocaleDateString()}</span>
        </div>
      </header>

      {/* [최상단 공지] 월례 라운딩 일정 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
             <Calendar size={16} /> 다가오는 월례 라운딩 공지
           </h3>
           <button 
             onClick={onNavigateOutings}
             className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
           >
             전체 일정 보기 <ChevronRight size={14} />
           </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {upcomingOutings.length > 0 ? upcomingOutings.slice(0, 2).map((outing) => (
             <div key={outing.id} className="bg-white rounded-[2rem] p-6 border-2 border-emerald-50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Trophy size={80} className="text-emerald-900" />
                </div>
                <div className="flex items-start gap-5">
                   <div className="bg-emerald-900 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg shadow-emerald-900/20">
                      <span className="text-[10px] font-black uppercase opacity-60">{new Date(outing.date).getMonth() + 1}월</span>
                      <span className="text-2xl font-black">{new Date(outing.date).getDate()}</span>
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full animate-pulse">중요공지</span>
                         <h4 className="font-bold text-slate-800 truncate text-lg">{outing.title}</h4>
                      </div>
                      <p className="text-emerald-600 text-xs font-black flex items-center gap-1 mb-4">
                         <MapPin size={12} /> {outing.courseName}
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          {type: 'lunch', label: 'Lunch Plan', loc: outing.lunchLocation, addr: outing.lunchAddress, link: outing.lunchLink, icon: <Coffee size={10} />, color: 'amber'},
                          {type: 'dinner', label: 'Dinner Plan', loc: outing.dinnerLocation, addr: outing.dinnerAddress, link: outing.dinnerLink, icon: <Utensils size={10} />, color: 'emerald'}
                        ].map((meal) => (
                          <div key={meal.type} className={`flex flex-col p-3 rounded-2xl border ${meal.loc ? `bg-${meal.color}-50 border-${meal.color}-100` : 'bg-slate-50 border-slate-100'}`}>
                            <div className={`flex items-center gap-1 text-[9px] font-black text-${meal.color}-600 uppercase mb-1`}>
                              {meal.icon} {meal.label}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-bold text-slate-800">{meal.loc || "추후 공지"}</div>
                              {meal.link && (
                                <a href={meal.link} target="_blank" className="p-1 bg-white rounded-md border border-slate-200 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                            {meal.addr && <div className="text-[9px] text-slate-400 font-medium mt-1 truncate">{meal.addr}</div>}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      {outing.participants.slice(0, 5).map(id => (
                         <img key={id} src={members.find(m => m.id === id)?.avatar} className="w-7 h-7 rounded-full border-2 border-white shadow-sm" alt="" />
                      ))}
                      {outing.participants.length > 5 && (
                         <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-500">
                            +{outing.participants.length - 5}
                         </div>
                      )}
                   </div>
                   <span className="text-[10px] font-black text-slate-300 uppercase">참여 {outing.participants.length}명</span>
                </div>
             </div>
           )) : (
             <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100 italic text-slate-400">일정이 없습니다.</div>
           )}
        </div>
      </section>

      {/* 통계 개요 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<TrendingUp className="text-emerald-600" />} 
          label="평균 타수" 
          value={avgScore} 
          trend="전체" 
          color="emerald"
        />
        <StatCard 
          icon={<Wallet className="text-blue-600" />} 
          label="클럽 자산" 
          value={`${(totalBalance / 10000).toFixed(0)}만`} 
          trend="이월금 포함" 
          color="blue"
        />
        <StatCard 
          icon={<Users className="text-purple-600" />} 
          label="정회원" 
          value={members.length.toString()} 
          trend="멤버" 
          color="purple"
        />
        <StatCard 
          icon={<Calendar className="text-amber-500" />} 
          label="남은 일정" 
          value={upcomingOutings.length.toString()} 
          trend="이번 달" 
          color="amber"
        />
      </div>

      {/* 하단 - 데이터 시각화 및 최근 사진 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
               <TrendingUp size={16} className="text-emerald-500" /> 스코어 변화 추이
            </h3>
            <div className="h-64 w-full">
              {scores.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#cbd5e1', fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#cbd5e1', fontWeight: 700}} domain={['auto', 'auto']} reversed />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 text-xs italic font-bold">기록된 스코어가 부족합니다.</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
             <ImageIcon size={16} className="text-emerald-600" /> 최근 갤러리
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {recentPhotos.length > 0 ? recentPhotos.map(s => {
              const member = members.find(m => m.id === s.memberId);
              return (
                <div key={s.id} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative group">
                  <img src={s.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="text-[10px] text-white font-bold leading-tight">
                       {member?.name}<br/>{s.totalScore}타 기록
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-2 py-12 text-center text-slate-300 text-[10px] font-bold italic uppercase tracking-tighter">No Photos Yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, trend: string, color: string }> = ({ icon, label, value, trend, color }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-all group">
    <div className="flex items-center gap-2 mb-3">
      <div className={`p-2 rounded-xl bg-${color}-50 shrink-0`}>{icon}</div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest truncate">{label}</span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl md:text-2xl font-black text-slate-800 leading-none truncate">{value}</span>
      <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter shrink-0">{trend}</span>
    </div>
  </div>
);

export default Dashboard;
