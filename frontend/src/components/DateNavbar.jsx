import React, { useState, useEffect, useRef } from 'react';
import { format, isSameDay, addDays } from 'date-fns';
import { Plus, ChevronDown } from 'lucide-react';

const DateNavbar = ({ selectedDate, onDateSelect, onCreateNote }) => {
  const [dates, setDates] = useState([]);
  const scrollContainerRef = useRef(null);
  const todayRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    // Generate 13 days: 3 days before today, today, and 9 days after
    const newDates = Array.from({ length: 13 }).map((_, i) => addDays(today, i - 3));
    setDates(newDates);
  }, []);

  useEffect(() => {
    if (selectedDate && dates.length > 0) {
      const selDate = new Date(selectedDate);
      const isSelectedInView = dates.some(d => isSameDay(d, selDate));
      if (!isSelectedInView) {
        const newDates = Array.from({ length: 13 }).map((_, i) => addDays(selDate, i - 3));
        setDates(newDates);
      }
    }
  }, [selectedDate, dates]);

  useEffect(() => {
    // Scroll to today smoothly after dates render
    const timeout = setTimeout(() => {
      if (todayRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const offsetLeft = todayRef.current.offsetLeft;
        container.scrollTo({ left: offsetLeft - 16, behavior: 'smooth' }); // -16px for padding
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [dates]);

  const displayDate = selectedDate || null;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 mb-6 transition-colors">
      <div className="mb-5 flex flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-col">
          <div className="flex items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center line-clamp-1 transition-colors">
              {displayDate ? format(new Date(displayDate), 'MMMM d, yyyy') : 'Select Date'}
            </h2>
            <div className="relative ml-2 flex items-center justify-center">
              <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
              <input 
                type="date"
                id="datePicker"
                name="datePicker"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                value={displayDate ? format(new Date(displayDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const parts = e.target.value.split('-');
                    const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
                    onDateSelect(localDate);
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {onCreateNote && (
          <button 
            onClick={onCreateNote}
            className="shrink-0 flex items-center justify-center px-2 py-2 sm:px-4 sm:py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
          >
            <span className="hidden sm:inline">Create</span>
            <span className="sm:hidden">Create</span>
          </button>
        )}
      </div>

      <div 
        ref={scrollContainerRef}
        className="grid grid-cols-7 gap-1 sm:flex sm:space-x-3 sm:overflow-x-auto hide-scrollbar w-full"
      >
        {dates.map((date, index) => {
          // Only select if there's an explicitly selected date that matches
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday = isSameDay(date, new Date());
          const isHiddenOnMobile = index < 3 || index > 9;

          return (
            <button
              key={date.toString()}
              ref={isToday ? todayRef : null}
              // If already selected, click clears it (null), else it selects 'date'
              onClick={() => onDateSelect(isSelected ? null : date)}
              className={`relative flex-col items-center justify-center w-full sm:min-w-[64px] h-[64px] sm:h-[84px] rounded-xl transition-all ${
                isHiddenOnMobile ? 'hidden sm:flex' : 'flex'
              } ${
                isSelected
                  ? 'bg-blue-500 text-white shadow-md'
                  : isToday 
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <span className={`text-lg sm:text-2xl font-bold ${isSelected ? 'text-white' : ''}`}>
                {format(date, 'dd')}
              </span>
              <span className={`text-[10px] sm:text-sm font-medium mt-0.5 ${isSelected ? 'text-white opacity-90' : 'text-gray-500 dark:text-gray-400'}`}>
                {format(date, 'EEE')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateNavbar;
