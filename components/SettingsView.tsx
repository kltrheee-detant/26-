
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Download, Upload, Share2, ShieldCheck, Database, Check, Copy } from 'lucide-react';

interface Props {
  onReload: () => void;
}

const SettingsView: React.FC<Props> = ({ onReload }) => {
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = () => {
    const data = storageService.exportFullData();
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">설정 및 데이터 관리</h2>
        <p className="text-slate-500">앱 설정과 클럽 데이터를 관리하세요.</p>
      </div>

      {/* 데이터 백업 섹션 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Database className="text-emerald-600" size={20} />
          <h3 className="font-bold text-slate-800">클럽 데이터 공유 (Base64)</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">데이터 내보내기</h4>
            <p className="text-xs text-slate-500 mb-4">현재까지 입력된 모든 라운딩, 스코어, 회비 내역을 문자 형태로 복사합니다. 다른 회원에게 보내 공유할 수 있습니다.</p>
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md"
            >
              {copied ? <Check size={18} /> : <Share2 size={18} />}
              {copied ? '클립보드에 복사됨!' : '전체 데이터 복사하기'}
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-2">데이터 가져오기</h4>
            <p className="text-xs text-slate-500 mb-4">공유받은 데이터 코드를 아래에 붙여넣으세요. 기존 데이터가 덮어씌워집니다.</p>
            <textarea 
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="여기에 공유받은 코드를 붙여넣으세요..."
              className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <button 
              disabled={!importText.trim()}
              onClick={handleImport}
              className={`w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                importStatus === 'error' ? 'bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
              } disabled:opacity-50`}
            >
              {importStatus === 'success' ? <Check size={18} /> : <Upload size={18} />}
              {importStatus === 'success' ? '데이터 동기화 완료!' : importStatus === 'error' ? '잘못된 형식입니다' : '데이터 불러오기'}
            </button>
          </div>
        </div>
      </div>

      {/* 보안/앱 정보 */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-lg flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-2xl">
          <ShieldCheck size={32} className="text-emerald-400" />
        </div>
        <div>
          <h4 className="font-bold">동물원 클라우드 보안</h4>
          <p className="text-xs text-emerald-300 mt-1">입력된 모든 데이터는 브라우저의 안전한 영역에 저장되며, SSL 암호화 통신을 통해 AI 캐디와 연결됩니다.</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400">동물원 골프 커뮤니티 v1.0.2</p>
      </div>
    </div>
  );
};

export default SettingsView;
