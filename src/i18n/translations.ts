export type Language = 'ko' | 'en' | 'es';

export const translations = {
  // App Header
  'app.days': { ko: '일', en: 'days', es: 'días' },
  'app.route': { ko: '루트', en: 'Route', es: 'Ruta' },

  // Sidebar
  'sidebar.schedule': { ko: '일정표', en: 'Schedule', es: 'Itinerario' },
  'sidebar.totalCost': { ko: '전체 예상 비용', en: 'Total Estimated Cost', es: 'Costo Total Estimado' },
  'sidebar.budget': { ko: '가계부', en: 'Budget', es: 'Presupuesto' },

  // Day Content
  'day.day': { ko: 'Day', en: 'Day', es: 'Día' },
  'day.localTime': { ko: '현지 시간', en: 'Local Time', es: 'Hora Local' },
  'day.gpsActive': { ko: 'GPS 활성', en: 'GPS Active', es: 'GPS Activo' },
  'day.schedule': { ko: '개 일정', en: ' activities', es: ' actividades' },
  'day.todaySchedule': { ko: '오늘의 일정', en: "Today's Schedule", es: 'Horario de Hoy' },
  'day.dragToReorder': { ko: '드래그로 순서 변경', en: 'Drag to reorder', es: 'Arrastrar para reordenar' },
  'day.reorderMode': { ko: '순서 변경', en: 'Reorder', es: 'Reordenar' },
  'day.reorderDone': { ko: '완료', en: 'Done', es: 'Listo' },
  'day.addActivity': { ko: '일정 추가', en: 'Add Activity', es: 'Agregar Actividad' },
  'day.today': { ko: '오늘', en: 'Today', es: 'Hoy' },
  'day.total': { ko: '전체', en: 'Total', es: 'Total' },
  'day.todayRoute': { ko: '오늘의 루트', en: "Today's Route", es: 'Ruta de Hoy' },
  'day.showMapWithKey': { ko: 'VITE_GOOGLE_MAPS_KEY 설정 시 지도 표시', en: 'Set VITE_GOOGLE_MAPS_KEY to show map', es: 'Configure VITE_GOOGLE_MAPS_KEY para mostrar mapa' },
  'day.currentLocation': { ko: '현재 위치', en: 'Current Location', es: 'Ubicación Actual' },
  'day.enableGps': { ko: 'GPS 켜기', en: 'Enable GPS', es: 'Activar GPS' },
  'day.locating': { ko: '위치 찾는 중...', en: 'Locating...', es: 'Localizando...' },
  'day.notes': { ko: '메모', en: 'Notes', es: 'Notas' },
  'day.walkAbout': { ko: '도보 약 ', en: '~', es: '~' },
  'day.minutes': { ko: '분', en: 'min', es: 'min' },
  'day.hours': { ko: '시간', en: 'h', es: 'h' },
  'day.remaining': { ko: '남은 거리 ', en: 'left ', es: 'restante ' },

  // Activity Types
  'type.attraction': { ko: '관광', en: 'Attraction', es: 'Atracción' },
  'type.shopping': { ko: '쇼핑', en: 'Shopping', es: 'Compras' },
  'type.meal': { ko: '식사', en: 'Meal', es: 'Comida' },
  'type.transport': { ko: '이동', en: 'Transport', es: 'Transporte' },
  'type.free': { ko: '자유', en: 'Free', es: 'Libre' },

  // Activity Card
  'activity.booked': { ko: '예약완료', en: 'Booked', es: 'Reservado' },
  'activity.viewMap': { ko: '길찾기', en: 'Navigate', es: 'Navegar' },
  'activity.edit': { ko: '일정 수정', en: 'Edit', es: 'Editar' },
  'activity.moreActions': { ko: '더보기', en: 'More actions', es: 'Más acciones' },
  'activity.delete': { ko: '일정 삭제', en: 'Delete', es: 'Eliminar' },
  'activity.deleteConfirm': { ko: '일정을 삭제하시겠습니까?', en: 'Delete this activity?', es: '¿Eliminar esta actividad?' },
  'activity.cancel': { ko: '취소', en: 'Cancel', es: 'Cancelar' },
  'activity.done': { ko: '완료', en: 'Done', es: 'Hecho' },
  'activity.skipped': { ko: '스킵', en: 'Skipped', es: 'Omitido' },
  'activity.markDone': { ko: '완료 표시', en: 'Mark done', es: 'Marcar hecho' },
  'activity.markSkipped': { ko: '스킵 표시', en: 'Mark skipped', es: 'Marcar omitido' },
  'activity.undoDone': { ko: '완료 취소', en: 'Undo done', es: 'Deshacer hecho' },
  'activity.undoSkipped': { ko: '스킵 취소', en: 'Undo skip', es: 'Deshacer omitido' },
  'activity.noLocation': { ko: '위치 없음', en: 'No location', es: 'Sin ubicación' },
  'activity.addLocation': { ko: '위치 추가', en: 'Add location', es: 'Añadir ubicación' },
  'activity.navigate': { ko: '길찾기', en: 'Navigate', es: 'Navegar' },

  // Booking Modal
  'booking.title': { ko: '예약 & 바우처 관리', en: 'Booking & Voucher', es: 'Reserva y Voucher' },
  'booking.confirmNumber': { ko: '예약 번호', en: 'Confirmation #', es: 'N° Confirmación' },
  'booking.confirmPlaceholder': { ko: '예약 확인 번호', en: 'Confirmation number', es: 'Número de confirmación' },
  'booking.provider': { ko: '예약처', en: 'Provider', es: 'Proveedor' },
  'booking.providerPlaceholder': { ko: '예약한 곳 (예: GetYourGuide, Tiqets)', en: 'Booking provider (e.g. GetYourGuide)', es: 'Proveedor (ej: GetYourGuide)' },
  'booking.date': { ko: '예약 날짜', en: 'Booking Date', es: 'Fecha de Reserva' },
  'booking.voucherUrl': { ko: '바우처 URL', en: 'Voucher URL', es: 'URL del Voucher' },
  'booking.voucherFile': { ko: '바우처 파일', en: 'Voucher File', es: 'Archivo Voucher' },
  'booking.uploadFile': { ko: 'PDF 또는 이미지 업로드', en: 'Upload PDF or Image', es: 'Subir PDF o Imagen' },
  'booking.notes': { ko: '메모', en: 'Notes', es: 'Notas' },
  'booking.notesPlaceholder': { ko: '추가 메모 (집합 장소, 준비물 등)', en: 'Additional notes (meeting point, etc.)', es: 'Notas adicionales (punto de encuentro, etc.)' },
  'booking.save': { ko: '저장하기', en: 'Save', es: 'Guardar' },

  // Add/Edit Activity Modal
  'addActivity.title': { ko: '새 일정 추가', en: 'Add New Activity', es: 'Agregar Actividad' },
  'editActivity.title': { ko: '일정 수정', en: 'Edit Activity', es: 'Editar Actividad' },
  'activityForm.nameKo': { ko: '한국어 이름', en: 'Korean Name', es: 'Nombre en Coreano' },
  'activityForm.nameEn': { ko: '영어 이름', en: 'English Name', es: 'Nombre en Inglés' },
  'activityForm.time': { ko: '시간', en: 'Time', es: 'Hora' },
  'activityForm.duration': { ko: '소요시간', en: 'Duration', es: 'Duración' },
  'activityForm.type': { ko: '유형', en: 'Type', es: 'Tipo' },
  'activityForm.cost': { ko: '예상 비용', en: 'Estimated Cost', es: 'Costo Estimado' },
  'activityForm.lat': { ko: '위도', en: 'Latitude', es: 'Latitud' },
  'activityForm.lng': { ko: '경도', en: 'Longitude', es: 'Longitud' },
  'activityForm.add': { ko: '추가', en: 'Add', es: 'Agregar' },
  'activityForm.save': { ko: '저장', en: 'Save', es: 'Guardar' },

  // Destination Info
  'dest.guide': { ko: '가이드', en: 'Guide', es: 'Guía' },
  'dest.tips': { ko: '팁', en: 'Tips', es: 'Consejos' },
  'dest.phrases': { ko: '회화', en: 'Phrases', es: 'Frases' },
  'dest.restaurants': { ko: '맛집', en: 'Restaurants', es: 'Restaurantes' },
  'dest.transport': { ko: '교통', en: 'Transport', es: 'Transporte' },
  'dest.book': { ko: '예약하기', en: 'Book Now', es: 'Reservar' },

  // Transport types
  'transport.train': { ko: '기차', en: 'Train', es: 'Tren' },
  'transport.bus': { ko: '버스', en: 'Bus', es: 'Autobús' },
  'transport.taxi': { ko: '택시', en: 'Taxi', es: 'Taxi' },
  'transport.rental_car': { ko: '렌트카', en: 'Rental Car', es: 'Coche de Alquiler' },
  'transport.metro': { ko: '메트로', en: 'Metro', es: 'Metro' },

  // Weather
  'weather.weather': { ko: '날씨', en: 'Weather', es: 'Clima' },
  'weather.rainfall': { ko: '강수', en: 'Rainfall', es: 'Lluvia' },

  // Budget Page
  'budget.title': { ko: '여행 가계부', en: 'Travel Budget', es: 'Presupuesto de Viaje' },
  'budget.summary': { ko: '비용 요약', en: 'Cost Summary', es: 'Resumen de Costos' },
  'budget.estimated': { ko: '예상 비용', en: 'Estimated Cost', es: 'Costo Estimado' },
  'budget.actual': { ko: '실제 지출', en: 'Actual Spent', es: 'Gasto Real' },
  'budget.remaining': { ko: '남은 예산', en: 'Remaining', es: 'Restante' },
  'budget.totalBudget': { ko: '총 예산', en: 'Total Budget', es: 'Presupuesto Total' },
  'budget.addExpense': { ko: '지출 추가', en: 'Add Expense', es: 'Agregar Gasto' },
  'budget.category': { ko: '카테고리', en: 'Category', es: 'Categoría' },
  'budget.amount': { ko: '금액', en: 'Amount', es: 'Monto' },
  'budget.description': { ko: '설명', en: 'Description', es: 'Descripción' },
  'budget.date': { ko: '날짜', en: 'Date', es: 'Fecha' },
  'budget.expenses': { ko: '지출 내역', en: 'Expense History', es: 'Historial de Gastos' },
  'budget.noExpenses': { ko: '아직 지출 내역이 없습니다', en: 'No expenses yet', es: 'Sin gastos aún' },
  'budget.byCategory': { ko: '카테고리별', en: 'By Category', es: 'Por Categoría' },
  'budget.byDay': { ko: '일자별', en: 'By Day', es: 'Por Día' },
  'budget.setBudget': { ko: '예산 설정', en: 'Set Budget', es: 'Establecer Presupuesto' },

  // Expense Categories
  'cat.accommodation': { ko: '숙박', en: 'Accommodation', es: 'Alojamiento' },
  'cat.food': { ko: '식비', en: 'Food', es: 'Comida' },
  'cat.transport': { ko: '교통', en: 'Transport', es: 'Transporte' },
  'cat.attraction': { ko: '관광/입장료', en: 'Attractions', es: 'Atracciones' },
  'cat.shopping': { ko: '쇼핑', en: 'Shopping', es: 'Compras' },
  'cat.entertainment': { ko: '문화/엔터', en: 'Entertainment', es: 'Entretenimiento' },
  'cat.other': { ko: '기타', en: 'Other', es: 'Otros' },

  // Currency
  'currency.eur': { ko: 'EUR (유로)', en: 'EUR (Euro)', es: 'EUR (Euro)' },
  'currency.krw': { ko: 'KRW (원)', en: 'KRW (Won)', es: 'KRW (Won)' },
  'currency.toggle': { ko: '통화 전환', en: 'Toggle Currency', es: 'Cambiar Moneda' },
  'currency.rate': { ko: '환율', en: 'Exchange Rate', es: 'Tipo de Cambio' },
  'currency.lastUpdated': { ko: '마지막 업데이트', en: 'Last updated', es: 'Última actualización' },
  'currency.refresh': { ko: '새로고침', en: 'Refresh', es: 'Actualizar' },

  // Settings
  'settings.language': { ko: '언어', en: 'Language', es: 'Idioma' },
  'settings.currency': { ko: '통화', en: 'Currency', es: 'Moneda' },

  // Navigation
  'nav.planner': { ko: '일정', en: 'Planner', es: 'Planificador' },
  'nav.budget': { ko: '가계부', en: 'Budget', es: 'Presupuesto' },
  'nav.tools': { ko: '도구', en: 'Tools', es: 'Herramientas' },
  'nav.settings': { ko: '설정', en: 'Settings', es: 'Config' },

  // Day CRUD
  'day.addDay': { ko: '일정 추가', en: 'Add Day', es: 'Agregar Día' },
  'day.editDay': { ko: '일정 수정', en: 'Edit Day', es: 'Editar Día' },
  'day.deleteDay': { ko: '일정 삭제', en: 'Delete Day', es: 'Eliminar Día' },
  'day.deleteDayConfirm': { ko: '이 날의 모든 일정이 삭제됩니다. 계속하시겠습니까?', en: 'All activities for this day will be deleted. Continue?', es: '¿Se eliminarán todas las actividades de este día. ¿Continuar?' },
  'day.destination': { ko: '도시', en: 'Destination', es: 'Destino' },
  'day.date': { ko: '날짜', en: 'Date', es: 'Fecha' },

  // Restaurant
  'restaurant.addComment': { ko: '코멘트 작성', en: 'Add Comment', es: 'Agregar Comentario' },
  'restaurant.commentPlaceholder': { ko: '맛, 분위기, 팁 등을 남겨주세요', en: 'Share your experience...', es: 'Comparte tu experiencia...' },
  'restaurant.noComments': { ko: '아직 코멘트가 없습니다', en: 'No comments yet', es: 'Sin comentarios aún' },

  // Trip Settings
  'settings.tripSettings': { ko: '여행 설정', en: 'Trip Settings', es: 'Configuración del Viaje' },
  'settings.tripName': { ko: '여행 이름', en: 'Trip Name', es: 'Nombre del Viaje' },
  'settings.startDate': { ko: '시작일', en: 'Start Date', es: 'Fecha de Inicio' },
  'settings.endDate': { ko: '종료일', en: 'End Date', es: 'Fecha de Fin' },
  'settings.save': { ko: '저장', en: 'Save', es: 'Guardar' },
  'settings.close': { ko: '닫기', en: 'Close', es: 'Cerrar' },

  // Empty States
  'day.noDay': { ko: '일정이 없습니다', en: 'No days planned', es: 'Sin días planificados' },
  'day.noDayDesc': { ko: '좌측 사이드바에서 새 일정을 추가해보세요', en: 'Add a new day from the sidebar', es: 'Agrega un nuevo día desde la barra lateral' },
  'day.noActivities': { ko: '아직 일정이 없습니다', en: 'No activities yet', es: 'Sin actividades aún' },
  'day.noActivitiesDesc': { ko: '아래 버튼으로 첫 일정을 추가해보세요', en: 'Add your first activity below', es: 'Agrega tu primera actividad abajo' },

  // Duration presets
  'duration.30min': { ko: '30분', en: '30min', es: '30min' },
  'duration.1h': { ko: '1시간', en: '1h', es: '1h' },
  'duration.1h30': { ko: '1시간 30분', en: '1h 30m', es: '1h 30m' },
  'duration.2h': { ko: '2시간', en: '2h', es: '2h' },
  'duration.3h': { ko: '3시간', en: '3h', es: '3h' },
  'duration.halfDay': { ko: '반나절', en: 'Half day', es: 'Medio día' },

  // Quick Add / Map
  'addActivity.quickAdd': { ko: '빠른 추가', en: 'Quick Add', es: 'Agregar Rápido' },
  'addActivity.free': { ko: '무료', en: 'Free', es: 'Gratis' },
  'addActivity.map': { ko: '지도', en: 'Map', es: 'Mapa' },
  'addActivity.mapKeyHint': { ko: 'VITE_GOOGLE_MAPS_KEY 설정 시 지도 사용 가능', en: 'Set VITE_GOOGLE_MAPS_KEY to enable map', es: 'Configure VITE_GOOGLE_MAPS_KEY para habilitar mapa' },
  'addActivity.placeSearch': { ko: '장소 검색', en: 'Search place', es: 'Buscar lugar' },
  'addActivity.namePlaceholder': { ko: '예: 사그라다 파밀리아', en: 'e.g. Sagrada Familia', es: 'ej. Sagrada Familia' },
  'addActivity.notesPlaceholder': { ko: '추가 메모', en: 'Additional notes', es: 'Notas adicionales' },
  'addActivity.durationPlaceholder': { ko: '예: 1시간 30분', en: 'e.g. 1h 30m', es: 'ej. 1h 30m' },
  'addActivity.latPlaceholder': { ko: '예: 41.4036', en: 'e.g. 41.4036', es: 'ej. 41.4036' },
  'addActivity.lngPlaceholder': { ko: '예: 2.1744', en: 'e.g. 2.1744', es: 'ej. 2.1744' },

  // Budget Day label
  'budget.day': { ko: 'Day', en: 'Day', es: 'Día' },

  // Expense delete confirm
  'budget.deleteExpense': { ko: '이 지출을 삭제하시겠습니까?', en: 'Delete this expense?', es: '¿Eliminar este gasto?' },

  // City Search
  'citySearch.placeholder': { ko: '도시 검색...', en: 'Search city...', es: 'Buscar ciudad...' },
  'citySearch.searching': { ko: '검색 중...', en: 'Searching...', es: 'Buscando...' },
  'citySearch.noResults': { ko: '결과 없음', en: 'No results', es: 'Sin resultados' },
  'citySearch.tab.preset': { ko: '기본 도시', en: 'Preset', es: 'Preselección' },
  'citySearch.tab.search': { ko: '도시 검색', en: 'Search', es: 'Buscar' },

  // Immigration Schedule
  'immigration.departure': { ko: '출국', en: 'Departure', es: 'Salida' },
  'immigration.arrival': { ko: '입국', en: 'Arrival', es: 'Llegada' },
  'immigration.addDeparture': { ko: '출국 일정 추가', en: 'Add Departure', es: 'Agregar Salida' },
  'immigration.addArrival': { ko: '입국 일정 추가', en: 'Add Arrival', es: 'Agregar Llegada' },
  'immigration.editDeparture': { ko: '출국 일정 수정', en: 'Edit Departure', es: 'Editar Salida' },
  'immigration.editArrival': { ko: '입국 일정 수정', en: 'Edit Arrival', es: 'Editar Llegada' },
  'immigration.airport': { ko: '공항', en: 'Airport', es: 'Aeropuerto' },
  'immigration.airline': { ko: '항공사', en: 'Airline', es: 'Aerolínea' },
  'immigration.flightNumber': { ko: '편명', en: 'Flight No.', es: 'N° Vuelo' },
  'immigration.terminal': { ko: '터미널', en: 'Terminal', es: 'Terminal' },
  'immigration.gate': { ko: '게이트', en: 'Gate', es: 'Puerta' },
  'immigration.date': { ko: '날짜', en: 'Date', es: 'Fecha' },
  'immigration.time': { ko: '시간', en: 'Time', es: 'Hora' },
  'immigration.confirmationNumber': { ko: '예약번호', en: 'Confirmation #', es: 'N° Confirmación' },
  'immigration.notes': { ko: '메모', en: 'Notes', es: 'Notas' },
  'immigration.delete': { ko: '삭제', en: 'Delete', es: 'Eliminar' },
  'immigration.deleteConfirm': { ko: '이 일정을 삭제하시겠습니까?', en: 'Delete this schedule?', es: '¿Eliminar este horario?' },

  // Inter-city Transport
  'intercity.title': { ko: '도시 간 이동', en: 'Inter-city Transport', es: 'Transporte Interurbano' },
  'intercity.add': { ko: '이동 추가', en: 'Add Transport', es: 'Agregar Transporte' },
  'intercity.type': { ko: '이동 수단', en: 'Transport Type', es: 'Tipo de Transporte' },
  'intercity.departure': { ko: '출발지', en: 'From', es: 'Desde' },
  'intercity.arrival': { ko: '도착지', en: 'To', es: 'Hasta' },
  'intercity.departureTime': { ko: '출발 시간', en: 'Departure Time', es: 'Hora de Salida' },
  'intercity.arrivalTime': { ko: '도착 시간', en: 'Arrival Time', es: 'Hora de Llegada' },
  'intercity.operator': { ko: '운영사', en: 'Operator', es: 'Operador' },
  'intercity.cost': { ko: '비용 (EUR)', en: 'Cost (EUR)', es: 'Costo (EUR)' },
  'intercity.notes': { ko: '메모', en: 'Notes', es: 'Notas' },
  'intercity.confirmationNumber': { ko: '예약번호', en: 'Confirmation #', es: 'N° Confirmación' },
  'intercity.delete': { ko: '삭제', en: 'Delete', es: 'Eliminar' },
  'intercity.deleteConfirm': { ko: '이 이동편을 삭제하시겠습니까?', en: 'Delete this transport?', es: '¿Eliminar este transporte?' },
  'transport.flight': { ko: '항공편', en: 'Flight', es: 'Vuelo' },

  // Memo chips
  'memo.addMemo': { ko: '메모 추가', en: 'Add memo', es: 'Agregar memo' },
  'memo.placeholder': { ko: '메모 입력...', en: 'Enter memo...', es: 'Escribir memo...' },

  // Activity expenses
  'expense.addExpense': { ko: '지출 추가', en: 'Add expense', es: 'Agregar gasto' },
  'expense.amount': { ko: '금액', en: 'Amount', es: 'Monto' },
  'expense.description': { ko: '설명', en: 'Description', es: 'Descripción' },
  'expense.amountPlaceholder': { ko: '0.00', en: '0.00', es: '0.00' },
  'expense.descPlaceholder': { ko: '지출 내역', en: 'Expense description', es: 'Descripción del gasto' },
  'expense.totalSpent': { ko: '실제 지출', en: 'Spent', es: 'Gastado' },

  // Timeline
  'timeline.title': { ko: '일정 타임라인', en: 'Schedule Timeline', es: 'Cronograma' },

  // Budget day detail
  'budget.dayDetail': { ko: '일일 상세 지출', en: 'Daily Expense Detail', es: 'Detalle de Gastos Diarios' },
  'budget.noActivityExpenses': { ko: '활동별 지출 내역이 없습니다', en: 'No activity expenses', es: 'Sin gastos de actividad' },
  'budget.activityExpenses': { ko: '활동별 지출', en: 'Activity Expenses', es: 'Gastos por Actividad' },

  // Place / Destination
  'place.addPlace': { ko: '도시 추가', en: 'Add City', es: 'Agregar Ciudad' },
  'place.name': { ko: '장소 이름', en: 'Place Name', es: 'Nombre del Lugar' },
  'place.description': { ko: '설명', en: 'Description', es: 'Descripción' },
  'place.timezone': { ko: '타임존', en: 'Timezone', es: 'Zona Horaria' },

  // Expense Owner
  'owner.shared': { ko: '공용', en: 'Shared', es: 'Compartido' },
  'owner.all': { ko: '전체', en: 'All', es: 'Todos' },
  'owner.manage': { ko: '멤버 관리', en: 'Manage Members', es: 'Gestionar Miembros' },
  'owner.addMember': { ko: '멤버 추가', en: 'Add Member', es: 'Agregar Miembro' },
  'owner.namePlaceholder': { ko: '이름 입력', en: 'Enter name', es: 'Ingrese nombre' },
  'owner.colorLabel': { ko: '색상', en: 'Color', es: 'Color' },
  'owner.cannotDeleteShared': { ko: '공용은 삭제할 수 없습니다', en: 'Cannot delete shared', es: 'No se puede eliminar compartido' },
  'owner.deleteConfirm': { ko: '이 멤버를 삭제하시겠습니까? 관련 지출은 공용으로 변경됩니다.', en: 'Delete this member? Related expenses will be reassigned to Shared.', es: '¿Eliminar este miembro? Los gastos se reasignarán a Compartido.' },

  // Settlement
  'settlement.title': { ko: '정산 요약', en: 'Settlement', es: 'Liquidación' },
  'settlement.personal': { ko: '개인 지출', en: 'Personal', es: 'Personal' },
  'settlement.sharedEach': { ko: '공용 (각)', en: 'Shared (each)', es: 'Compartido (c/u)' },
  'settlement.owes': { ko: '정산 필요', en: 'owes', es: 'debe' },
  'settlement.settled': { ko: '정산 완료', en: 'Settled', es: 'Liquidado' },

  // Camera OCR / Currency Calculator
  'camera.title': { ko: '환율 계산기', en: 'Currency Calc', es: 'Calculadora' },
  'camera.tabCalc': { ko: '계산기', en: 'Calculator', es: 'Calculadora' },
  'camera.tabOcr': { ko: 'OCR 촬영', en: 'OCR Scan', es: 'Escaneo OCR' },
  'camera.capture': { ko: '촬영', en: 'Capture', es: 'Capturar' },
  'camera.retake': { ko: '다시 촬영', en: 'Retake', es: 'Repetir' },
  'camera.detecting': { ko: '금액 인식 중...', en: 'Detecting...', es: 'Detectando...' },
  'camera.detected': { ko: '인식된 금액', en: 'Detected Amount', es: 'Monto Detectado' },
  'camera.noAmount': { ko: '금액을 인식하지 못했습니다', en: 'No amount detected', es: 'No se detectó monto' },
  'camera.manualInput': { ko: '직접 입력', en: 'Manual input', es: 'Entrada manual' },
  'camera.addExpense': { ko: '지출로 추가', en: 'Add as Expense', es: 'Agregar como Gasto' },
  'camera.notSupported': { ko: '카메라를 사용할 수 없습니다', en: 'Camera not supported', es: 'Cámara no soportada' },
  'camera.permissionDenied': { ko: '카메라 권한이 거부되었습니다', en: 'Camera permission denied', es: 'Permiso de cámara denegado' },

  // Navigation
  'nav.prevDay': { ko: '이전', en: 'Prev', es: 'Anterior' },
  'nav.nextDay': { ko: '다음', en: 'Next', es: 'Siguiente' },

  // Features
  'feature.export': { ko: '데이터 내보내기', en: 'Export Data', es: 'Exportar Datos' },
  'feature.import': { ko: '데이터 가져오기', en: 'Import Data', es: 'Importar Datos' },
  'feature.exportSuccess': { ko: '내보내기 완료!', en: 'Export complete!', es: 'Exportación completada!' },
  'feature.importSuccess': { ko: '가져오기 완료!', en: 'Import complete!', es: 'Importación completada!' },
  'feature.importError': { ko: '잘못된 파일입니다', en: 'Invalid file', es: 'Archivo inválido' },
  'feature.duplicate': { ko: '복제', en: 'Duplicate', es: 'Duplicar' },
  'feature.duplicateDay': { ko: '날짜 복제', en: 'Duplicate Day', es: 'Duplicar Día' },
  'feature.search': { ko: '검색', en: 'Search', es: 'Buscar' },
  'feature.searchPlaceholder': { ko: '일정, 장소 검색...', en: 'Search activities...', es: 'Buscar actividades...' },
  'feature.noResults': { ko: '검색 결과 없음', en: 'No results', es: 'Sin resultados' },
  'feature.timeConflict': { ko: '⚠ 시간이 겹치는 일정이 있습니다', en: '⚠ Time conflict detected', es: '⚠ Conflicto de horario' },
  'feature.budgetAlert': { ko: '예산 초과!', en: 'Over budget!', es: 'Sobre presupuesto!' },
  'feature.budgetWarn': { ko: '예산의 90%를 사용했습니다', en: '90% of budget used', es: '90% del presupuesto usado' },
  'feature.quickAdd': { ko: '추천 일정', en: 'Suggested', es: 'Sugerido' },
  'feature.quickAddDesc': { ko: '이 도시의 추천 장소에서 추가', en: 'Add from destination guide', es: 'Agregar desde guía del destino' },
  'feature.csvExport': { ko: '지출 CSV 내보내기', en: 'Export Expenses CSV', es: 'Exportar Gastos CSV' },

  // Activity Detail Modal
  'detail.title': { ko: '일정 상세', en: 'Activity Detail', es: 'Detalle de Actividad' },
  'detail.memos': { ko: '메모', en: 'Memos', es: 'Notas' },
  'detail.expenses': { ko: '지출 내역', en: 'Expenses', es: 'Gastos' },
  'detail.media': { ko: '사진/동영상', en: 'Media', es: 'Medios' },
  'detail.addPhoto': { ko: '사진 추가', en: 'Add Photo', es: 'Agregar Foto' },
  'detail.addVideo': { ko: '동영상 추가', en: 'Add Video', es: 'Agregar Video' },
  'detail.noMedia': { ko: '아직 사진/동영상이 없습니다', en: 'No media yet', es: 'Sin medios aún' },
  'detail.storageLimitWarning': { ko: '저장 공간 한도에 가까워지고 있습니다 (3MB)', en: 'Approaching storage limit (3MB)', es: 'Cerca del límite de almacenamiento (3MB)' },
  'detail.uploadMedia': { ko: '파일 선택', en: 'Choose File', es: 'Elegir Archivo' },
  'detail.capturePhoto': { ko: '사진 촬영', en: 'Take Photo', es: 'Tomar Foto' },

  // Multi-trip
  'trips.title': { ko: '여행 목록', en: 'My Trips', es: 'Mis Viajes' },
  'trips.create': { ko: '새 여행 만들기', en: 'Create Trip', es: 'Crear Viaje' },
  'trips.switch': { ko: '여행 전환', en: 'Switch Trip', es: 'Cambiar Viaje' },
  'trips.delete': { ko: '여행 삭제', en: 'Delete Trip', es: 'Eliminar Viaje' },
  'trips.deleteConfirm': { ko: '이 여행을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.', en: 'Delete this trip? All data will be removed.', es: '¿Eliminar este viaje? Todos los datos serán eliminados.' },
  'trips.duplicate': { ko: '여행 복제', en: 'Duplicate Trip', es: 'Duplicar Viaje' },
  'trips.noTrips': { ko: '여행이 없습니다', en: 'No trips yet', es: 'Sin viajes aún' },
  'trips.current': { ko: '현재 여행', en: 'Current Trip', es: 'Viaje Actual' },
  'trips.cannotDeleteLast': { ko: '마지막 여행은 삭제할 수 없습니다', en: 'Cannot delete the last trip', es: 'No se puede eliminar el último viaje' },
  'trips.tripName': { ko: '여행 이름', en: 'Trip Name', es: 'Nombre del Viaje' },
  'trips.emoji': { ko: '이모지', en: 'Emoji', es: 'Emoji' },
  'trips.budget': { ko: '예산', en: 'Budget', es: 'Presupuesto' },
  'trips.progress': { ko: '진행률', en: 'Progress', es: 'Progreso' },
  'trips.days': { ko: '일', en: 'days', es: 'días' },
  'trips.activities': { ko: '개 일정', en: 'activities', es: 'actividades' },
  'trips.manageTrips': { ko: '여행 관리', en: 'Manage Trips', es: 'Gestionar Viajes' },
  'trips.backToPlanner': { ko: '일정으로 돌아가기', en: 'Back to Planner', es: 'Volver al Planificador' },
  'trips.createdAt': { ko: '생성일', en: 'Created', es: 'Creado' },

  // Place
  'day.addPlace': { ko: '장소 추가', en: 'Add Place', es: 'Agregar Lugar' },
  'day.addActivityDesc': { ko: '시간·비용 포함', en: 'With time & cost', es: 'Con hora y costo' },
  'day.addPlaceDesc': { ko: '위치만 등록', en: 'Location only', es: 'Solo ubicación' },
  'addPlace.title': { ko: '장소 추가', en: 'Add Place', es: 'Agregar Lugar' },

  // Accommodation
  'accommodation.title': { ko: '숙소', en: 'Accommodation', es: 'Alojamiento' },
  'accommodation.checkIn': { ko: '체크인', en: 'Check-in', es: 'Check-in' },
  'accommodation.checkOut': { ko: '체크아웃', en: 'Check-out', es: 'Check-out' },

  // Sidebar hardcoded
  'sidebar.noActivities': { ko: '일정 없음', en: 'No activities', es: 'Sin actividades' },
  'sidebar.completed': { ko: '완료', en: 'Done', es: 'Hecho' },
  'sidebar.count': { ko: '개', en: '', es: '' },
  'sidebar.daysAndActivities': { ko: '일 · {acts}개 일정', en: 'days · {acts} activities', es: 'días · {acts} actividades' },
  'sidebar.close': { ko: '닫기', en: 'Close', es: 'Cerrar' },

  // Day navigation
  'day.prevDay': { ko: '이전 날', en: 'Previous day', es: 'Día anterior' },
  'day.nextDay': { ko: '다음 날', en: 'Next day', es: 'Día siguiente' },
  'day.insertHere': { ko: '여기에 추가', en: 'Insert here', es: 'Insertar aquí' },

  // Flight
  'flight.departure': { ko: '출발', en: 'Departure', es: 'Salida' },
  'flight.arrival': { ko: '도착', en: 'Arrival', es: 'Llegada' },
  'flight.deleteConfirm': { ko: '삭제하시겠습니까?', en: 'Delete?', es: '¿Eliminar?' },

  // Budget comparison
  'budget.overBudget': { ko: '초과', en: 'over', es: 'excedido' },
  'budget.saved': { ko: '절약', en: 'saved', es: 'ahorrado' },

  // Trip count
  'trips.tripCount': { ko: '개의 여행', en: 'trips', es: 'viajes' },

  // Accommodation form (DayFormModal)
  'accommodation.autoApply': { ko: '같은 도시 숙소 자동 적용', en: 'Auto-applied from same city', es: 'Aplicado automáticamente de la misma ciudad' },
  'accommodation.addInfo': { ko: '숙소 정보 추가', en: 'Add accommodation info', es: 'Agregar alojamiento' },
  'accommodation.info': { ko: '숙소 정보', en: 'Accommodation Info', es: 'Info del Alojamiento' },
  'accommodation.searchPlaceholder': { ko: '숙소 검색 (호텔, 에어비앤비...)', en: 'Search accommodation (hotel, Airbnb...)', es: 'Buscar alojamiento (hotel, Airbnb...)' },
  'accommodation.namePlaceholder': { ko: '숙소 이름 (예: Hotel Arts Barcelona)', en: 'Accommodation name (e.g. Hotel Arts Barcelona)', es: 'Nombre del alojamiento (ej. Hotel Arts Barcelona)' },
  'accommodation.addressPlaceholder': { ko: '주소', en: 'Address', es: 'Dirección' },
  'accommodation.costPerNight': { ko: '1박 비용', en: 'Cost per night', es: 'Costo por noche' },
  'accommodation.confirmationNumber': { ko: '예약 번호', en: 'Confirmation #', es: 'Nº de reserva' },
  'accommodation.optional': { ko: '선택', en: 'Optional', es: 'Opcional' },
  'accommodation.notesPlaceholder': { ko: '메모 (와이파이 비번, 주차 정보 등)', en: 'Notes (wifi password, parking info, etc.)', es: 'Notas (contraseña wifi, info de parking, etc.)' },
  'form.notesPlaceholder': { ko: '메모를 입력하세요...', en: 'Enter notes...', es: 'Ingrese notas...' },

  // Flight form (FlightFormModal)
  'flight.editTitle': { ko: '항공편 수정', en: 'Edit Flight', es: 'Editar Vuelo' },
  'flight.addTitle': { ko: '항공편 추가', en: 'Add Flight', es: 'Agregar Vuelo' },
  'flight.airline': { ko: '항공사', en: 'Airline', es: 'Aerolínea' },
  'flight.airlinePlaceholder': { ko: '예: 대한항공', en: 'e.g. Korean Air', es: 'ej. Iberia' },
  'flight.flightNumber': { ko: '편명', en: 'Flight #', es: 'Nº de vuelo' },
  'flight.flightNumberPlaceholder': { ko: '예: KE913', en: 'e.g. KE913', es: 'ej. IB3456' },
  'flight.departureCity': { ko: '출발지', en: 'From', es: 'Origen' },
  'flight.departureCityPlaceholder': { ko: '예: ICN 인천', en: 'e.g. ICN Incheon', es: 'ej. MAD Madrid' },
  'flight.arrivalCity': { ko: '도착지', en: 'To', es: 'Destino' },
  'flight.arrivalCityPlaceholder': { ko: '예: BCN 바르셀로나', en: 'e.g. BCN Barcelona', es: 'ej. BCN Barcelona' },
  'flight.departureTime': { ko: '출발 시간', en: 'Departure time', es: 'Hora de salida' },
  'flight.arrivalTime': { ko: '도착 시간', en: 'Arrival time', es: 'Hora de llegada' },
  'flight.confirmationNumber': { ko: '예약 번호 (선택)', en: 'Confirmation # (optional)', es: 'Nº de reserva (opcional)' },
  'flight.confirmationPlaceholder': { ko: '예약 확인 번호', en: 'Confirmation number', es: 'Número de confirmación' },
  'flight.notes': { ko: '메모 (선택)', en: 'Notes (optional)', es: 'Notas (opcional)' },
  'flight.notesPlaceholder': { ko: '터미널, 좌석 번호 등', en: 'Terminal, seat number, etc.', es: 'Terminal, número de asiento, etc.' },

  // Destination form (DestinationFormModal)
  'place.citySearch': { ko: '도시 검색', en: 'City Search', es: 'Buscar Ciudad' },
  'place.citySearchPlaceholder': { ko: '도시 이름을 검색하세요...', en: 'Search for a city...', es: 'Buscar una ciudad...' },
  'place.namePlaceholder': { ko: '예: 세비야, 톨레도, 발렌시아...', en: 'e.g. Seville, Toledo, Valencia...', es: 'ej. Sevilla, Toledo, Valencia...' },
  'place.descriptionPlaceholder': { ko: '장소에 대한 설명...', en: 'Description of the place...', es: 'Descripción del lugar...' },

  // Trip create
  'trips.namePlaceholder': { ko: '예: 이탈리아 여행 2026', en: 'e.g. Italy Trip 2026', es: 'ej. Viaje a Italia 2026' },

  // Settings
  'settings.dataManagement': { ko: '데이터 관리', en: 'Data Management', es: 'Gestión de Datos' },

  // Camera OCR
  'camera.ocrResult': { ko: 'OCR 인식 결과', en: 'OCR Result', es: 'Resultado OCR' },

  // Theme
  'theme.title': { ko: '테마', en: 'Theme', es: 'Tema' },
  'theme.cloudDancer': { ko: 'Cloud Dancer', en: 'Cloud Dancer', es: 'Cloud Dancer' },
  'theme.cloudDancerDesc': { ko: '2026 팬톤 올해의 색', en: '2026 Pantone COTY', es: 'Pantone COTY 2026' },
  'theme.classicSpain': { ko: 'Classic Spain', en: 'Classic Spain', es: 'España Clásica' },
  'theme.classicSpainDesc': { ko: '열정의 빨강과 금색', en: 'Passionate red & gold', es: 'Rojo y dorado apasionado' },
  'theme.mochaMousse': { ko: 'Mocha Mousse', en: 'Mocha Mousse', es: 'Mocha Mousse' },
  'theme.mochaMousseDesc': { ko: '2025 팬톤 올해의 색', en: '2025 Pantone COTY', es: 'Pantone COTY 2025' },
  'theme.scrollToTop': { ko: '맨 위로', en: 'Top', es: 'Arriba' },
} as const;

export type TranslationKey = keyof typeof translations;

export const languageNames: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
  es: 'Español',
};
