import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, X, Volume2, VolumeX, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/sound';

export const FocusTimerModal = ({ task, isOpen, onClose, onCompleteTask }) => {
  if (!isOpen || !task) return null;

  const totalSeconds = (task.durationMinutes || 30) * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSecondsLeft((task.durationMinutes || 30) * 60);
    setIsRunning(true);
  }, [task]);

  useEffect(() => {
    let timer = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      if (soundEnabled) playSound('celebrate');
      confetti({ particleCount: 120, spread: 80 });
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, soundEnabled]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning && soundEnabled) playSound('start');
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const handleFinish = () => {
    onCompleteTask(task.id);
    if (soundEnabled) playSound('complete');
    confetti({ particleCount: 150, spread: 90 });
    onClose();
  };

  // Clock format
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const strokeDashoffset = 565.48 * (1 - progressRatio);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg flex flex-col items-center justify-between min-h-[500px] text-center p-6 relative">
        
        {/* Top Controls */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Deep Focus Zone
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Exit Focus Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Name & Details */}
        <div className="my-4 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
            {task.category || 'Focus Task'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {task.title}
          </h2>
        </div>

        {/* Circular Clock Graphic */}
        <div className="relative w-64 h-64 flex items-center justify-center my-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r="90"
              className="text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="100"
              cy="100"
              r="90"
              className="text-indigo-500 transition-all duration-500"
              strokeWidth="10"
              strokeDasharray="565.48"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-5xl font-black text-white tracking-wider">
              {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              {Math.round(progressRatio * 100)}% Completed
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Restart Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 shadow-xl transition active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinish}
            className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition active:scale-95"
            title="Mark Completed"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
