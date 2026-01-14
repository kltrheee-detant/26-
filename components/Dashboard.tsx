
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
import { Trophy, Calendar, Users, TrendingUp, ChevronRight, Clock, Wallet, ImageIcon } from 'lucide-react';

interface Props {
  outings: Outing[];
  scores: RoundScore[];
  members: Member[];
  fees: FeeRecord[];
  initialCarryover: number;
}

const Dashboard: React.FC<Props> = ({ outings, scores, members, fees, initialCarryover }) => {
  const upcomingOutings = outings.filter(o => o.status === 'upcoming');
  const unpaidCount = fees.filter(f => f.status === 'unpaid').length;
  const totalPaidFees = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  
  // 가용 자산 = 초기 이월 금액 + 납부된 총 회비
  const totalBalance = initialCarryover + totalPaidFees;
  
  // 최근 사진이 있는 스코어 3개
  const recentPhotos = scores.filter(s => s.imageUrl).slice(-3).reverse();

  // 평균 타수 계산
  const avgScore = scores.length > 0 
    ? (scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length).toFixed(1)
    : "0.0";

  const trendData = scores.slice(-5).map((s, i) => ({
    name: `${i + 1}회차`,
    score: s.totalScore
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">골프 클럽 동물원</h2>
        <p className="text-slate-500">클럽의 현황과 최근 활동을 한눈에 확인하세요.</p>
      </header>

      {/* 통계 개요 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<TrendingUp className="text-emerald-600" />} 
          label="클럽 평균 타수" 
          value={avgScore} 
          trend="전체 기록 기준" 
          color="emerald"
        />
        <StatCard 
          icon={<Wallet className="text-blue-600" />} 
          label="클럽 가용 자산" 
          value={`${totalBalance.toLocaleString()}원`} 
          trend="이월금 포함" 
          color="blue"
        />
        <StatCard 
          icon={<Users className="text-purple-600" />} 
          label="전체 멤버" 
          value={members.length.toString()} 
          trend="정회원" 
          color="purple"
        />
        <StatCard 
          icon={<Calendar className="text-amber-500" />} 
          label="남은 라운딩" 
          value={upcomingOutings.length.toString()} 
          trend="이번 달 예정" 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6">최근 스코어 변화 추이</h3>
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} domain={['auto', 'auto']} reversed />
                    {/* Fix: shadow property is not a valid CSS property in React CSSProperties, changed to boxShadow */}
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">기록된 스코어가 부족합니다.</div>
              )}
            </div>
          </div>

          {/* 최근 사진 섹션 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon size={18} className="text-emerald-600" /> 최근 스코어카드
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {recentPhotos.length > 0 ? recentPhotos.map(s => {
                const member = members.find(m => m.id === s.memberId);
                return (
                  <div key={s.id} className="aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative group">
                    <img src={s.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm text-[10px] text-white">
                      <div className="font-bold truncate">{member?.name} {member?.nickname && `(${member.nickname})`}</div>
                      <div>{s.totalScore}타 기록</div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-3 py-10 text-center text-slate-300 text-xs italic">등록된 사진이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6">다음 일정</h3>
            <div className="space-y-4">
              {upcomingOutings.map(outing => (
                <div key={outing.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex flex-col items-center justify-center min-w-[56px]">
                    <span className="text-xs font-bold uppercase">{outing.date.split('-')[1]}월</span>
                    <span className="text-lg font-black leading-none">{outing.date.split('-')[2]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">{outing.title}</h4>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                      <Clock size={12} />
                      <span className="truncate">{outing.courseName}</span>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-emerald-500" size={18} />
                </div>
              ))}
              {upcomingOutings.length === 0 && <div className="text-center py-8 text-slate-400 text-xs italic">일정이 없습니다.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, trend: string, color: string }> = ({ icon, label, value, trend, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-all group">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2.5 rounded-xl bg-${color}-50`}>{icon}</div>
      <span className="text-slate-500 text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black text-slate-800 leading-none truncate">{value}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{trend}</span>
    </div>
  </div>
);

export default Dashboard;
