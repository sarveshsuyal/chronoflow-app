import React from 'react';
import { Sparkles, Flame, Plus, CheckCircle2, Calendar, Clock, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/sound';

export const Header = ({
  analytics,
  todayTasks,
  onOpenTaskModal,
  onEndDay,
}) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleEndDayClick = () => {
    if (window.confirm('Ready to complete today? This will record your daily progress, archive date-specific tasks, and refresh routines for tomorrow!')) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      playSound('celebrate');
      onEndDay();
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Date */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Clock className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ChronoFlow
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Smart Time OS
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Live Metrics & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
          
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold shadow-inner">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            <span>{analytics.streak || 1} Day Streak</span>
          </div>

          {/* Today Completion Meter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <div className="w-12 bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="font-semibold text-slate-200">
              {completedCount}/{totalCount} Done ({completionRate}%)
            </span>
          </div>

          {/* End Day Button */}
          <button
            onClick={handleEndDayClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition shadow-sm hover:shadow"
            title="Complete today, log progress and refresh routines"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">End & Record Day</span>
            <span className="sm:hidden">End Day</span>
          </button>

          {/* Add Task CTA */}
          <button
            onClick={() => onOpenTaskModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>

        </div>
      </div>
    </header>
  );
};
