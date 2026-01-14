
import { Member, Outing, RoundScore, FeeRecord } from '../types.ts';

const STORAGE_KEYS = {
  MEMBERS: 'zoo_members',
  OUTINGS: 'zoo_outings',
  SCORES: 'zoo_scores',
  FEES: 'zoo_fees',
  CARRYOVER: 'zoo_carryover'
};

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

  // 전체 데이터 내보내기 (공유용)
  exportFullData: () => {
    const fullData = {
      members: storageService.loadMembers(),
      outings: storageService.loadOutings(),
      scores: storageService.loadScores(),
      fees: storageService.loadFees(),
      carryover: storageService.loadCarryover(),
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    return btoa(encodeURIComponent(JSON.stringify(fullData))); // Base64 encoding for easy sharing
  },

  // 데이터 가져오기
  importFullData: (base64Data: string) => {
    try {
      const decoded = decodeURIComponent(atob(base64Data));
      const parsed = JSON.parse(decoded);
      if (parsed.members) storageService.saveMembers(parsed.members);
      if (parsed.outings) storageService.saveOutings(parsed.outings);
      if (parsed.scores) storageService.saveScores(parsed.scores);
      if (parsed.fees) storageService.saveFees(parsed.fees);
      if (parsed.carryover !== undefined) storageService.saveCarryover(parsed.carryover);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  }
};
