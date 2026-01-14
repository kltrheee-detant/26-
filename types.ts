
export interface Member {
  id: string;
  name: string;
  nickname?: string;
  handicap: number;
  avatar: string;
  annualFeeTarget: number;
}

export interface Outing {
  id: string;
  title: string;
  date: string;
  courseName: string;
  location: string;
  lunchLocation?: string;
  lunchAddress?: string; // 점심 주소 추가
  lunchLink?: string; // 점심 지도 링크 추가
  dinnerLocation?: string;
  dinnerAddress?: string; // 저녁 주소 추가
  dinnerLink?: string; // 저녁 지도 링크 추가
  participants: string[];
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
