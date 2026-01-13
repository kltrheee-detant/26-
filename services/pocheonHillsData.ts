
export interface HoleInfo {
  number: number;
  par: number;
  distance: string; // e.g. "320m"
  description: string;
  strategy: string;
  handicap: number;
  mapUrl?: string; 
}

export interface CourseData {
  name: string;
  holes: HoleInfo[];
  courseMapUrl: string; // 코스 전체 조감도
}

export const POCHEON_HILLS_DATA: Record<string, CourseData> = {
  palace: {
    name: "팰리스 코스 (Palace)",
    courseMapUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=1200&auto=format&fit=crop&sig=palace_all",
    holes: [
      { number: 1, par: 4, distance: "340m", handicap: 5, description: "비교적 평탄한 내리막 스타트 홀입니다.", strategy: "티샷은 중앙보다 약간 좌측이 세컨 공략에 유리합니다. 그린 앞 벙커만 주의하면 무난합니다.", mapUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop&sig=p1" },
      { number: 2, par: 5, distance: "480m", handicap: 1, description: "우도그렉 롱홀로 장타자에게는 투온의 유혹이 있는 홀입니다.", strategy: "티샷 시 우측 벙커를 넘기면 베스트. 세컨샷은 좌측 해저드를 피해 페어웨이 우측을 겨냥하세요.", mapUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=800&auto=format&fit=crop&sig=p2" },
      { number: 3, par: 3, distance: "145m", handicap: 9, description: "그린이 좌우로 긴 형태의 파3 홀입니다.", strategy: "앞 핀일 경우 벙커가 위협적이니 그린 중앙을 보고 여유 있게 공략하는 것이 정석입니다.", mapUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop&sig=p3" },
      { number: 4, par: 4, distance: "310m", handicap: 7, description: "거리는 짧지만 오르막 경사가 심한 홀입니다.", strategy: "티샷은 페어웨이 중앙이 최상. 그린 경사가 심하므로 오르막 퍼팅을 남기는 지점이 좋습니다.", mapUrl: "https://images.unsplash.com/photo-1627444155913-9118c7f1a39c?q=80&w=800&auto=format&fit=crop&sig=p4" },
      { number: 5, par: 4, distance: "360m", handicap: 3, description: "좌측으로 굽은 홀로 티샷 낙구 지점이 좁아 보입니다.", strategy: "티샷은 좌측 벙커 우측 끝을 조준하세요. 세컨샷은 포대 그린이므로 한 클럽 길게 잡으세요.", mapUrl: "https://images.unsplash.com/photo-1592919016382-7aa7968bc50d?q=80&w=800&auto=format&fit=crop&sig=p5" },
      { number: 6, par: 3, distance: "160m", handicap: 8, description: "바람의 영향을 많이 받는 아일랜드 풍의 파3입니다.", strategy: "바람 체크는 필수. 그린 우측 공간이 없으므로 좌측을 공략하는 것이 안전한 선택입니다.", mapUrl: "https://images.unsplash.com/photo-1591491640784-3232eb748d4b?q=80&w=800&auto=format&fit=crop&sig=p6" },
      { number: 7, par: 4, distance: "330m", handicap: 4, description: "좌측 해저드가 위협적인 우도그렉 홀입니다.", strategy: "티샷은 중앙 우측 나무 방향이 좋습니다. 세컨은 오르막을 감안하여 클럽 선택을 신중히 하세요.", mapUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=800&auto=format&fit=crop&sig=p7" },
      { number: 8, par: 5, distance: "450m", handicap: 6, description: "좌우측 OB가 도사리고 있는 직선형 파5 홀입니다.", strategy: "티샷만 잘 보내놓으면 버디 기회가 많습니다. 무리한 투온보다 안정적인 3온 전략을 추천합니다.", mapUrl: "https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=800&auto=format&fit=crop&sig=p8" },
      { number: 9, par: 4, distance: "355m", handicap: 2, description: "클럽하우스 방향으로 치는 마무리 홀입니다.", strategy: "전체적으로 우측 경사가 있으므로 티샷은 페어웨이 좌측을 타겟팅 하세요. 그린 앞 벙커가 큽니다.", mapUrl: "https://images.unsplash.com/photo-1528605248644-14dd04cb11c1?q=80&w=800&auto=format&fit=crop&sig=p9" }
    ]
  },
  garden: {
    name: "가든 코스 (Garden)",
    courseMapUrl: "https://images.unsplash.com/photo-1584395630466-992383c27171?q=80&w=1200&auto=format&fit=crop&sig=garden_all",
    holes: [
      { number: 1, par: 4, distance: "325m", handicap: 6, description: "편안한 내리막 스타트 홀입니다.", strategy: "티샷은 페어웨이 중앙이면 충분합니다. 그린 주변 공간이 넉넉합니다.", mapUrl: "https://images.unsplash.com/photo-1584395630466-992383c27171?q=80&w=800&auto=format&fit=crop&sig=g1" },
      { number: 2, par: 4, distance: "380m", handicap: 2, description: "거리가 긴 파4 홀로 미들 아이언 이상의 정확도가 요구됩니다.", strategy: "티샷 비거리 확보가 관건. 무리한 핀 공략보다 그린 중앙을 보고 온그린에 집중하세요.", mapUrl: "https://images.unsplash.com/photo-1560035064-07e034079836?q=80&w=800&auto=format&fit=crop&sig=g2" },
      { number: 3, par: 3, distance: "130m", handicap: 9, description: "연못을 넘겨야 하는 아름다운 파3 홀입니다.", strategy: "심리적 부담을 이겨내고 가볍게 툭 치는 느낌으로 공략하세요. 핀보다 길게 보는 것이 안전합니다.", mapUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop&sig=g3" },
      { number: 4, par: 5, distance: "510m", handicap: 1, description: "S자형 페어웨이를 가진 핸디캡 1번 홀입니다.", strategy: "철저히 끊어가는 지혜가 필요합니다. 세컨샷 시 벙커 배치를 유심히 확인하세요.", mapUrl: "https://images.unsplash.com/photo-1552083375-1447ce886485?q=80&w=800&auto=format&fit=crop&sig=g4" },
      { number: 5, par: 4, distance: "305m", handicap: 8, description: "거리가 짧아 버디 기회가 있는 홀입니다.", strategy: "장타자라면 그린 앞까지 보낼 수 있습니다. 하지만 그린 경사가 심해 정교한 어프로치가 우선입니다.", mapUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop&sig=g5" },
      { number: 6, par: 4, distance: "345m", handicap: 4, description: "좌측 해저드가 끝까지 따라오는 까다로운 홀입니다.", strategy: "티샷은 중앙 우측을 겨냥하는 것이 안전합니다. 세컨 시 핀 위치에 따라 거리 조절이 중요합니다.", mapUrl: "https://images.unsplash.com/photo-1566433320790-3c0c1151fd04?q=80&w=800&auto=format&fit=crop&sig=g6" },
      { number: 7, par: 3, distance: "175m", handicap: 3, description: "매우 긴 파3 홀로 정확한 임팩트가 필수입니다.", strategy: "롱아이언이나 유틸리티를 잡아야 할 수도 있습니다. 그린 좌측은 위험하니 우측 공간을 쓰세요.", mapUrl: "https://images.unsplash.com/photo-1587560699334-bea93391dcef?q=80&w=800&auto=format&fit=crop&sig=g7" },
      { number: 8, par: 4, distance: "335m", handicap: 7, description: "페어웨이 벙커 배치가 전략적인 홀입니다.", strategy: "티샷 시 벙커를 피하는 클럽 선택도 고려해 보세요. 그린은 평이한 편입니다.", mapUrl: "https://images.unsplash.com/photo-1594968973184-9140fa30776d?q=80&w=800&auto=format&fit=crop&sig=g8" },
      { number: 9, par: 5, distance: "470m", handicap: 5, description: "내리막 경사가 있어 비거리 이득을 보는 홀입니다.", strategy: "세컨샷 시 시야가 가려질 수 있으니 목표 방향을 확실히 정하고 스윙하세요.", mapUrl: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=800&auto=format&fit=crop&sig=g9" }
    ]
  },
  castle: {
    name: "캐슬 코스 (Castle)",
    courseMapUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop&sig=castle_all",
    holes: [
      { number: 1, par: 4, distance: "315m", handicap: 7, description: "숲길을 따라가는 듯한 아늑한 스타트 홀입니다.", strategy: "티샷은 정교함이 생명입니다. 우측 숲을 피해 좌측을 노리세요.", mapUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop&sig=c1" },
      { number: 2, par: 3, distance: "155m", handicap: 5, description: "숲을 가로질러 쳐야 하는 숲속의 파3입니다.", strategy: "그린이 좌우로 길고 경사가 있습니다. 핀보다 좌측이 탈출하기 수월합니다.", mapUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop&sig=c2" },
      { number: 3, par: 4, distance: "375m", handicap: 1, description: "캐슬 코스 최고의 난코스입니다.", strategy: "티샷 비거리와 정확도 모두 필요합니다. 오르막 세컨샷 시 한 클럽 이상 넉넉히 보세요.", mapUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop&sig=c3" },
      { number: 4, par: 5, distance: "490m", handicap: 4, description: "곡선미가 돋보이는 파5 홀입니다.", strategy: "세컨샷 지점에 벙커가 많으니 무리하지 말고 넓은 곳으로 끊어가세요.", mapUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop&sig=c4" },
      { number: 5, par: 4, distance: "330m", handicap: 8, description: "그린 입구가 좁아 보이는 정교한 홀입니다.", strategy: "티샷은 중앙 좌측이 좋습니다. 그린 주변 벙커가 위협적입니다.", mapUrl: "https://images.unsplash.com/photo-1532274402911-5a3b027c55b9?q=80&w=800&auto=format&fit=crop&sig=c5" },
      { number: 6, par: 4, distance: "350m", handicap: 3, description: "우측 해저드가 장관을 이루는 홀입니다.", strategy: "해저드에 위축되지 말고 페어웨이 중앙을 자신 있게 공략하세요.", mapUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800&auto=format&fit=crop&sig=c6" },
      { number: 7, par: 3, distance: "140m", handicap: 9, description: "숲의 기운을 만끽하며 치는 파3 홀입니다.", strategy: "비교적 거리가 짧으므로 정교한 아이언 샷으로 버디를 노려보세요.", mapUrl: "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?q=80&w=800&auto=format&fit=crop&sig=c7" },
      { number: 8, par: 4, distance: "320m", handicap: 6, description: "계곡을 넘기는 스릴이 있는 홀입니다.", strategy: "티샷 시 비거리 부담을 떨치고 리드미컬하게 스윙하세요.", mapUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800&auto=format&fit=crop&sig=c8" },
      { number: 9, par: 5, distance: "465m", handicap: 2, description: "성벽(Castle)을 연상시키는 웅장한 마무리 홀입니다.", strategy: "그린 주변의 대형 벙커와 조형물들이 장관입니다. 끝까지 집중력을 잃지 마세요.", mapUrl: "https://images.unsplash.com/photo-1444464666168-49d633b867ad?q=80&w=800&auto=format&fit=crop&sig=c9" }
    ]
  }
};
