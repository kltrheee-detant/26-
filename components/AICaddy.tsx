
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ExternalLink, Map as MapIcon, Info, ChevronRight, Target, Flag, ImageIcon, Layout } from 'lucide-react';
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
      content: "안녕하세요! '동물원 AI 캐디'입니다. 포천힐스 CC의 모든 홀을 분석한 코스 공략도를 준비했습니다. 상세 질문은 AI 채팅 탭에서 가능합니다!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedCourse, setSelectedCourse] = useState<keyof typeof POCHEON_HILLS_DATA>('palace');
  const [selectedHole, setSelectedHole] = useState<number>(1);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  useEffect(() => {
    setImgLoaded(false);
  }, [selectedCourse, selectedHole]);

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
      <div className="p-4 border-b border-slate-100 bg-emerald-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 leading-none">동물원 AI 캐디</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">Pro</span>
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <Sparkles size={10} /> 포천힐스 코스 마스터
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-white/50 p-1 rounded-xl border border-emerald-100">
          <button 
            onClick={() => setActiveTab('strategy')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'strategy' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700'}`}
          >
            <MapIcon size={14} /> 코스 공략도
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700'}`}
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
            {isLoading && <div className="animate-pulse flex gap-3"><Bot size={16} className="text-emerald-200" /> <div className="h-10 w-24 bg-slate-200 rounded-xl"></div></div>}
          </div>
          <div className="p-4 border-t border-slate-100 space-y-4 bg-white">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 bg-white">
                  {s}
                </button>
              ))}
            </div>
            <div className="relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="공략법이 궁금한 홀을 물어보세요..." className="w-full pl-4 pr-12 py-3 bg-slate-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none border-none shadow-inner" />
              <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all">
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50/50">
          <div className="w-full md:w-64 border-r border-slate-100 bg-white p-6 overflow-y-auto">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">코스 선정</h4>
            <div className="space-y-2">
              {(Object.keys(POCHEON_HILLS_DATA) as Array<keyof typeof POCHEON_HILLS_DATA>).map(key => (
                <button key={key} onClick={() => { setSelectedCourse(key); setSelectedHole(1); }} className={`w-full text-left p-3 rounded-xl text-sm font-bold transition-all ${selectedCourse === key ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {POCHEON_HILLS_DATA[key].name}
                </button>
              ))}
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8 mb-4">홀 상세 공략</h4>
            <div className="grid grid-cols-3 gap-2">
              {currentCourse.holes.map(h => (
                <button key={h.number} onClick={() => setSelectedHole(h.number)} className={`p-2 rounded-lg text-xs font-black border transition-all ${selectedHole === h.number ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                  {h.number}
                </button>
              ))}
            </div>
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                 <Layout size={12} /> 코스 전체 조감도
               </div>
               <img src={currentCourse.courseMapUrl} className="w-full h-24 object-cover rounded-xl shadow-inner mb-2" alt="전체 맵" />
            </div>
          </div>

          <div className="flex-1 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-200 shadow-xl group ring-4 ring-white">
                {!imgLoaded && <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse"><ImageIcon size={48} className="opacity-10" /></div>}
                <img src={currentHole.mapUrl} onLoad={() => setImgLoaded(true)} className={`w-full h-full object-cover transition-opacity duration-1000 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} />
                <div className="absolute top-4 left-4 bg-emerald-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-black flex items-center gap-2">
                  <Target size={12} className="text-emerald-400" /> HOLE {currentHole.number} STRATEGY
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">{currentCourse.name}</span>
                  <h2 className="text-4xl font-black text-slate-800 flex items-center gap-3">Hole {currentHole.number} <div className="text-sm text-slate-400 font-bold px-2 py-1 bg-slate-100 rounded-lg">Par {currentHole.par}</div></h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-800">{currentHole.distance}</div>
                  <div className="text-[10px] font-bold text-slate-400">TOTAL DISTANCE</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600"><Target size={24} /></div>
                  <div><div className="text-[10px] font-black text-slate-400 uppercase">핸디캡</div><div className="text-xl font-black text-slate-800">No. {currentHole.handicap}</div></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Flag size={24} /></div>
                  <div><div className="text-[10px] font-black text-slate-400 uppercase">그린 타입</div><div className="text-xl font-black text-slate-800">Bent Grass</div></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-2 flex items-center gap-2"><Info size={14} /> 코스 지형 특징</h4>
                  <p className="text-base text-slate-700 leading-relaxed font-medium">{currentHole.description}</p>
                </div>
                <div className="bg-emerald-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                  <h4 className="text-[10px] font-black text-emerald-300 uppercase mb-3 flex items-center gap-2"><Sparkles size={16} /> 프로의 공략 팁</h4>
                  <p className="text-lg text-emerald-50 leading-snug font-bold">"{currentHole.strategy}"</p>
                  <button onClick={() => handleSend(`포천힐스 ${currentCourse.name} ${currentHole.number}번홀 공략 팁 더 자세히!`)} className="mt-6 w-full py-3 bg-emerald-800/50 hover:bg-white/10 border border-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">공략 상세 질문하기 <ChevronRight size={14} /></button>
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
