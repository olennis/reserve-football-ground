'use client';

import { useState } from 'react';
import { formatDateForDB } from '../../lib/supabase';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  reservations: Map<string, string[]>;
}

export default function Calendar({ selectedDate, onDateSelect, reservations }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateSelect(today);
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasReservations = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = formatDateForDB(date);
    return reservations.has(dateKey) && reservations.get(dateKey)!.length > 0;
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isPast = isPastDate(day);
      const isSelected = isDateSelected(day);
      const hasReservation = hasReservations(day);

      days.push(
        <button
          key={day}
          onClick={() => {
            if (!isPast) {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              onDateSelect(date);
            }
          }}
          disabled={isPast}
          className={`
            w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg border-2 transition-colors text-xs sm:text-sm md:text-base
            ${isPast 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 opacity-50' 
              : 'hover:bg-orange-50 border-gray-200 hover:border-orange-300 cursor-pointer'
            }
            ${isSelected && !isPast
              ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600' 
              : isPast 
                ? 'bg-gray-200 text-gray-400' 
                : 'bg-white text-gray-700'
            }
            ${hasReservation && !isSelected && !isPast 
              ? 'bg-yellow-50 border-yellow-300' 
              : ''
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="calendar">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </h3>
          
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs sm:text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 rounded-md transition-colors font-medium"
          >
            오늘
          </button>
        </div>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="w-8 h-6 sm:w-10 sm:h-7 md:w-12 md:h-8 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      <div className="mt-4 text-xs sm:text-sm text-gray-500">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-50 border border-yellow-300 rounded"></div>
            <span>다른 팀 계획 있음</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded"></div>
            <span>선택됨</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-200 border border-gray-300 rounded opacity-50"></div>
            <span>계획 등록 불가</span>
          </div>
        </div>
      </div>
    </div>
  );
}