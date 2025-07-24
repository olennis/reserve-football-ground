'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import Toast from '@/components/Toast';
import ShareButton from '@/components/ShareButton';
import Footer from '@/components/Footer';
import { createReservation, getAllReservations, subscribeToReservations, formatTime, formatDateForDB, type Reservation } from '../../lib/supabase';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reservations, setReservations] = useState<Map<string, string[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const handleReservation = async (date: Date, startTime: string, endTime: string) => {
    setIsLoading(true);
    try {
      // 로컬 시간대로 날짜 포맷팅 (UTC 변환 방지)
      const dateKey = formatDateForDB(date);
      
      // Supabase에 예약 저장
      await createReservation(dateKey, startTime, endTime);
      
      // 로컬 상태 업데이트
      const currentReservations = reservations.get(dateKey) || [];
      const newReservations = new Map(reservations);
      newReservations.set(dateKey, [...currentReservations, `${startTime}-${endTime}`]);
      setReservations(newReservations);
      
      setToast({
        message: `${startTime} ~ ${endTime} 계획이 등록되었습니다!`,
        type: 'success',
        isVisible: true,
      });
    } catch (error) {
      console.error('예약 실패:', error);
      setToast({
        message: '계획 등록에 실패했습니다. 다시 시도해주세요.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleShare = (message: string) => {
    setToast({
      message,
      type: 'success',
      isVisible: true,
    });
  };

  const handleEmailCopy = (message: string) => {
    setToast({
      message,
      type: 'success',
      isVisible: true,
    });
  };

  const getReservedSlots = (date: Date): string[] => {
    // 로컬 시간대로 날짜 포맷팅 (UTC 변환 방지)
    const dateKey = formatDateForDB(date);
    return reservations.get(dateKey) || [];
  };

  // 데이터베이스에서 예약 데이터 로드
  const loadReservations = async () => {
    try {
      const allReservations = await getAllReservations();
      const reservationMap = new Map<string, string[]>();
      
      allReservations.forEach((reservation: Reservation) => {
        const dateKey = reservation.date;
        const formattedStartTime = formatTime(reservation.start_time);
        const formattedEndTime = formatTime(reservation.end_time);
        const timeSlot = `${formattedStartTime}-${formattedEndTime}`;
        
        if (reservationMap.has(dateKey)) {
          reservationMap.get(dateKey)!.push(timeSlot);
        } else {
          reservationMap.set(dateKey, [timeSlot]);
        }
      });
      
      setReservations(reservationMap);
    } catch (error) {
      console.error('예약 데이터 로드 실패:', error);
      setToast({
        message: '데이터를 불러오는데 실패했습니다.',
        type: 'error',
        isVisible: true,
      });
    }
  };

  // 실시간 업데이트 처리
  const handleRealtimeUpdate = () => {
    // 변경사항이 있을 때 전체 데이터 다시 로드
    loadReservations();
  };

  // 컴포넌트 마운트 시 데이터 로드 및 실시간 구독 설정
  useEffect(() => {
    loadReservations();
    
    // 실시간 구독 설정
    const subscription = subscribeToReservations(handleRealtimeUpdate);
    
    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe();
    };
  }, [handleRealtimeUpdate]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">🏃‍♂️ 첨단구장 사용 현황판</h1>
          
          <div className="absolute top-0 right-0">
            <ShareButton onShare={handleShare} />
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 lg:mt-10 mb-8 sm:mb-10 lg:mb-12">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-orange-800 mb-3 sm:mb-4">
              📋 이용 안내사항
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm lg:text-base text-orange-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>다른 팀의 구장 이용 계획을 미리 확인하세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>이 서비스는 <strong className="text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded">구장 예약이 아닌</strong> 경기 상황 공유 목적입니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>현장 선착순 원칙은 그대로 유지됩니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>그렇기 때문에, 계획과 상관 없이 먼저 경기하고 있는 팀이 있을 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>먼저 사용중인 팀이 있다면 이 서비스를 공유해주셔서 서로의 헛걸음 방지에 함께 해주세요</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">날짜 선택</h2>
            <Calendar 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate}
              reservations={reservations}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">시간 선택</h2>
            {selectedDate ? (
              <TimeSlotPicker 
                selectedDate={selectedDate}
                onReservation={handleReservation}
                reservedSlots={getReservedSlots(selectedDate)}
                isLoading={isLoading}
              />
            ) : (
              <p className="text-sm sm:text-base text-gray-500">먼저 날짜를 선택해주세요.</p>
            )}
          </div>
        </div>
        
        
      </div>
      
      <Footer onCopy={handleEmailCopy} />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </div>
  );
}
