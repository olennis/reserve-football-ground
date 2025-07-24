'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '../../lib/supabase';

interface TimeSlotPickerProps {
  selectedDate: Date;
  onReservation: (date: Date, startTime: string, endTime: string) => void;
  reservedSlots: string[];
  isLoading?: boolean;
}

export default function TimeSlotPicker({ selectedDate, onReservation, reservedSlots, isLoading = false }: TimeSlotPickerProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour <= 22; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
    return slots;
  };

  const calculateEndTime = (start: string) => {
    if (!start) return '';
    const [hours, minutes] = start.split(':').map(Number);
    const endHour = hours + 2;
    if (endHour > 24) return '';
    return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isTimeSlotReserved = (time: string) => {
    const calculatedEndTime = calculateEndTime(time);
    if (!calculatedEndTime) return true;
    
    return reservedSlots.some(slot => {
      const [reservedStart, reservedEnd] = slot.split('-');
      return (
        (time >= reservedStart && time < reservedEnd) ||
        (calculatedEndTime > reservedStart && calculatedEndTime <= reservedEnd) ||
        (time <= reservedStart && calculatedEndTime >= reservedEnd)
      );
    });
  };

  const getReservationStatus = (time: string) => {
    const calculatedEndTime = calculateEndTime(time);
    if (!calculatedEndTime) return null;
    
    const timeSlot = `${time}-${calculatedEndTime}`;
    if (reservedSlots.includes(timeSlot)) {
      return `예약됨 (${time} - ${calculatedEndTime})`;
    }
    return null;
  };

  useEffect(() => {
    if (startTime) {
      const calculatedEndTime = calculateEndTime(startTime);
      setEndTime(calculatedEndTime);
    } else {
      setEndTime('');
    }
  }, [startTime]);

  const handleReservation = () => {
    if (startTime && endTime) {
      onReservation(selectedDate, startTime, endTime);
      setStartTime('');
      setEndTime('');
    }
  };

  const timeSlots = generateTimeSlots();

  // 시간 슬롯 포맷팅 함수 (HH:MM:SS-HH:MM:SS -> HH:MM ~ HH:MM)
  const formatTimeSlot = (slot: string): string => {
    const [startTime, endTime] = slot.split('-');
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    return `${formattedStartTime} ~ ${formattedEndTime}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-xs sm:text-sm text-gray-600 mb-4">
        선택된 날짜: {selectedDate.toLocaleDateString('ko-KR')}
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            시작 시간
          </label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">시작 시간을 선택하세요</option>
            {timeSlots.map(time => (
              <option 
                key={time} 
                value={time}
                disabled={isTimeSlotReserved(time)}
              >
                {time} {getReservationStatus(time) || (isTimeSlotReserved(time) ? '(예약 불가)' : '')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            종료 시간
          </label>
          <select
            value={endTime}
            disabled={!startTime}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-sm sm:text-base"
          >
            <option value="">
              {startTime ? `${endTime} (자동 계산됨)` : '시작 시간을 먼저 선택하세요'}
            </option>
          </select>
        </div>
      </div>

      <button
        onClick={handleReservation}
        disabled={!startTime || !endTime || isLoading}
        className={`
          w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center justify-center gap-2
          ${startTime && endTime && !isLoading
            ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            계획 등록 중...
          </>
        ) : (
          '계획 등록하기'
        )}
      </button>

      {reservedSlots.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">예약된 시간</h4>
          <div className="space-y-2">
            {reservedSlots
              .sort((a, b) => a.localeCompare(b))
              .map((slot, index) => (
                <div 
                  key={index}
                  className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-red-700"
                >
                  {formatTimeSlot(slot)}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}