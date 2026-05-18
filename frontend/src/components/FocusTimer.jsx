import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const FocusTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(BREAK_TIME);
        alert(`Focus complete! Starting 5 minute Break.`);
      } else {
        setMode('work');
        setTimeLeft(WORK_TIME);
        alert(`Break complete! Let's get back to Focus.`);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = (m) => {
    setIsActive(false);
    setMode(m);
    setTimeLeft(m === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all z-50 flex items-center justify-center group"
      >
        <Timer className="w-7 h-7" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap group-hover:ml-3 font-semibold text-lg">Focus</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform transition-all">
      <div className="flex justify-between items-center p-5 bg-gray-50 border-b border-gray-100">
        <h3 className="font-bold text-gray-700 flex items-center">
          <Timer className="w-5 h-5 mr-2 text-indigo-500" /> Pomodoro Timer
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        <div className="flex justify-center space-x-3 mb-8">
          <button 
            onClick={() => switchMode('work')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${mode === 'work' ? 'bg-red-100 text-red-600 scale-105 shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            Focus
          </button>
          <button 
            onClick={() => switchMode('break')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${mode === 'break' ? 'bg-green-100 text-green-600 scale-105 shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            Break
          </button>
        </div>

        <div className="flex justify-center mb-8">
          <span className={`text-6xl font-black font-mono tracking-tighter ${mode === 'work' ? 'text-red-500' : 'text-green-500'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex justify-center space-x-6">
          <button 
            onClick={toggleTimer}
            className={`flex items-center justify-center p-4 rounded-full text-white shadow-lg transition-transform hover:scale-105 ${isActive ? 'bg-amber-500' : 'bg-indigo-600'}`}
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button 
            onClick={resetTimer}
            className="flex items-center justify-center p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-transform hover:scale-105 shadow-sm"
          >
            <RotateCcw className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
