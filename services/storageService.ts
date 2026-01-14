
import { Member, Outing, RoundScore, FeeRecord } from '../types.ts';

const STORAGE_KEYS = {
  MEMBERS: 'zoo_members',
  OUTINGS: 'zoo_outings',
  SCORES: 'zoo_scores',
  FEES: 'zoo_fees',
  CARRYOVER: 'zoo_carryover',
  CLUB_ID: 'zoo_club_id',
  SYNC_ENABLED: 'zoo_sync_enabled'
};

// 무료 공개 KV 저장소 API (데모용)
const CLOUD_API_URL = 'https://kv.pico.sh/v1';

export const storageService = {
  // 기본 로컬 저장 로직
  saveMembers: (members: Member[]) => localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members)),
  loadMembers: (): Member[] | null => {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : null;
  },
  saveOutings: (outings: Outing[]) => localStorage.setItem(STORAGE_KEYS.OUTINGS, JSON.stringify(outings)),
  loadOutings: (): Outing[] | null => {
    const data = localStorage.getItem(STORAGE_KEYS.OUTINGS);
    return data ? JSON.parse(data) : null;
  },
  saveScores: (scores: RoundScore[]) => localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores)),
  loadScores: (): RoundScore[] | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SCORES);
    return data ? JSON.parse(data) : null;
  },
  saveFees: (fees: FeeRecord[]) => localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees)),
  loadFees: (): FeeRecord[] | null => {
    const data = localStorage.getItem(STORAGE_KEYS.FEES);
    return data ? JSON.parse(data) : null;
  },
  saveCarryover: (amount: number) => localStorage.setItem(STORAGE_KEYS.CARRYOVER, amount.toString()),
  loadCarryover: (): number => {
    const data = localStorage.getItem(STORAGE_KEYS.CARRYOVER);
    return data ? parseInt(data) : 0;
  },

  // 클럽 ID 및 동기화 설정
  saveClubId: (id: string) => localStorage.setItem(STORAGE_KEYS.CLUB_ID, id),
  loadClubId: () => localStorage.getItem(STORAGE_KEYS.CLUB_ID) || '',
  saveSyncEnabled: (enabled: boolean) => localStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, enabled ? 'true' : 'false'),
  loadSyncEnabled: () => localStorage.getItem(STORAGE_KEYS.SYNC_ENABLED) === 'true',

  // 전체 데이터 객체 생성
  getFullData: () => ({
    members: storageService.loadMembers(),
    outings: storageService.loadOutings(),
    scores: storageService.loadScores(),
    fees: storageService.loadFees(),
    carryover: storageService.loadCarryover(),
    updatedAt: Date.now()
  }),

  // 클라우드 저장 (Push)
  pushToCloud: async (clubId: string) => {
    if (!clubId) return;
    const data = storageService.getFullData();
    try {
      await fetch(`${CLOUD_API_URL}/${clubId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return true;
    } catch (e) {
      console.error("Cloud push failed", e);
      return false;
    }
  },

  // 클라우드 가져오기 (Pull)
  pullFromCloud: async (clubId: string) => {
    if (!clubId) return null;
    try {
      const response = await fetch(`${CLOUD_API_URL}/${clubId}`);
      if (response.ok) {
        const remoteData = await response.json();
        // 로컬 데이터보다 최신일 경우에만 리턴
        return remoteData;
      }
    } catch (e) {
      console.error("Cloud pull failed", e);
    }
    return null;
  },

  exportFullData: () => {
    const data = storageService.getFullData();
    return btoa(encodeURIComponent(JSON.stringify(data)));
  },

  importFullData: (source: string | any) => {
    try {
      let parsed;
      if (typeof source === 'string') {
        const decoded = decodeURIComponent(atob(source));
        parsed = JSON.parse(decoded);
      } else {
        parsed = source;
      }

      if (parsed.members) storageService.saveMembers(parsed.members);
      if (parsed.outings) storageService.saveOutings(parsed.outings);
      if (parsed.scores) storageService.saveScores(parsed.scores);
      if (parsed.fees) storageService.saveFees(parsed.fees);
      if (parsed.carryover !== undefined) storageService.saveCarryover(parsed.carryover);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Fixed Error: Added downloadAsFile to fix the property error in SettingsView.tsx
  downloadAsFile: () => {
    const data = storageService.getFullData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zoo_golf_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
