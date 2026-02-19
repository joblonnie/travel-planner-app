export type Language = 'ko' | 'en';

export const translations = {
  // App Header
  'app.days': { ko: '일', en: 'days' },
  'app.route': { ko: '루트', en: 'Route' },

  // Sidebar
  'sidebar.schedule': { ko: '일정표', en: 'Schedule' },
  'sidebar.totalCost': { ko: '전체 예상 비용', en: 'Total Estimated Cost' },
  'sidebar.budget': { ko: '가계부', en: 'Budget' },

  // Day Content
  'day.day': { ko: 'Day', en: 'Day' },
  'day.localTime': { ko: '현지 시간', en: 'Local Time' },
  'day.gpsActive': { ko: 'GPS 활성', en: 'GPS Active' },
  'day.schedule': { ko: '개 일정', en: ' activities' },
  'day.todaySchedule': { ko: '오늘의 일정', en: "Today's Schedule" },
  'day.dragToReorder': { ko: '드래그로 순서 변경', en: 'Drag to reorder' },
  'day.reorderMode': { ko: '순서 변경', en: 'Reorder' },
  'day.reorderDone': { ko: '완료', en: 'Done' },
  'day.addActivity': { ko: '일정 추가', en: 'Add Activity' },
  'day.today': { ko: '오늘', en: 'Today' },
  'day.total': { ko: '전체', en: 'Total' },
  'day.todayRoute': { ko: '오늘의 루트', en: "Today's Route" },
  'day.showMapWithKey': { ko: 'VITE_GOOGLE_MAPS_KEY 설정 시 지도 표시', en: 'Set VITE_GOOGLE_MAPS_KEY to show map' },
  'day.currentLocation': { ko: '현재 위치', en: 'Current Location' },
  'day.enableGps': { ko: 'GPS 켜기', en: 'Enable GPS' },
  'day.locating': { ko: '위치 찾는 중...', en: 'Locating...' },
  'day.notes': { ko: '메모', en: 'Notes' },
  'day.walkAbout': { ko: '도보 약 ', en: '~' },
  'day.minutes': { ko: '분', en: 'min' },
  'day.hours': { ko: '시간', en: 'h' },
  'day.remaining': { ko: '남은 거리 ', en: 'left ' },

  // Activity Types
  'type.attraction': { ko: '관광', en: 'Attraction' },
  'type.shopping': { ko: '쇼핑', en: 'Shopping' },
  'type.meal': { ko: '식사', en: 'Meal' },
  'type.transport': { ko: '이동', en: 'Transport' },
  'type.free': { ko: '자유', en: 'Free' },

  // Activity Card
  'activity.booked': { ko: '예약완료', en: 'Booked' },
  'activity.viewMap': { ko: '길찾기', en: 'Navigate' },
  'activity.edit': { ko: '일정 수정', en: 'Edit' },
  'activity.moreActions': { ko: '더보기', en: 'More actions' },
  'activity.delete': { ko: '일정 삭제', en: 'Delete' },
  'activity.deleteConfirm': { ko: '일정을 삭제하시겠습니까?', en: 'Delete this activity?' },
  'activity.cancel': { ko: '취소', en: 'Cancel' },
  'activity.done': { ko: '완료', en: 'Done' },
  'activity.skipped': { ko: '스킵', en: 'Skipped' },
  'activity.markDone': { ko: '완료 표시', en: 'Mark done' },
  'activity.markSkipped': { ko: '스킵 표시', en: 'Mark skipped' },
  'activity.undoDone': { ko: '완료 취소', en: 'Undo done' },
  'activity.undoSkipped': { ko: '스킵 취소', en: 'Undo skip' },
  'activity.noLocation': { ko: '위치 없음', en: 'No location' },
  'activity.addLocation': { ko: '위치 추가', en: 'Add location' },
  'activity.navigate': { ko: '길찾기', en: 'Navigate' },

  // Booking Modal
  'booking.title': { ko: '예약 & 바우처 관리', en: 'Booking & Voucher' },
  'booking.confirmNumber': { ko: '예약 번호', en: 'Confirmation #' },
  'booking.confirmPlaceholder': { ko: '예약 확인 번호', en: 'Confirmation number' },
  'booking.provider': { ko: '예약처', en: 'Provider' },
  'booking.providerPlaceholder': { ko: '예약한 곳 (예: GetYourGuide, Tiqets)', en: 'Booking provider (e.g. GetYourGuide)' },
  'booking.date': { ko: '예약 날짜', en: 'Booking Date' },
  'booking.voucherUrl': { ko: '바우처 URL', en: 'Voucher URL' },
  'booking.voucherFile': { ko: '바우처 파일', en: 'Voucher File' },
  'booking.uploadFile': { ko: 'PDF 또는 이미지 업로드', en: 'Upload PDF or Image' },
  'booking.notes': { ko: '메모', en: 'Notes' },
  'booking.notesPlaceholder': { ko: '추가 메모 (집합 장소, 준비물 등)', en: 'Additional notes (meeting point, etc.)' },
  'booking.save': { ko: '저장하기', en: 'Save' },

  // Add/Edit Activity Modal
  'addActivity.title': { ko: '새 일정 추가', en: 'Add New Activity' },
  'editActivity.title': { ko: '일정 수정', en: 'Edit Activity' },
  'activityForm.nameKo': { ko: '한국어 이름', en: 'Korean Name' },
  'activityForm.nameEn': { ko: '영어 이름', en: 'English Name' },
  'activityForm.time': { ko: '시간', en: 'Time' },
  'activityForm.duration': { ko: '소요시간', en: 'Duration' },
  'activityForm.type': { ko: '유형', en: 'Type' },
  'activityForm.cost': { ko: '예상 비용', en: 'Estimated Cost' },
  'activityForm.lat': { ko: '위도', en: 'Latitude' },
  'activityForm.lng': { ko: '경도', en: 'Longitude' },
  'activityForm.add': { ko: '추가', en: 'Add' },
  'activityForm.save': { ko: '저장', en: 'Save' },

  // Destination Info
  'dest.guide': { ko: '가이드', en: 'Guide' },
  'dest.tips': { ko: '팁', en: 'Tips' },
  'dest.phrases': { ko: '회화', en: 'Phrases' },
  'dest.restaurants': { ko: '맛집', en: 'Restaurants' },
  'dest.transport': { ko: '교통', en: 'Transport' },
  'dest.book': { ko: '예약하기', en: 'Book Now' },

  // Transport types
  'transport.train': { ko: '기차', en: 'Train' },
  'transport.bus': { ko: '버스', en: 'Bus' },
  'transport.taxi': { ko: '택시', en: 'Taxi' },
  'transport.rental_car': { ko: '렌트카', en: 'Rental Car' },
  'transport.metro': { ko: '메트로', en: 'Metro' },

  // Weather
  'weather.weather': { ko: '날씨', en: 'Weather' },
  'weather.rainfall': { ko: '강수', en: 'Rainfall' },
  'weather.humidity': { ko: '습도', en: 'Humidity' },
  'weather.clothing': { ko: '옷차림', en: 'Clothing' },

  // Budget Page
  'budget.title': { ko: '여행 가계부', en: 'Travel Budget' },
  'budget.summary': { ko: '비용 요약', en: 'Cost Summary' },
  'budget.estimated': { ko: '예상 비용', en: 'Estimated Cost' },
  'budget.actual': { ko: '실제 지출', en: 'Actual Spent' },
  'budget.remaining': { ko: '남은 예산', en: 'Remaining' },
  'budget.totalBudget': { ko: '총 예산', en: 'Total Budget' },
  'budget.addExpense': { ko: '지출 추가', en: 'Add Expense' },
  'budget.category': { ko: '카테고리', en: 'Category' },
  'budget.amount': { ko: '금액', en: 'Amount' },
  'budget.description': { ko: '설명', en: 'Description' },
  'budget.date': { ko: '날짜', en: 'Date' },
  'budget.expenses': { ko: '지출 내역', en: 'Expense History' },
  'budget.noExpenses': { ko: '아직 지출 내역이 없습니다', en: 'No expenses yet' },
  'budget.byCategory': { ko: '카테고리별', en: 'By Category' },
  'budget.byDay': { ko: '일자별', en: 'By Day' },
  'budget.setBudget': { ko: '예산 설정', en: 'Set Budget' },

  // Expense Categories
  'cat.accommodation': { ko: '숙박', en: 'Accommodation' },
  'cat.food': { ko: '식비', en: 'Food' },
  'cat.transport': { ko: '교통', en: 'Transport' },
  'cat.attraction': { ko: '관광/입장료', en: 'Attractions' },
  'cat.shopping': { ko: '쇼핑', en: 'Shopping' },
  'cat.entertainment': { ko: '문화/엔터', en: 'Entertainment' },
  'cat.other': { ko: '기타', en: 'Other' },

  // Currency
  'currency.eur': { ko: 'EUR (유로)', en: 'EUR (Euro)' },
  'currency.krw': { ko: 'KRW (원)', en: 'KRW (Won)' },
  'currency.toggle': { ko: '통화 전환', en: 'Toggle Currency' },
  'currency.rate': { ko: '환율', en: 'Exchange Rate' },
  'currency.lastUpdated': { ko: '마지막 업데이트', en: 'Last updated' },
  'currency.refresh': { ko: '새로고침', en: 'Refresh' },

  // Settings
  'settings.language': { ko: '언어', en: 'Language' },
  'settings.currency': { ko: '통화', en: 'Currency' },

  // Navigation
  'nav.planner': { ko: '일정', en: 'Planner' },
  'nav.budget': { ko: '가계부', en: 'Budget' },
  'nav.tools': { ko: '도구', en: 'Tools' },
  'nav.settings': { ko: '설정', en: 'Settings' },
  'nav.exchange': { ko: '환율 계산기', en: 'Calculator' },
  'nav.myInfo': { ko: '내 정보', en: 'My Info' },
  'calc.title': { ko: '환율 계산기', en: 'Exchange Calculator' },
  'calc.result': { ko: '변환 결과', en: 'Result' },

  // Day CRUD
  'day.addDay': { ko: '일정 추가', en: 'Add Day' },
  'day.editDay': { ko: '일정 수정', en: 'Edit Day' },
  'day.deleteDay': { ko: '일정 삭제', en: 'Delete Day' },
  'day.deleteDayConfirm': { ko: '이 날의 모든 일정이 삭제됩니다. 계속하시겠습니까?', en: 'All activities for this day will be deleted. Continue?' },
  'day.destination': { ko: '도시', en: 'Destination' },
  'day.date': { ko: '날짜', en: 'Date' },

  // Restaurant
  'restaurant.addComment': { ko: '코멘트 작성', en: 'Add Comment' },
  'restaurant.commentPlaceholder': { ko: '맛, 분위기, 팁 등을 남겨주세요', en: 'Share your experience...' },
  'restaurant.noComments': { ko: '아직 코멘트가 없습니다', en: 'No comments yet' },

  // Trip Settings
  'settings.tripSettings': { ko: '여행 설정', en: 'Trip Settings' },
  'settings.tripName': { ko: '여행 이름', en: 'Trip Name' },
  'settings.startDate': { ko: '시작일', en: 'Start Date' },
  'settings.endDate': { ko: '종료일', en: 'End Date' },
  'settings.save': { ko: '저장', en: 'Save' },
  'settings.close': { ko: '닫기', en: 'Close' },

  // Empty States
  'day.noDay': { ko: '일정이 없습니다', en: 'No days planned' },
  'day.noDayDesc': { ko: '좌측 사이드바에서 새 일정을 추가해보세요', en: 'Add a new day from the sidebar' },
  'day.noActivities': { ko: '아직 일정이 없습니다', en: 'No activities yet' },
  'day.noActivitiesDesc': { ko: '아래 버튼으로 첫 일정을 추가해보세요', en: 'Add your first activity below' },

  // Duration presets
  'duration.30min': { ko: '30분', en: '30min' },
  'duration.1h': { ko: '1시간', en: '1h' },
  'duration.1h30': { ko: '1시간 30분', en: '1h 30m' },
  'duration.2h': { ko: '2시간', en: '2h' },
  'duration.3h': { ko: '3시간', en: '3h' },
  'duration.halfDay': { ko: '반나절', en: 'Half day' },

  // Quick Add / Map
  'addActivity.quickAdd': { ko: '빠른 추가', en: 'Quick Add' },
  'addActivity.free': { ko: '무료', en: 'Free' },
  'addActivity.map': { ko: '지도', en: 'Map' },
  'addActivity.mapKeyHint': { ko: 'VITE_GOOGLE_MAPS_KEY 설정 시 지도 사용 가능', en: 'Set VITE_GOOGLE_MAPS_KEY to enable map' },
  'addActivity.placeSearch': { ko: '장소 검색', en: 'Search place' },
  'addActivity.namePlaceholder': { ko: '예: 사그라다 파밀리아', en: 'e.g. Sagrada Familia' },
  'addActivity.notesPlaceholder': { ko: '추가 메모', en: 'Additional notes' },
  'addActivity.durationPlaceholder': { ko: '예: 1시간 30분', en: 'e.g. 1h 30m' },
  'addActivity.latPlaceholder': { ko: '예: 41.4036', en: 'e.g. 41.4036' },
  'addActivity.lngPlaceholder': { ko: '예: 2.1744', en: 'e.g. 2.1744' },

  // Budget Day label
  'budget.day': { ko: 'Day', en: 'Day' },

  // Expense delete confirm
  'budget.deleteExpense': { ko: '이 지출을 삭제하시겠습니까?', en: 'Delete this expense?' },

  // City Search
  'citySearch.placeholder': { ko: '도시 검색...', en: 'Search city...' },
  'citySearch.searching': { ko: '검색 중...', en: 'Searching...' },
  'citySearch.noResults': { ko: '결과 없음', en: 'No results' },
  'citySearch.tab.preset': { ko: '기본 도시', en: 'Preset' },
  'citySearch.tab.search': { ko: '도시 검색', en: 'Search' },

  // Immigration Schedule
  'immigration.departure': { ko: '출국', en: 'Departure' },
  'immigration.arrival': { ko: '입국', en: 'Arrival' },
  'immigration.addDeparture': { ko: '출국 일정 추가', en: 'Add Departure' },
  'immigration.addArrival': { ko: '입국 일정 추가', en: 'Add Arrival' },
  'immigration.editDeparture': { ko: '출국 일정 수정', en: 'Edit Departure' },
  'immigration.editArrival': { ko: '입국 일정 수정', en: 'Edit Arrival' },
  'immigration.airport': { ko: '공항', en: 'Airport' },
  'immigration.airline': { ko: '항공사', en: 'Airline' },
  'immigration.flightNumber': { ko: '편명', en: 'Flight No.' },
  'immigration.terminal': { ko: '터미널', en: 'Terminal' },
  'immigration.gate': { ko: '게이트', en: 'Gate' },
  'immigration.date': { ko: '날짜', en: 'Date' },
  'immigration.time': { ko: '시간', en: 'Time' },
  'immigration.confirmationNumber': { ko: '예약번호', en: 'Confirmation #' },
  'immigration.notes': { ko: '메모', en: 'Notes' },
  'immigration.delete': { ko: '삭제', en: 'Delete' },
  'immigration.deleteConfirm': { ko: '이 일정을 삭제하시겠습니까?', en: 'Delete this schedule?' },

  // Inter-city Transport
  'intercity.title': { ko: '도시 간 이동', en: 'Inter-city Transport' },
  'intercity.add': { ko: '이동 추가', en: 'Add Transport' },
  'intercity.type': { ko: '이동 수단', en: 'Transport Type' },
  'intercity.departure': { ko: '출발지', en: 'From' },
  'intercity.arrival': { ko: '도착지', en: 'To' },
  'intercity.departureTime': { ko: '출발 시간', en: 'Departure Time' },
  'intercity.arrivalTime': { ko: '도착 시간', en: 'Arrival Time' },
  'intercity.operator': { ko: '운영사', en: 'Operator' },
  'intercity.cost': { ko: '비용 (EUR)', en: 'Cost (EUR)' },
  'intercity.notes': { ko: '메모', en: 'Notes' },
  'intercity.confirmationNumber': { ko: '예약번호', en: 'Confirmation #' },
  'intercity.delete': { ko: '삭제', en: 'Delete' },
  'intercity.deleteConfirm': { ko: '이 이동편을 삭제하시겠습니까?', en: 'Delete this transport?' },
  'transport.flight': { ko: '항공편', en: 'Flight' },

  // Memo chips
  'memo.addMemo': { ko: '메모 추가', en: 'Add memo' },
  'memo.placeholder': { ko: '메모 입력...', en: 'Enter memo...' },

  // Activity expenses
  'expense.addExpense': { ko: '지출 추가', en: 'Add expense' },
  'expense.amount': { ko: '금액', en: 'Amount' },
  'expense.description': { ko: '설명', en: 'Description' },
  'expense.amountPlaceholder': { ko: '0.00', en: '0.00' },
  'expense.descPlaceholder': { ko: '지출 내역', en: 'Expense description' },
  'expense.totalSpent': { ko: '실제 지출', en: 'Spent' },

  // Timeline
  'timeline.title': { ko: '일정 타임라인', en: 'Schedule Timeline' },

  // Budget day detail
  'budget.dayDetail': { ko: '일일 상세 지출', en: 'Daily Expense Detail' },
  'budget.noActivityExpenses': { ko: '활동별 지출 내역이 없습니다', en: 'No activity expenses' },
  'budget.activityExpenses': { ko: '활동별 지출', en: 'Activity Expenses' },

  // Guide
  'guide.title': { ko: '메모장', en: 'Memo' },
  'guide.placeholder': { ko: '여행 메모, 팁, 준비물 등을 자유롭게 적어보세요...', en: 'Write travel notes, tips, packing lists...' },
  'guide.saved': { ko: '저장됨', en: 'Saved' },
  'guide.addItem': { ko: '메모 추가', en: 'Add Memo' },
  'guide.editItem': { ko: '수정', en: 'Edit' },
  'guide.deleteItem': { ko: '삭제', en: 'Delete' },
  'guide.deleteConfirm': { ko: '이 메모를 삭제하시겠습니까?', en: 'Delete this memo?' },
  'guide.titlePlaceholder': { ko: '제목 (예: 준비물, 주의사항...)', en: 'Title (e.g. Packing list, Tips...)' },
  'guide.contentPlaceholder': { ko: '내용을 입력하세요...', en: 'Enter content...' },
  'guide.noItems': { ko: '아직 메모가 없습니다', en: 'No memos yet' },
  'guide.noItemsDesc': { ko: '여행 메모, 팁, 준비물 등을 추가해보세요', en: 'Add travel notes, tips, packing lists...' },
  'guide.moveUp': { ko: '위로', en: 'Move up' },
  'guide.moveDown': { ko: '아래로', en: 'Move down' },
  'guide.cancel': { ko: '취소', en: 'Cancel' },
  'guide.save': { ko: '저장', en: 'Save' },

  // Place / Destination
  'place.addPlace': { ko: '도시 추가', en: 'Add City' },
  'place.name': { ko: '장소 이름', en: 'Place Name' },
  'place.description': { ko: '설명', en: 'Description' },
  'place.nights': { ko: '숙박 일수', en: 'Nights' },
  'place.timezone': { ko: '타임존', en: 'Timezone' },

  // Expense Owner
  'owner.shared': { ko: '공용', en: 'Shared' },
  'owner.all': { ko: '전체', en: 'All' },
  'owner.manage': { ko: '멤버 관리', en: 'Manage Members' },
  'owner.addMember': { ko: '멤버 추가', en: 'Add Member' },
  'owner.namePlaceholder': { ko: '이름 입력', en: 'Enter name' },
  'owner.colorLabel': { ko: '색상', en: 'Color' },
  'owner.cannotDeleteShared': { ko: '공용은 삭제할 수 없습니다', en: 'Cannot delete shared' },
  'owner.deleteConfirm': { ko: '이 멤버를 삭제하시겠습니까? 관련 지출은 공용으로 변경됩니다.', en: 'Delete this member? Related expenses will be reassigned to Shared.' },

  // Settlement
  'settlement.title': { ko: '정산 요약', en: 'Settlement' },
  'settlement.personal': { ko: '개인 지출', en: 'Personal' },
  'settlement.sharedEach': { ko: '공용 (각)', en: 'Shared (each)' },
  'settlement.owes': { ko: '정산 필요', en: 'owes' },
  'settlement.settled': { ko: '정산 완료', en: 'Settled' },

  // Camera OCR / Currency Calculator
  'camera.title': { ko: '환율 계산기', en: 'Currency Calc' },
  'camera.tabCalc': { ko: '계산기', en: 'Calculator' },
  'camera.tabOcr': { ko: 'OCR 촬영', en: 'OCR Scan' },
  'camera.capture': { ko: '촬영', en: 'Capture' },
  'camera.retake': { ko: '다시 촬영', en: 'Retake' },
  'camera.detecting': { ko: '금액 인식 중...', en: 'Detecting...' },
  'camera.detected': { ko: '인식된 금액', en: 'Detected Amount' },
  'camera.noAmount': { ko: '금액을 인식하지 못했습니다', en: 'No amount detected' },
  'camera.manualInput': { ko: '직접 입력', en: 'Manual input' },
  'camera.addExpense': { ko: '지출로 추가', en: 'Add as Expense' },
  'camera.notSupported': { ko: '카메라를 사용할 수 없습니다', en: 'Camera not supported' },
  'camera.permissionDenied': { ko: '카메라 권한이 거부되었습니다', en: 'Camera permission denied' },

  // Navigation
  'nav.prevDay': { ko: '이전', en: 'Prev' },
  'nav.nextDay': { ko: '다음', en: 'Next' },

  // Features
  'feature.export': { ko: '데이터 내보내기', en: 'Export Data' },
  'feature.import': { ko: '데이터 가져오기', en: 'Import Data' },
  'feature.exportSuccess': { ko: '내보내기 완료!', en: 'Export complete!' },
  'feature.importSuccess': { ko: '가져오기 완료!', en: 'Import complete!' },
  'feature.importError': { ko: '잘못된 파일입니다', en: 'Invalid file' },
  'feature.duplicate': { ko: '복제', en: 'Duplicate' },
  'feature.duplicateDay': { ko: '날짜 복제', en: 'Duplicate Day' },
  'feature.search': { ko: '검색', en: 'Search' },
  'feature.searchPlaceholder': { ko: '일정, 장소 검색...', en: 'Search activities...' },
  'feature.noResults': { ko: '검색 결과 없음', en: 'No results' },
  'feature.timeConflict': { ko: '⚠ 시간이 겹치는 일정이 있습니다', en: '⚠ Time conflict detected' },
  'feature.budgetAlert': { ko: '예산 초과!', en: 'Over budget!' },
  'feature.budgetWarn': { ko: '예산의 90%를 사용했습니다', en: '90% of budget used' },
  'feature.quickAdd': { ko: '추천 일정', en: 'Suggested' },
  'feature.quickAddDesc': { ko: '이 도시의 추천 장소에서 추가', en: 'Add from destination guide' },
  'feature.csvExport': { ko: '지출 CSV 내보내기', en: 'Export Expenses CSV' },

  // Activity Detail Modal
  'detail.title': { ko: '일정 상세', en: 'Activity Detail' },
  'detail.memos': { ko: '메모', en: 'Memos' },
  'detail.expenses': { ko: '지출 내역', en: 'Expenses' },
  'detail.media': { ko: '사진/동영상', en: 'Media' },
  'detail.addPhoto': { ko: '사진 추가', en: 'Add Photo' },
  'detail.addVideo': { ko: '동영상 추가', en: 'Add Video' },
  'detail.noMedia': { ko: '아직 사진/동영상이 없습니다', en: 'No media yet' },
  'detail.storageLimitWarning': { ko: '저장 공간 한도에 가까워지고 있습니다 (3MB)', en: 'Approaching storage limit (3MB)' },
  'detail.uploadMedia': { ko: '파일 선택', en: 'Choose File' },
  'detail.capturePhoto': { ko: '사진 촬영', en: 'Take Photo' },

  // Multi-trip
  'trips.title': { ko: '여행 목록', en: 'My Trips' },
  'trips.create': { ko: '새 여행 만들기', en: 'Create Trip' },
  'trips.switch': { ko: '여행 전환', en: 'Switch Trip' },
  'trips.delete': { ko: '여행 삭제', en: 'Delete Trip' },
  'trips.deleteConfirm': { ko: '이 여행을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.', en: 'Delete this trip? All data will be removed.' },
  'trips.duplicate': { ko: '여행 복제', en: 'Duplicate Trip' },
  'trips.edit': { ko: '여행 수정', en: 'Edit Trip' },
  'trips.noTrips': { ko: '여행이 없습니다', en: 'No trips yet' },
  'trips.current': { ko: '현재 여행', en: 'Current Trip' },
  'trips.cannotDeleteLast': { ko: '마지막 여행은 삭제할 수 없습니다', en: 'Cannot delete the last trip' },
  'trips.tripName': { ko: '여행 이름', en: 'Trip Name' },
  'trips.emoji': { ko: '이모지', en: 'Emoji' },
  'trips.budget': { ko: '예산', en: 'Budget' },
  'trips.progress': { ko: '진행률', en: 'Progress' },
  'trips.days': { ko: '일', en: 'days' },
  'trips.activities': { ko: '개 일정', en: 'activities' },
  'trips.manageTrips': { ko: '여행 관리', en: 'Manage Trips' },
  'trips.backToPlanner': { ko: '일정으로 돌아가기', en: 'Back to Planner' },
  'trips.createdAt': { ko: '생성일', en: 'Created' },

  // Place
  'day.addPlace': { ko: '장소 추가', en: 'Add Place' },
  'day.addActivityDesc': { ko: '시간·비용 포함', en: 'With time & cost' },
  'day.addPlaceDesc': { ko: '위치만 등록', en: 'Location only' },
  'addPlace.title': { ko: '장소 추가', en: 'Add Place' },

  // Accommodation
  'accommodation.title': { ko: '숙소', en: 'Accommodation' },
  'accommodation.checkIn': { ko: '체크인', en: 'Check-in' },
  'accommodation.checkOut': { ko: '체크아웃', en: 'Check-out' },

  // Sidebar hardcoded
  'sidebar.noActivities': { ko: '일정 없음', en: 'No activities' },
  'sidebar.completed': { ko: '완료', en: 'Done' },
  'sidebar.count': { ko: '개', en: '' },
  'sidebar.daysAndActivities': { ko: '일 · {acts}개 일정', en: 'days · {acts} activities' },
  'sidebar.close': { ko: '닫기', en: 'Close' },

  // Day navigation
  'day.prevDay': { ko: '이전 날', en: 'Previous day' },
  'day.nextDay': { ko: '다음 날', en: 'Next day' },
  'day.insertHere': { ko: '여기에 추가', en: 'Insert here' },

  // Flight
  'flight.departure': { ko: '출발', en: 'Departure' },
  'flight.arrival': { ko: '도착', en: 'Arrival' },
  'flight.deleteConfirm': { ko: '삭제하시겠습니까?', en: 'Delete?' },

  // Budget comparison
  'budget.overBudget': { ko: '초과', en: 'over' },
  'budget.saved': { ko: '절약', en: 'saved' },

  // Trip count
  'trips.tripCount': { ko: '개의 여행', en: 'trips' },

  // Accommodation form (DayFormModal)
  'accommodation.autoApply': { ko: '같은 도시 숙소 자동 적용', en: 'Auto-applied from same city' },
  'accommodation.addInfo': { ko: '숙소 정보 추가', en: 'Add accommodation info' },
  'accommodation.info': { ko: '숙소 정보', en: 'Accommodation Info' },
  'accommodation.searchPlaceholder': { ko: '숙소 검색 (호텔, 에어비앤비...)', en: 'Search accommodation (hotel, Airbnb...)' },
  'accommodation.namePlaceholder': { ko: '숙소 이름 (예: Hotel Arts Barcelona)', en: 'Accommodation name (e.g. Hotel Arts Barcelona)' },
  'accommodation.addressPlaceholder': { ko: '주소', en: 'Address' },
  'accommodation.costPerNight': { ko: '1박 비용', en: 'Cost per night' },
  'accommodation.confirmationNumber': { ko: '예약 번호', en: 'Confirmation #' },
  'accommodation.optional': { ko: '선택', en: 'Optional' },
  'accommodation.notesPlaceholder': { ko: '메모 (와이파이 비번, 주차 정보 등)', en: 'Notes (wifi password, parking info, etc.)' },
  'accommodation.directions': { ko: '길찾기', en: 'Directions' },
  'accommodation.restHere': { ko: '숙소에서 쉬기', en: 'Rest at hotel' },
  'accommodation.edit': { ko: '숙소 수정', en: 'Edit Accommodation' },
  'accommodation.delete': { ko: '숙소 삭제', en: 'Delete Accommodation' },
  'accommodation.add': { ko: '숙소 추가', en: 'Add Accommodation' },
  'accommodation.deleteConfirm': { ko: '숙소 정보를 삭제하시겠습니까?', en: 'Delete accommodation info?' },
  'accommodation.save': { ko: '저장', en: 'Save' },
  'accommodation.tags': { ko: '특이사항', en: 'Tags' },
  'accommodation.tagPlaceholder': { ko: '특이사항 입력 후 Enter (예: Wi-Fi, 조식 포함)', en: 'Enter tag and press Enter' },
  'accommodation.addMore': { ko: '숙소 추가', en: 'Add Accommodation' },
  'form.notesPlaceholder': { ko: '메모를 입력하세요...', en: 'Enter notes...' },

  // Flight form (FlightFormModal)
  'flight.editTitle': { ko: '항공편 수정', en: 'Edit Flight' },
  'flight.addTitle': { ko: '항공편 추가', en: 'Add Flight' },
  'flight.airline': { ko: '항공사', en: 'Airline' },
  'flight.airlinePlaceholder': { ko: '예: 대한항공', en: 'e.g. Korean Air' },
  'flight.flightNumber': { ko: '편명', en: 'Flight #' },
  'flight.flightNumberPlaceholder': { ko: '예: KE913', en: 'e.g. KE913' },
  'flight.departureCity': { ko: '출발지', en: 'From' },
  'flight.departureCityPlaceholder': { ko: '예: ICN 인천', en: 'e.g. ICN Incheon' },
  'flight.arrivalCity': { ko: '도착지', en: 'To' },
  'flight.arrivalCityPlaceholder': { ko: '예: BCN 바르셀로나', en: 'e.g. BCN Barcelona' },
  'flight.departureTime': { ko: '출발 시간', en: 'Departure time' },
  'flight.arrivalTime': { ko: '도착 시간', en: 'Arrival time' },
  'flight.confirmationNumber': { ko: '예약 번호 (선택)', en: 'Confirmation # (optional)' },
  'flight.confirmationPlaceholder': { ko: '예약 확인 번호', en: 'Confirmation number' },
  'flight.notes': { ko: '메모 (선택)', en: 'Notes (optional)' },
  'flight.notesPlaceholder': { ko: '터미널, 좌석 번호 등', en: 'Terminal, seat number, etc.' },

  // Destination form (DestinationFormModal)
  'place.citySearch': { ko: '도시 검색', en: 'City Search' },
  'place.citySearchPlaceholder': { ko: '도시 이름을 검색하세요...', en: 'Search for a city...' },
  'place.namePlaceholder': { ko: '예: 세비야, 톨레도, 발렌시아...', en: 'e.g. Seville, Toledo, Valencia...' },
  'place.descriptionPlaceholder': { ko: '장소에 대한 설명...', en: 'Description of the place...' },

  // Trip create
  'trips.namePlaceholder': { ko: '예: 이탈리아 여행 2026', en: 'e.g. Italy Trip 2026' },

  // Settings
  'settings.dataManagement': { ko: '데이터 관리', en: 'Data Management' },

  // Camera OCR
  'camera.ocrResult': { ko: 'OCR 인식 결과', en: 'OCR Result' },

  // Auth
  'auth.login': { ko: 'Google 로그인', en: 'Sign in with Google' },
  'auth.logout': { ko: '로그아웃', en: 'Log out' },
  'auth.editProfile': { ko: '프로필 수정', en: 'Edit Profile' },
  'auth.nickname': { ko: '닉네임', en: 'Nickname' },

  // Login page
  'login.subtitle': { ko: '완벽한 여행을 위한 올인원 플래너', en: 'All-in-one planner for your perfect trip' },
  'login.feature1Title': { ko: '스마트 일정 관리', en: 'Smart Itinerary' },
  'login.feature1Desc': { ko: '드래그 앤 드롭으로 일정을 쉽게 관리하세요', en: 'Drag & drop to manage your schedule easily' },
  'login.feature2Title': { ko: '여행 가계부', en: 'Travel Budget' },
  'login.feature2Desc': { ko: '실시간 환율로 지출을 추적하세요', en: 'Track expenses with live exchange rates' },
  'login.feature3Title': { ko: '클라우드 동기화', en: 'Cloud Sync' },
  'login.feature3Desc': { ko: '어디서든 여행 계획에 접근하세요', en: 'Access your plans from anywhere' },

  // Theme
  'theme.title': { ko: '테마', en: 'Theme' },
  'theme.cloudDancer': { ko: 'Cloud Dancer', en: 'Cloud Dancer' },
  'theme.cloudDancerDesc': { ko: '2026 팬톤 올해의 색', en: '2026 Pantone COTY' },
  'theme.classicSpain': { ko: 'Classic Spain', en: 'Classic Spain' },
  'theme.classicSpainDesc': { ko: '열정의 빨강과 금색', en: 'Passionate red & gold' },
  'theme.mochaMousse': { ko: 'Mocha Mousse', en: 'Mocha Mousse' },
  'theme.mochaMousseDesc': { ko: '2025 팬톤 올해의 색', en: '2025 Pantone COTY' },
  'theme.scrollToTop': { ko: '맨 위로', en: 'Top' },

  // Sharing
  'sharing.members': { ko: '멤버', en: 'Members' },
  'sharing.invite': { ko: '초대', en: 'Invite' },
  'sharing.inviteByEmail': { ko: '이메일로 초대', en: 'Invite by email' },
  'sharing.emailPlaceholder': { ko: '이메일 주소 입력', en: 'Enter email address' },
  'sharing.role': { ko: '역할', en: 'Role' },
  'sharing.owner': { ko: '소유자', en: 'Owner' },
  'sharing.editor': { ko: '편집자', en: 'Editor' },
  'sharing.viewer': { ko: '뷰어', en: 'Viewer' },
  'sharing.remove': { ko: '제거', en: 'Remove' },
  'sharing.removeConfirm': { ko: '이 멤버를 제거하시겠습니까?', en: 'Remove this member?' },
  'sharing.inviteSent': { ko: '초대를 보냈습니다', en: 'Invitation sent' },
  'sharing.invitations': { ko: '초대', en: 'Invitations' },
  'sharing.pendingInvitations': { ko: '대기 중인 초대', en: 'Pending Invitations' },
  'sharing.noInvitations': { ko: '대기 중인 초대가 없습니다', en: 'No pending invitations' },
  'sharing.accept': { ko: '수락', en: 'Accept' },
  'sharing.decline': { ko: '거절', en: 'Decline' },
  'sharing.invitedBy': { ko: '초대한 사람', en: 'Invited by' },
  'sharing.expiresAt': { ko: '만료', en: 'Expires' },
  'sharing.shared': { ko: '공유됨', en: 'Shared' },
  'sharing.you': { ko: '나', en: 'You' },
  'sharing.leaveTrip': { ko: '여행 나가기', en: 'Leave trip' },
  'sharing.leaveConfirm': { ko: '이 여행에서 나가시겠습니까?', en: 'Leave this trip?' },

  // Invite accept page
  'invite.title': { ko: '여행 초대', en: 'Trip Invitation' },
  'invite.invitedBy': { ko: '님의 초대', en: 'invited you' },
  'invite.tripName': { ko: '여행', en: 'Trip' },
  'invite.role': { ko: '역할', en: 'Role' },
  'invite.roleEditor': { ko: '편집자', en: 'Editor' },
  'invite.roleViewer': { ko: '뷰어', en: 'Viewer' },
  'invite.loginToAccept': { ko: 'Google 로그인하여 수락', en: 'Login with Google to Accept' },
  'invite.accepting': { ko: '초대 수락 중...', en: 'Accepting invitation...' },
  'invite.accepted': { ko: '초대를 수락했습니다!', en: 'Invitation accepted!' },
  'invite.redirecting': { ko: '여행 페이지로 이동합니다...', en: 'Redirecting to your trip...' },
  'invite.expired': { ko: '초대가 만료되었습니다', en: 'This invitation has expired' },
  'invite.expiredDesc': { ko: '초대한 분에게 다시 요청해주세요', en: 'Please ask the inviter to send a new invitation' },
  'invite.notFound': { ko: '초대를 찾을 수 없습니다', en: 'Invitation not found' },
  'invite.notFoundDesc': { ko: '유효하지 않은 링크입니다', en: 'This link is not valid' },
  'invite.alreadyDone': { ko: '이미 처리된 초대입니다', en: 'This invitation has already been processed' },
  'invite.emailMismatch': { ko: '로그인한 이메일이 초대된 이메일과 다릅니다', en: 'Your email doesn\'t match the invitation' },
  'invite.emailMismatchDesc': { ko: '다른 계정으로 로그인해주세요', en: 'Please log in with the correct account' },
  'invite.goToTrips': { ko: '여행 목록으로', en: 'Go to Trips' },
  'invite.logoutAndRetry': { ko: '로그아웃 후 다시 시도', en: 'Log out and try again' },
  'invite.expiresAt': { ko: '만료일', en: 'Expires' },
} as const;

export type TranslationKey = keyof typeof translations;

export const languageNames: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
};
