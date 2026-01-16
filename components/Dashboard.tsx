
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
import { Trophy, Calendar, Users, TrendingUp, ChevronRight, Clock, Wallet, ImageIcon, MapPin, ExternalLink, Target, Sparkles, ReceiptText, Globe, Copy, Check } from 'lucide-react';
import { storageService } from '../services/storageService.ts';

interface Props {
  outings: Outing[];
  scores: RoundScore[];
  members: Member[];
  fees: FeeRecord[];
  initialCarryover: number;
  onNavigateOutings?: () => void;
}

const Dashboard: React.FC<Props> = ({ outings, scores, members, fees, initialCarryover, onNavigateOutings }) => {
  const [copied, setCopied] = React.useState(false);
  const clubId = storageService.loadClubId();
  const isCloud = storageService.loadSyncEnabled();

  const upcomingOutings = outings
    .filter(o => o.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  const totalPaidFees = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalBalance = initialCarryover + totalPaidFees;
  const recentPhotos = scores.filter(s => s.imageUrl).slice(-3).reverse();
  const avgScore = scores.length > 0 ? (scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length).toFixed(1) : "0.0";
  const unpaidCount = fees.filter(f => f.status === 'unpaid').length;
  
  const trendData = scores.slice(-5).map((s, i) => ({ 
    name: `${i + 1}R`, 
    score: s.totalScore 
  }));

  const handleCopyCode = () => {
    if (clubId) {
      navigator.clipboard.writeText(clubId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
             <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Premium Membership</span>
             {isCloud && clubId && (
               <button 
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-sm"
               >
                 <Globe size={10} /> 클럽 코드: {clubId} {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-emerald-300" />}
               </button>
             )}
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            동물원 대시보드 <Sparkles className="text-amber-500 fill-amber-500" size={24} />
          </h2>
        </div>
        
        <div className="flex items-center gap-4 bg-emerald-950 p-4 rounded-3xl shadow-xl border border-emerald-900/50">
           <div className="text-right">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">현재 가용 자산</p>
              <h4 className="text-xl font-black text-white">{totalBalance.toLocaleString()}원</h4>
           </div>
           <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
              <Wallet size={20} />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-1">
        <StatCard icon={<TrendingUp size={20} />} label="클럽 평균 타수" value={avgScore} trend="최근 5경기" color="emerald" />
        <StatCard icon={<ReceiptText size={20} />} label="미납 내역" value={`${unpaidCount}건`} trend="확인 필요" color="rose" />
        <StatCard icon={<Users size={20} />} label="정회원" value={members.length.toString()} trend="Active" color="purple" />
        <StatCard icon={<Calendar size={20} />} label="예정 라운딩" value={upcomingOutings.length.toString()} trend="Upcoming" color="amber" />
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
             <Calendar size={18} /> NEXT ROUNDING NOTICE
           </h3>
           <button onClick={onNavigateOutings} className="text-xs font-black text-slate-400 hover:text-emerald-600 flex items-center gap-1.5">
             전체 일정 보기 <ChevronRight size={16} />
           </button>
        </div>
        
        {upcomingOutings.length > 0 ? (
          <div className="bg-white rounded-[3rem] p-10 lg:p-14 border-2 border-emerald-100 shadow-2xl shadow-emerald-900/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-30"></div>
             
             <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                <div className="flex flex-col items-center justify-center shrink-0">
                   <div className="bg-emerald-900 text-white w-32 h-32 rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl">
                      <span className="text-[10px] font-black uppercase opacity-60 mb-1">{new Date(upcomingOutings[0].date).getMonth() + 1}월</span>
                      <span className="text-5xl font-black">{new Date(upcomingOutings[0].date).getDate()}</span>
                      <span className="text-[10px] font-bold mt-1 opacity-60">{new Date(upcomingOutings[0].date).toLocaleDateString('ko-KR', {weekday: 'short'})}</span>
                   </div>
                </div>

                <div className="flex-1 space-y-8">
                   <div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{upcomingOutings[0].title}</h4>
                      <p className="text-emerald-600 text-xl font-black flex items-center gap-2">
                         <MapPin size={22} /> {upcomingOutings[0].courseName}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <MealCard type="lunch" label="LUNCH" location={upcomingOutings[0].lunchLocation} time={upcomingOutings[0].lunchTime} />
                      <MealCard type="dinner" label="DINNER" location={upcomingOutings[0].dinnerLocation} time={upcomingOutings[0].dinnerTime} />
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
             <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold italic">현재 예정된 공식 라운딩 일정이 없습니다.</p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
           <div className="flex items-center gap-2 mb-10">
             <div className="w-2 h-6 bg-emerald-500 rounded-full" />
             <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Score Performance</h3>
           </div>
           <div className="h-64 w-full">
             {scores.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 900}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 900}} domain={['auto', 'auto']} reversed />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1) padding: 16px', fontWeight: '900'}} />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                   <p className="text-xs font-black uppercase tracking-widest">데이터 부족</p>
                </div>
             )}
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
           <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
             <ImageIcon size={18} className="text-emerald-600" /> Recent Photos
           </h3>
           <div className="space-y-4">
              {recentPhotos.length > 0 ? recentPhotos.map(s => (
                <div key={s.id} className="relative aspect-[16/9] rounded-[1.5rem] overflow-hidden shadow-md">
                   <img src={s.imageUrl} className="w-full h-full object-cover" alt="" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <span className="text-[10px] font-black text-white">{members.find(m => m.id === s.memberId)?.name}</span>
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">No Items</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const MealCard: React.FC<{ type: string, label: string, location?: string, time?: string }> = ({ type, label, location, time }) => (
  <div className={`p-6 rounded-[2rem] border ${location ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
    <div className="flex items-center justify-between mb-2">
       <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${type === 'lunch' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'}`}>
          {label}
       </span>
       {time && <span className="text-[10px] font-black text-slate-400">{time}</span>}
    </div>
    <div className="text-lg font-black text-slate-800">{location || "추후 공지"}</div>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, trend: string, color: string }> = ({ icon, label, value, trend, color }) => (
  <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100">
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>{icon}</div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black text-slate-800 tracking-tighter">{value}</span>
      <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">{trend}</span>
    </div>
  </div>
);

export default Dashboard;
