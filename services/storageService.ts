
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

// 무료 공개 KV 저장소 API
const CLOUD_API_URL = 'https://kv.pico.sh/v1';

export const storageService = {
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

  saveClubId: (id: string) => localStorage.setItem(STORAGE_KEYS.CLUB_ID, id),
  loadClubId: () => localStorage.getItem(STORAGE_KEYS.CLUB_ID) || '',
  saveSyncEnabled: (enabled: boolean) => localStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, enabled ? 'true' : 'false'),
  loadSyncEnabled: () => localStorage.getItem(STORAGE_KEYS.SYNC_ENABLED) === 'true',

  getFullData: () => ({
    members: storageService.loadMembers(),
    outings: storageService.loadOutings(),
    scores: storageService.loadScores(),
    fees: storageService.loadFees(),
    carryover: storageService.loadCarryover(),
    updatedAt: Date.now()
  }),

  // 클라우드 저장 (Push) - 타임아웃 및 헤더 추가
  pushToCloud: async (clubId: string) => {
    if (!clubId) return false;
    const data = storageService.getFullData();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${CLOUD_API_URL}/${clubId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      console.warn("Cloud push failed:", e);
      return false;
    }
  },

  // 클라우드 가져오기 (Pull) - 타임아웃 및 헤더 추가
  pullFromCloud: async (clubId: string) => {
    if (!clubId) return null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${CLOUD_API_URL}/${clubId}`, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Cloud pull failed:", e);
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
