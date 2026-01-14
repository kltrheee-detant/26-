
export interface Member {
  id: string;
  name: string;
  nickname?: string;
  handicap: number;
  avatar: string;
  annualFeeTarget: number;
}

export interface OutingGroup {
  name: string;
  memberIds: string[];
}

export interface Outing {
  id: string;
  title: string;
  date: string;
  courseName: string;
  location: string;
  lunchLocation?: string;
  lunchTime?: string; // 식사 시간 추가
  lunchAddress?: string;
  lunchLink?: string;
  dinnerLocation?: string;
  dinnerTime?: string; // 식사 시간 추가
  dinnerAddress?: string;
  dinnerLink?: string;
  participants: string[];
  groups: OutingGroup[]; // 조 편성 필드 추가
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface RoundScore {
  id: string;
  outingId: string;
  memberId: string;
  totalScore: number;
  putts?: number;
  fairwaysHit?: number;
  date: string;
  imageUrl?: string;
}

export interface FeeRecord {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  purpose: string;
  status: 'paid' | 'unpaid';
  memo?: string;
}

export type View = 'dashboard' | 'outings' | 'scores' | 'members' | 'ai-caddy' | 'fees' | 'settings';
