
import React, { useState, useRef } from 'react';
import { storageService } from '../services/storageService.ts';
import { Download, Upload, Share2, ShieldCheck, Database, Check, Copy, FileJson, Link as LinkIcon, ExternalLink, Smartphone, Apple, MoreVertical } from 'lucide-react';

interface Props {
  onReload: () => void;
}

const SettingsView: React.FC<Props> = ({ onReload }) => {
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState<'base64' | 'link' | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBase64 = () => {
    const data = storageService.exportFullData();
    navigator.clipboard.writeText(data);
    setCopied('base64');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExportLink = () => {
    const data = storageService.exportFullData();
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}#import=${data}`;
    
    navigator.clipboard.writeText(shareUrl);
    setCopied('link');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleImport = () => {
    const success = storageService.importFullData(importText);
    if (success) {
      setImportStatus('success');
      setTimeout(() => onReload(), 1000);
    } else {
      setImportStatus('error');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (storageService.importFullData(json)) {
          alert('파일로부터 데이터를 성공적으로 불러왔습니다!');
          onReload();
        }
      } catch (err) {
        alert('올바른 JSON 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">설정 및 어플 관리</h2>
          <p className="text-slate-500">클럽 데이터를 멤버들과 안전하게 주고받고 설치하세요.</p>
        </div>
      </div>

      {/* 스마트폰 어플로 설치하기 가이드 */}
      <div className="bg-emerald-950 text-white rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
        <Smartphone className="absolute -right-10 -bottom-10 w-48 h-48 text-emerald-900 opacity-40 group-hover:rotate-12 transition-transform duration-700" />
        <div className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Smartphone size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-black tracking-tight">스마트폰 어플로 만들기</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <Apple size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">iOS (아이폰)</span>
              </div>
              <ol className="text-xs space-y-2 text-emerald-50/80 font-medium">
                <li>1. 사파리(Safari)로 접속</li>
                <li>2. 하단 <span className="text-white font-black">[공유 버튼]</span> 클릭</li>
                <li>3. <span className="text-white font-black">'홈 화면에 추가'</span> 클릭</li>
              </ol>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <Smartphone size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Android (갤럭시)</span>
              </div>
              <ol className="text-xs space-y-2 text-emerald-50/80 font-medium">
                <li>1. 크롬(Chrome)으로 접속</li>
                <li>2. 우상단 <MoreVertical size={14} className="inline" /> 버튼 클릭</li>
                <li>3. <span className="text-white font-black">'홈 화면에 추가'</span> 클릭</li>
              </ol>
            </div>
          </div>
          <p className="mt-6 text-[10px] text-emerald-500 font-bold uppercase tracking-tighter text-center">※ 설치하면 웹브라우저 주소창 없이 진짜 어플처럼 작동합니다.</p>
        </div>
      </div>

      {/* 데이터 내보내기/공유 */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Share2 className="text-emerald-600" size={20} />
          <h3 className="font-bold text-slate-800">데이터 내보내기 (멤버에게 보내기)</h3>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={storageService.downloadAsFile}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 shadow-sm">
                <FileJson size={24} />
              </div>
              <div className="text-center">
                <div className="text-sm font-black text-slate-700">JSON 파일 저장</div>
                <div className="text-[10px] text-slate-400 font-bold mt-1">카톡 파일 전송용</div>
              </div>
            </button>

            <button 
              onClick={handleExportLink}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm">
                {copied === 'link' ? <Check size={24} className="text-emerald-500" /> : <LinkIcon size={24} />}
              </div>
              <div className="text-center">
                <div className="text-sm font-black text-slate-700">{copied === 'link' ? '복사 완료!' : '공유용 링크 복사'}</div>
                <div className="text-[10px] text-slate-400 font-bold mt-1">원클릭 동기화 링크</div>
              </div>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-2">백업용 텍스트 코드</h4>
            <p className="text-xs text-slate-500 mb-4">데이터 양이 많을 때 사용하는 원본 코드입니다.</p>
            <button 
              onClick={handleExportBase64}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/10"
            >
              {copied === 'base64' ? <Check size={18} /> : <Copy size={18} />}
              {copied === 'base64' ? '클립보드에 복사됨!' : '전체 데이터 코드 복사'}
            </button>
          </div>
        </div>
      </div>

      {/* 데이터 가져오기 */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Upload className="text-blue-600" size={20} />
          <h3 className="font-bold text-slate-800">데이터 가져오기 (멤버에게 받은 것)</h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all"
            >
              <FileJson size={18} /> JSON 파일 선택
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileImport}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs font-black uppercase tracking-widest text-slate-300">
              <span className="bg-white px-2">OR Text Code</span>
            </div>
          </div>

          <textarea 
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="공유받은 텍스트 코드를 여기에 붙여넣으세요..."
            className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none shadow-inner"
          />
          
          <button 
            disabled={!importText.trim()}
            onClick={handleImport}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all shadow-lg ${
              importStatus === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            } disabled:opacity-30`}
          >
            {importStatus === 'success' ? <Check size={18} /> : <ExternalLink size={18} />}
            {importStatus === 'success' ? '데이터 동기화 완료!' : importStatus === 'error' ? '잘못된 형식입니다' : '코드 불러오기 실행'}
          </button>
        </div>
      </div>

      {/* 보안/앱 정보 */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl shrink-0">
            <ShieldCheck size={24} className="text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 leading-none mb-2">동물원 보안 데이터 교환</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              모든 데이터는 사용자 기기에 암호화되어 저장됩니다. AI 캐디 기능 사용 시를 제외하고는 외부 서버로 전송되지 않으며, 공유 기능을 통해 멤버들 간에만 수동으로 데이터를 주고받을 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Zoo Golf Community v1.1.5 • Build Stable</p>
      </div>
    </div>
  );
};

export default SettingsView;
