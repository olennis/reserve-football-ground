import { createClient } from '@supabase/supabase-js'

// Supabase 환경 변수 - 실제 프로젝트에서는 .env.local 파일에서 관리하세요
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 예약 데이터 타입 정의
export interface Reservation {
  id: string
  date: string
  start_time: string
  end_time: string
  created_at: string
}

// 예약 생성 함수
export const createReservation = async (date: string, startTime: string, endTime: string) => {
  const { data, error } = await supabase
    .from('reservations')
    .insert([
      {
        date,
        start_time: startTime,
        end_time: endTime
      }
    ])
    .select()

  if (error) {
    console.error('예약 생성 실패:', error)
    throw error
  }

  return data
}

// 특정 날짜의 예약 목록 조회
export const getReservationsByDate = async (date: string) => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('date', date)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('예약 조회 실패:', error)
    throw error
  }

  return data as Reservation[]
}

// 모든 예약 조회 (달력 표시용)
export const getAllReservations = async () => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('date', { ascending: true })

  if (error) {
    console.error('전체 예약 조회 실패:', error)
    throw error
  }

  return data as Reservation[]
}

// 시간 포맷팅 함수 (HH:MM:SS -> HH:MM)
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // "HH:MM:SS" 형태의 문자열을 "HH:MM"으로 변환
  const timeParts = timeString.split(':');
  if (timeParts.length >= 2) {
    return `${timeParts[0]}:${timeParts[1]}`;
  }
  
  return timeString;
}

// 날짜를 로컬 시간대로 포맷팅 (UTC 변환 방지)
export const formatDateForDB = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 실시간 구독 설정 (예약 변경 시 실시간 업데이트)
export const subscribeToReservations = (callback: (payload: any) => void) => {
  return supabase
    .channel('reservations')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, callback)
    .subscribe()
}