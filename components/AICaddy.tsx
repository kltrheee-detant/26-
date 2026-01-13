
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ExternalLink, Map as MapIcon, Info, ChevronRight, Target, Flag, Layout, ListChecks, Hash } from 'lucide-react';
import { getGolfAdvice } from '../services/geminiService.ts';
import { POCHEON_HILLS_DATA } from '../services/pocheonHillsData.ts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

const AICaddy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'strategy'>('strategy');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "안녕하세요! '동물원 AI 캐디'입니다. 포천힐스 CC의 상세 코스 공략 데이터를 불러왔습니다. 궁금한 점은 AI 채팅으로 물어보세요!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedCourse, setSelectedCourse] = useState<keyof typeof POCHEON_HILLS_DATA>('palace');
  const [selectedHole, setSelectedHole] = useState<number>(1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSend = async (textOverride?: string) => {
    const query = textOverride || input;
    if (!query.trim() || isLoading) return;

    if (activeTab === 'strategy') setActiveTab('chat');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponse = await getGolfAdvice(query);
    
    const assistantMsg: Message = { 
      id: (Date.now() + 1).toString(), 
      role: 'assistant', 
      content: aiResponse.text,
      sources: aiResponse.sources
    };
    
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const currentCourse = POCHEON_HILLS_DATA[selectedCourse];
  const currentHole = currentCourse.holes.find(h => h.number === selectedHole)!;

  const suggestions = [
    "포천힐스 팰리스 1번홀 공략법",
    "포천힐스 가든 코스 난이도",
    "포천힐스 벙커 많은 홀 알려줘"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-['Noto_Sans_KR']">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-emerald-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 leading-none">동물원 AI 캐디</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Course Master</span>
              <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <Sparkles size={10} /> 포천힐스 CC 데이터 기반
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-white/50 p-1 rounded-xl border border-emerald-100 shadow-inner">
          <button 
            onClick={() => setActiveTab('strategy')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'strategy' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'}`}
          >
            <ListChecks size={14} /> 코스 가이드
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'}`}
          >
            <Bot size={14} /> AI 채팅
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="space-y-2">
                    <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.sources.map((src: any, i: number) => (
                          <a key={i} href={src.web?.uri || '#'} target="_blank" rel="noreferrer" className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm">
                            <ExternalLink size={10} className="text-emerald-500" />
                            <span className="max-w-[150px] truncate">{src.web?.title || '지도 보기'}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && <div className="animate-pulse flex gap-3 p-4"><Bot size={16} className="text-emerald-200" /> <div className="h-10 w-24 bg-slate-200 rounded-xl"></div></div>}
          </div>
          <div className="p-4 border-t border-slate-100 space-y-4 bg-white shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 bg-white shadow-sm">
                  {s}
                </button>
              ))}
            </div>
            <div className="relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="궁금한 홀 번호나 공략법을 물어보세요..." className="w-full pl-4 pr-12 py-3 bg-slate-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none border-none shadow-inner" />
              <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all">
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-white">
          {/* Sidebar - Course & Hole Selection */}
          <div className="w-full md:w-64 border-r border-slate-100 bg-slate-50/50 p-6 overflow-y-auto">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">코스 선정</h4>
            <div className="space-y-2">
              {(Object.keys(POCHEON_HILLS_DATA) as Array<keyof typeof POCHEON_HILLS_DATA>).map(key => (
                <button key={key} onClick={() => { setSelectedCourse(key); setSelectedHole(1); }} className={`w-full text-left p-3 rounded-xl text-sm font-bold transition-all ${selectedCourse === key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10' : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100'}`}>
                  {POCHEON_HILLS_DATA[key].name}
                </button>
              ))}
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8 mb-4">홀 번호</h4>
            <div className="grid grid-cols-3 gap-2">
              {currentCourse.holes.map(h => (
                <button key={h.number} onClick={() => setSelectedHole(h.number)} className={`p-2 rounded-lg text-xs font-black border transition-all ${selectedHole === h.number ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                  {h.number}
                </button>
              ))}
            </div>
            <div className="mt-10 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
               <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                 <Info size={12} /> 야디지 북 팁
               </div>
               <p className="text-[11px] text-slate-500 leading-normal font-medium">
                 각 홀의 거리는 화이트 티 기준이며, 산악 지형 특성상 경사에 따른 클럽 선택이 중요합니다.
               </p>
            </div>
          </div>

          {/* Main Content - Text Based Strategy */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white">
            <div className="max-w-xl mx-auto space-y-8">
              {/* Hole Identifier Header */}
              <div className="flex items-end justify-between border-b-2 border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-900 text-white text-[10px] font-black rounded uppercase tracking-tighter">Hole Info</span>
                    <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">{currentCourse.name}</span>
                  </div>
                  <h2 className="text-6xl font-black text-slate-900 flex items-baseline gap-4">
                    Hole {currentHole.number}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-emerald-600 tabular-nums">{currentHole.distance}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">White Tee Distance</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-sm mb-2"><Hash size={20} /></div>
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Par</div>
                  <div className="text-2xl font-black text-slate-800">Par {currentHole.par}</div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm mb-2"><Target size={20} /></div>
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-0.5">핸디캡</div>
                  <div className="text-2xl font-black text-slate-800">No. {currentHole.handicap}</div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm mb-2"><Flag size={20} /></div>
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-0.5">그린 타입</div>
                  <div className="text-xl font-black text-slate-800">Bent Grass</div>
                </div>
              </div>

              {/* Strategy Details */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative">
                  <div className="absolute -top-3 left-8 bg-white px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 rounded-full">Course Description</div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Info size={18} className="text-emerald-500" /> 지형 및 특징
                  </h4>
                  <p className="text-lg text-slate-700 leading-relaxed font-medium">
                    {currentHole.description}
                  </p>
                </div>

                <div className="bg-emerald-950 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-800/20 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase mb-4 flex items-center gap-2 tracking-widest relative z-10">
                    <Sparkles size={16} /> Pro's Strategy Guide
                  </h4>
                  <p className="text-2xl text-emerald-50 leading-snug font-black relative z-10">
                    "{currentHole.strategy}"
                  </p>
                  
                  <div className="mt-10 pt-8 border-t border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-900 rounded-lg text-emerald-400">
                         <Target size={20} />
                       </div>
                       <div>
                         <div className="text-[10px] font-bold text-emerald-500 uppercase">권장 티샷 타겟</div>
                         <div className="text-sm font-bold">중앙 약간 좌측 (페어웨이 확보)</div>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleSend(`포천힐스 ${currentCourse.name} ${currentHole.number}번홀 공략 팁 더 자세히!`)} 
                      className="w-full sm:w-auto px-6 py-3 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                      상세 질문하기 <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICaddy;
