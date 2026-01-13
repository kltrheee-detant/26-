
export interface Member {
  id: string;
  name: string;
  nickname?: string; // 회원 닉네임 추가
  handicap: number;
  avatar: string;
  annualFeeTarget: number; // 회원별 내야 하는 연회비 목표 금액
}

export interface Outing {
  id: string;
  title: string;
  date: string;
  courseName: string;
  location: string;
  participants: string[]; // Member IDs
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
  imageUrl?: string; // 스코어카드 사진 (Base64)
}

export interface FeeRecord {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  purpose: string; // 예: "정기회비", "찬조", "기타"
  status: 'paid' | 'unpaid';
  memo?: string; // 메모 기능 추가
}

export type View = 'dashboard' | 'outings' | 'scores' | 'members' | 'ai-caddy' | 'fees' | 'settings';
