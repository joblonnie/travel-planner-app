import type { DayPlan } from '../types/index.ts';

export const defaultTripPlan: DayPlan[] = [
  {
    id: 'day-1', dayNumber: 1, date: '2026-10-17', destination: '바르셀로나', destinationId: 'barcelona',
    activities: [
      { id: 'd1-a1', name: 'Arrive in Barcelona (Aerobus)', nameKo: '바르셀로나 도착 (아에로부스)', time: '14:00', duration: '35분', type: 'transport', estimatedCost: 7.75, currency: 'EUR', isBooked: false, lat: 41.2974, lng: 2.0833 },
      { id: 'd1-a2', name: 'Hotel Check-in & Rest', nameKo: '호텔 체크인 & 휴식', time: '15:00', duration: '1시간', type: 'free', estimatedCost: 0, currency: 'EUR', isBooked: false },
      { id: 'd1-a3', name: 'Gothic Quarter Walk', nameKo: '고딕 지구 산책', time: '17:00', duration: '2시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 41.3833, lng: 2.1761 },
      { id: 'd1-a4', name: 'Dinner at Bar Cañete', nameKo: '바르 카녜테 저녁', time: '20:30', duration: '1.5시간', type: 'meal', estimatedCost: 50, currency: 'EUR', isBooked: false, lat: 41.3798, lng: 2.1720 },
    ],
    notes: '도착일 - 아에로부스로 시내 이동, 고딕 지구 산책 후 Bar Cañete에서 저녁',
  },
  {
    id: 'day-2', dayNumber: 2, date: '2026-10-18', destination: '바르셀로나', destinationId: 'barcelona',
    activities: [
      { id: 'd2-a1', contentId: 'bcn-c1', name: 'Sagrada Família', nameKo: '사그라다 파밀리아', time: '09:00', duration: '2시간', type: 'attraction', estimatedCost: 26, currency: 'EUR', isBooked: false, lat: 41.4036, lng: 2.1744 },
      { id: 'd2-a2', contentId: 'bcn-c7', name: 'Paella Cooking Class', nameKo: '빠에야 쿠킹 클래스', time: '11:30', duration: '3시간', type: 'attraction', estimatedCost: 75, currency: 'EUR', isBooked: false, lat: 41.3851, lng: 2.1734 },
      { id: 'd2-a3', contentId: 'bcn-c3', name: 'Casa Batlló', nameKo: '카사 바트요', time: '15:30', duration: '1.5시간', type: 'attraction', estimatedCost: 35, currency: 'EUR', isBooked: false, lat: 41.3916, lng: 2.1650 },
      { id: 'd2-a4', contentId: 'bcn-c6', name: 'La Pedrera (Casa Milà)', nameKo: '카사 밀라', time: '17:30', duration: '1.5시간', type: 'attraction', estimatedCost: 25, currency: 'EUR', isBooked: false, lat: 41.3953, lng: 2.1620 },
      { id: 'd2-a5', contentId: 'bcn-c8', name: 'FC Barcelona Match', nameKo: 'FC 바르셀로나 경기 관람', time: '21:00', duration: '2시간', type: 'attraction', estimatedCost: 80, currency: 'EUR', isBooked: false, lat: 41.3809, lng: 2.1228 },
    ],
    notes: '가우디 투어 + 빠에야 쿠킹 클래스 + FC 바르셀로나 경기!',
  },
  {
    id: 'day-3', dayNumber: 3, date: '2026-10-19', destination: '그라나다', destinationId: 'granada',
    activities: [
      { id: 'd3-a1', name: 'AVE Train Barcelona → Granada', nameKo: 'AVE 고속열차 바르셀로나 → 그라나다', time: '08:00', duration: '6시간 30분', type: 'transport', estimatedCost: 55, currency: 'EUR', isBooked: false },
      { id: 'd3-a2', name: 'Hotel Check-in', nameKo: '호텔 체크인', time: '15:00', duration: '30분', type: 'free', estimatedCost: 0, currency: 'EUR', isBooked: false },
      { id: 'd3-a3', name: 'Mirador San Nicolás Sunset', nameKo: '미라도르 산 니콜라스 일몰', time: '18:00', duration: '1.5시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 37.1815, lng: -3.5927 },
      { id: 'd3-a4', name: 'Dinner at Bodegas Castañeda', nameKo: '보데가스 카스타녜다 저녁', time: '20:30', duration: '1.5시간', type: 'meal', estimatedCost: 25, currency: 'EUR', isBooked: false, lat: 37.1762, lng: -3.5985 },
    ],
    notes: '바르셀로나 → 그라나다 이동 (AVE 6시간 30분) + 산 니콜라스 전망대 일몰',
  },
  {
    id: 'day-4', dayNumber: 4, date: '2026-10-20', destination: '그라나다', destinationId: 'granada',
    activities: [
      { id: 'd4-a1', contentId: 'gra-c1', name: 'Alhambra + Nasrid Palaces + Generalife', nameKo: '알함브라 + 나스리드 궁전 + 헤네랄리페', time: '08:30', duration: '4시간', type: 'attraction', estimatedCost: 14, currency: 'EUR', isBooked: false, lat: 37.1760, lng: -3.5881 },
      { id: 'd4-a2', name: 'Tapas at Los Diamantes', nameKo: '로스 디아만떼스 타파스', time: '13:30', duration: '1시간', type: 'meal', estimatedCost: 15, currency: 'EUR', isBooked: false, lat: 37.1771, lng: -3.5966 },
      { id: 'd4-a3', name: 'Tapas at Bar Poë', nameKo: '바르 포에 타파스', time: '15:00', duration: '45분', type: 'meal', estimatedCost: 10, currency: 'EUR', isBooked: false, lat: 37.1763, lng: -3.5978 },
      { id: 'd4-a4', name: 'Tapas at Taberna La Tana', nameKo: '따베르나 라 따나 와인 타파스', time: '16:30', duration: '45분', type: 'meal', estimatedCost: 12, currency: 'EUR', isBooked: false, lat: 37.1758, lng: -3.5964 },
      { id: 'd4-a5', name: 'Dinner at La Auténtica Carmela', nameKo: '라 아우텐티카 카르멜라 저녁', time: '20:30', duration: '1.5시간', type: 'meal', estimatedCost: 30, currency: 'EUR', isBooked: false, lat: 37.1742, lng: -3.5997 },
    ],
    notes: '알함브라 궁전 + 나스리드 궁전 + 헤네랄리페 오전, 타파스 투어 오후/저녁',
  },
  {
    id: 'day-5', dayNumber: 5, date: '2026-10-21', destination: '그라나다', destinationId: 'granada',
    activities: [
      { id: 'd5-a1', contentId: 'gra-c2', name: 'Albaicín + Sacromonte Morning Walk', nameKo: '알바이신 + 사크로몬테 오전 산책', time: '09:00', duration: '2.5시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 37.1815, lng: -3.5927 },
      { id: 'd5-a2', name: 'Lunch at Chikito', nameKo: '치키토 점심', time: '13:00', duration: '1.5시간', type: 'meal', estimatedCost: 25, currency: 'EUR', isBooked: false, lat: 37.1762, lng: -3.5990 },
      { id: 'd5-a3', contentId: 'gra-c4', name: 'Hammam Al Ándalus', nameKo: '하맘 알 안달루스', time: '15:30', duration: '1.5시간', type: 'attraction', estimatedCost: 45, currency: 'EUR', isBooked: false, lat: 37.1768, lng: -3.5952 },
      { id: 'd5-a4', contentId: 'gra-c3', name: 'Sacromonte Cave Flamenco', nameKo: '사크로몬테 동굴 플라멩코', time: '21:00', duration: '1.5시간', type: 'attraction', estimatedCost: 25, currency: 'EUR', isBooked: false, lat: 37.1800, lng: -3.5830 },
    ],
    notes: '알바이신 + 사크로몬테 산책 → 치키토 점심 → 하맘 → 동굴 플라멩코',
  },
  {
    id: 'day-6', dayNumber: 6, date: '2026-10-22', destination: '말라가', destinationId: 'malaga',
    activities: [
      { id: 'd6-a1', name: 'ALSA Bus Granada → Málaga', nameKo: 'ALSA 버스 그라나다 → 말라가', time: '09:00', duration: '1시간 45분', type: 'transport', estimatedCost: 12, currency: 'EUR', isBooked: false },
      { id: 'd6-a2', name: 'Hotel Check-in', nameKo: '호텔 체크인', time: '11:00', duration: '30분', type: 'free', estimatedCost: 0, currency: 'EUR', isBooked: false },
      { id: 'd6-a3', contentId: 'mal-c1', name: 'Museo Picasso', nameKo: '피카소 미술관', time: '12:00', duration: '2시간', type: 'attraction', estimatedCost: 12, currency: 'EUR', isBooked: false, lat: 36.7215, lng: -4.4185 },
      { id: 'd6-a4', name: 'Atarazanas Market Visit', nameKo: '아따라사나스 시장 방문', time: '14:30', duration: '1.5시간', type: 'shopping', estimatedCost: 15, currency: 'EUR', isBooked: false, lat: 36.7190, lng: -4.4260 },
      { id: 'd6-a5', name: 'Dinner at El Pimpi', nameKo: '엘 핌피 저녁', time: '20:30', duration: '1.5시간', type: 'meal', estimatedCost: 30, currency: 'EUR', isBooked: false, lat: 36.7222, lng: -4.4180 },
    ],
    notes: '그라나다 → 말라가 이동 (ALSA 1시간 45분) + 피카소 미술관 + 아따라사나스 시장',
  },
  {
    id: 'day-7', dayNumber: 7, date: '2026-10-23', destination: '말라가', destinationId: 'malaga',
    activities: [
      { id: 'd7-a1', contentId: 'mal-c6', name: 'Atarazanas Food Tour', nameKo: '아따라사나스 푸드 투어', time: '10:00', duration: '2.5시간', type: 'attraction', estimatedCost: 65, currency: 'EUR', isBooked: false, lat: 36.7190, lng: -4.4260 },
      { id: 'd7-a2', contentId: 'mal-c2', name: 'Alcazaba', nameKo: '알카사바', time: '14:00', duration: '1.5시간', type: 'attraction', estimatedCost: 3.5, currency: 'EUR', isBooked: false, lat: 36.7210, lng: -4.4160 },
      { id: 'd7-a3', contentId: 'mal-c3', name: 'Castillo de Gibralfaro', nameKo: '히브랄파로 성', time: '16:00', duration: '1.5시간', type: 'attraction', estimatedCost: 3.5, currency: 'EUR', isBooked: false, lat: 36.7230, lng: -4.4108 },
      { id: 'd7-a4', name: 'Dinner at Uvedoble', nameKo: '우베도블레 저녁', time: '20:30', duration: '1.5시간', type: 'meal', estimatedCost: 40, currency: 'EUR', isBooked: false, lat: 36.7200, lng: -4.4200 },
    ],
    notes: '아따라사나스 푸드 투어 오전 + 알카사바 + 히브랄파로 성 오후',
  },
  {
    id: 'day-8', dayNumber: 8, date: '2026-10-24', destination: '네르하', destinationId: 'nerja',
    activities: [
      { id: 'd8-a1', name: 'ALSA Bus Málaga → Nerja', nameKo: 'ALSA 버스 말라가 → 네르하', time: '09:00', duration: '1시간', type: 'transport', estimatedCost: 6, currency: 'EUR', isBooked: false },
      { id: 'd8-a2', name: 'Hotel Check-in', nameKo: '호텔 체크인', time: '10:30', duration: '30분', type: 'free', estimatedCost: 0, currency: 'EUR', isBooked: false },
      { id: 'd8-a3', name: 'Beach Time', nameKo: '해변에서 휴식', time: '11:00', duration: '2시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 36.7400, lng: -3.8690 },
      { id: 'd8-a4', name: 'Lunch at Chiringuito de Ayo', nameKo: '치링기또 데 아요 점심', time: '13:00', duration: '1.5시간', type: 'meal', estimatedCost: 20, currency: 'EUR', isBooked: false, lat: 36.7400, lng: -3.8690 },
      { id: 'd8-a5', contentId: 'ner-c1', name: 'Balcón de Europa', nameKo: '유럽의 발코니', time: '15:30', duration: '1시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 36.7441, lng: -3.8758 },
      { id: 'd8-a6', name: 'Dinner at Oliva', nameKo: '올리바 저녁', time: '20:00', duration: '1.5시간', type: 'meal', estimatedCost: 35, currency: 'EUR', isBooked: false, lat: 36.7445, lng: -3.8770 },
    ],
    notes: '말라가 → 네르하 이동 (ALSA 1시간) + 해변 + 치링기또 데 아요 빠에야 + 유럽의 발코니 (1박)',
  },
  {
    id: 'day-9', dayNumber: 9, date: '2026-10-25', destination: '네르하 / 프리힐리아나', destinationId: 'nerja',
    activities: [
      { id: 'd9-a1', name: 'Bus Nerja → Frigiliana', nameKo: '네르하 → 프리힐리아나 버스', time: '10:00', duration: '20분', type: 'transport', estimatedCost: 1.5, currency: 'EUR', isBooked: false },
      { id: 'd9-a2', contentId: 'fri-c1', name: 'Frigiliana Old Town Walk', nameKo: '프리힐리아나 구시가지 산책', time: '10:30', duration: '2시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 36.7891, lng: -3.8942 },
      { id: 'd9-a3', contentId: 'fri-c2', name: 'Honey Wine Tasting', nameKo: '꿀 와인 시음', time: '12:30', duration: '45분', type: 'attraction', estimatedCost: 8, currency: 'EUR', isBooked: false, lat: 36.7890, lng: -3.8940 },
      { id: 'd9-a4', name: 'Lunch in Frigiliana', nameKo: '프리힐리아나 점심', time: '13:30', duration: '1.5시간', type: 'meal', estimatedCost: 25, currency: 'EUR', isBooked: false, lat: 36.7893, lng: -3.8945 },
      { id: 'd9-a5', name: 'Bus Frigiliana → Málaga', nameKo: '프리힐리아나 → 말라가 버스', time: '16:00', duration: '1시간 30분', type: 'transport', estimatedCost: 5, currency: 'EUR', isBooked: false },
    ],
    notes: '네르하 → 프리힐리아나 당일치기 (꿀 와인 시음) → 말라가 복귀',
  },
  {
    id: 'day-10', dayNumber: 10, date: '2026-10-26', destination: '말라가', destinationId: 'malaga',
    activities: [
      { id: 'd10-a1', name: 'Málaga Beach Morning', nameKo: '말라가 해변 오전', time: '10:00', duration: '2시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 36.7180, lng: -4.4100 },
      { id: 'd10-a2', contentId: 'mal-c7', name: 'CAC Málaga (Contemporary Art)', nameKo: 'CAC 말라가 현대미술관', time: '13:00', duration: '1.5시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 36.7160, lng: -4.4290 },
      { id: 'd10-a3', name: 'Free Time', nameKo: '자유 시간', time: '15:00', duration: '3시간', type: 'free', estimatedCost: 0, currency: 'EUR', isBooked: false },
      { id: 'd10-a4', name: 'Dinner at El Tintero', nameKo: '엘 띤테로 저녁', time: '20:00', duration: '1.5시간', type: 'meal', estimatedCost: 25, currency: 'EUR', isBooked: false, lat: 36.7000, lng: -4.3660 },
    ],
    notes: '말라가 자유일 - 해변, CAC 현대미술관, 엘 띤테로 경매식 해산물 저녁',
  },
  {
    id: 'day-11', dayNumber: 11, date: '2026-10-27', destination: '론다', destinationId: 'ronda',
    activities: [
      { id: 'd11-a1', name: 'ALSA Bus Málaga → Ronda', nameKo: 'ALSA 버스 말라가 → 론다', time: '09:00', duration: '1시간 45분', type: 'transport', estimatedCost: 14, currency: 'EUR', isBooked: false },
      { id: 'd11-a2', name: 'Hotel Check-in', nameKo: '호텔 체크인', time: '11:00', duration: '30분', type: 'free', estimatedCost: 0, currency: 'EUR', isBooked: false },
      { id: 'd11-a3', contentId: 'ron-c3', name: 'Winery Tour (Bodega Doña Felisa)', nameKo: '와이너리 투어 (보데가 도냐 펠리사)', time: '12:00', duration: '2.5시간', type: 'attraction', estimatedCost: 50, currency: 'EUR', isBooked: false, lat: 36.7350, lng: -5.1700 },
      { id: 'd11-a4', contentId: 'ron-c1', name: 'Puente Nuevo', nameKo: '누에보 다리', time: '16:00', duration: '1시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 36.7410, lng: -5.1625 },
      { id: 'd11-a5', name: 'Romantic Dinner in Ronda', nameKo: '론다 로맨틱 디너', time: '20:30', duration: '2시간', type: 'meal', estimatedCost: 50, currency: 'EUR', isBooked: false, lat: 36.7420, lng: -5.1650 },
    ],
    notes: '말라가 → 론다 (ALSA 1시간 45분) + 와이너리 투어 + 누에보 다리 + 로맨틱 디너',
  },
  {
    id: 'day-12', dayNumber: 12, date: '2026-10-28', destination: '코르도바', destinationId: 'cordoba',
    activities: [
      { id: 'd12-a1', contentId: 'ron-c4', name: 'Arab Baths (Baños Árabes)', nameKo: '아랍 목욕탕 유적', time: '09:00', duration: '45분', type: 'attraction', estimatedCost: 3.5, currency: 'EUR', isBooked: false, lat: 36.7390, lng: -5.1620 },
      { id: 'd12-a2', contentId: 'ron-c5', name: 'Mondragón Palace', nameKo: '몬드라곤 궁전', time: '10:00', duration: '1시간', type: 'attraction', estimatedCost: 4, currency: 'EUR', isBooked: false, lat: 36.7405, lng: -5.1640 },
      { id: 'd12-a3', name: 'Bus + Train Ronda → Córdoba', nameKo: '버스 + 열차 론다 → 코르도바', time: '12:00', duration: '3시간', type: 'transport', estimatedCost: 25, currency: 'EUR', isBooked: false },
      { id: 'd12-a4', name: 'Hotel Check-in', nameKo: '호텔 체크인', time: '15:30', duration: '30분', type: 'free', estimatedCost: 0, currency: 'EUR', isBooked: false },
      { id: 'd12-a5', name: 'Roman Bridge Night View', nameKo: '로마 다리 야경', time: '19:30', duration: '1시간', type: 'attraction', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 37.8761, lng: -4.7792 },
      { id: 'd12-a6', name: 'Dinner at Bodegas Mezquita', nameKo: '보데가스 메스키타 저녁', time: '21:00', duration: '1.5시간', type: 'meal', estimatedCost: 30, currency: 'EUR', isBooked: false, lat: 37.8790, lng: -4.7795 },
    ],
    notes: '론다 오전 (아랍 목욕탕, 몬드라곤 궁전) → 코르도바 이동 (~3시간) + 로마 다리 야경',
  },
  {
    id: 'day-13', dayNumber: 13, date: '2026-10-29', destination: '코르도바', destinationId: 'cordoba',
    activities: [
      { id: 'd13-a1', contentId: 'cor-c1', name: 'Mezquita-Catedral', nameKo: '메스키타 대성당', time: '09:00', duration: '2시간', type: 'attraction', estimatedCost: 13, currency: 'EUR', isBooked: false, lat: 37.8789, lng: -4.7794 },
      { id: 'd13-a2', contentId: 'cor-c4', name: 'Olive Oil Tasting', nameKo: '올리브 오일 시음', time: '12:00', duration: '1.5시간', type: 'attraction', estimatedCost: 20, currency: 'EUR', isBooked: false, lat: 37.8850, lng: -4.7750 },
      { id: 'd13-a3', name: 'Lunch at Taberna Salinas', nameKo: '따베르나 살리나스 점심', time: '14:00', duration: '1.5시간', type: 'meal', estimatedCost: 25, currency: 'EUR', isBooked: false, lat: 37.8830, lng: -4.7770 },
      { id: 'd13-a4', contentId: 'cor-c3', name: 'Jewish Quarter Tapas Tour', nameKo: '유대인 지구 타파스 투어', time: '18:00', duration: '2.5시간', type: 'attraction', estimatedCost: 15, currency: 'EUR', isBooked: false, lat: 37.8795, lng: -4.7815 },
      { id: 'd13-a5', name: 'Dinner at Bodegas Campos', nameKo: '보데가스 캄포스 저녁', time: '21:00', duration: '1.5시간', type: 'meal', estimatedCost: 35, currency: 'EUR', isBooked: false, lat: 37.8835, lng: -4.7765 },
    ],
    notes: '메스키타 오전 → 올리브 오일 시음 오후 → 유대인 지구 타파스 투어 저녁',
  },
  {
    id: 'day-14', dayNumber: 14, date: '2026-10-30', destination: '바르셀로나', destinationId: 'barcelona',
    activities: [
      { id: 'd14-a1', contentId: 'cor-c2', name: 'Alcázar or Viana Palace Morning', nameKo: '알카사르 또는 비아나 궁전 오전', time: '09:00', duration: '1.5시간', type: 'attraction', estimatedCost: 5, currency: 'EUR', isBooked: false, lat: 37.8768, lng: -4.7826 },
      { id: 'd14-a2', name: 'AVE Train Córdoba → Barcelona', nameKo: 'AVE 고속열차 코르도바 → 바르셀로나', time: '11:30', duration: '4시간 45분', type: 'transport', estimatedCost: 50, currency: 'EUR', isBooked: false },
      { id: 'd14-a3', name: 'Hotel Check-in', nameKo: '호텔 체크인', time: '16:30', duration: '30분', type: 'free', estimatedCost: 0, currency: 'EUR', isBooked: false },
      { id: 'd14-a4', name: 'Dinner at Cal Pep', nameKo: '칼 펩 저녁', time: '20:30', duration: '1.5시간', type: 'meal', estimatedCost: 50, currency: 'EUR', isBooked: false, lat: 41.3838, lng: 2.1824 },
    ],
    notes: '코르도바 오전 → 바르셀로나 이동 (AVE 4시간 45분) → Cal Pep 저녁',
  },
  {
    id: 'day-15', dayNumber: 15, date: '2026-10-31', destination: '바르셀로나', destinationId: 'barcelona',
    activities: [
      { id: 'd15-a1', name: 'Shopping: Eixample + Passeig de Gràcia', nameKo: '쇼핑: 에이샴플라 + 그라시아 거리', time: '10:00', duration: '2.5시간', type: 'shopping', estimatedCost: 100, currency: 'EUR', isBooked: false, lat: 41.3916, lng: 2.1650 },
      { id: 'd15-a2', name: 'Shopping: Gothic Quarter + El Born', nameKo: '쇼핑: 고딕 지구 + 엘 본', time: '13:30', duration: '2.5시간', type: 'shopping', estimatedCost: 80, currency: 'EUR', isBooked: false, lat: 41.3833, lng: 2.1761 },
      { id: 'd15-a3', contentId: 'bcn-c2', name: 'Park Güell', nameKo: '구엘 공원', time: '17:00', duration: '1.5시간', type: 'attraction', estimatedCost: 10, currency: 'EUR', isBooked: false, lat: 41.4145, lng: 2.1527 },
      { id: 'd15-a4', name: 'Dinner at Cervecería Catalana', nameKo: '세르베세리아 카탈라나 저녁', time: '20:30', duration: '1.5시간', type: 'meal', estimatedCost: 40, currency: 'EUR', isBooked: false, lat: 41.3931, lng: 2.1618 },
    ],
    notes: '쇼핑 데이! 에이샴플라/그라시아 오전, 고딕/엘 본 오후 + 구엘 공원 + 세르베세리아 카탈라나',
  },
  {
    id: 'day-16', dayNumber: 16, date: '2026-11-01', destination: '바르셀로나', destinationId: 'barcelona',
    activities: [
      { id: 'd16-a1', name: 'Pack & Hotel Checkout', nameKo: '짐 정리 & 호텔 체크아웃', time: '09:00', duration: '1시간', type: 'free', estimatedCost: 0, currency: 'EUR', isBooked: false },
      { id: 'd16-a2', name: 'Aerobus to Airport', nameKo: '아에로부스 공항 이동', time: '11:00', duration: '35분', type: 'transport', estimatedCost: 7.75, currency: 'EUR', isBooked: false, lat: 41.2974, lng: 2.0833 },
      { id: 'd16-a3', name: 'Barcelona → Incheon Departure', nameKo: '바르셀로나 → 인천 출발', time: '14:00', duration: '12시간', type: 'transport', estimatedCost: 0, currency: 'EUR', isBooked: false, lat: 41.2974, lng: 2.0833 },
    ],
    notes: '마지막 날 - 바르셀로나 → 인천 출발',
  },
];
