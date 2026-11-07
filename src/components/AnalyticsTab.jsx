import React from 'react';
import {
  Flame,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Archive,
  BarChart2,
  Sparkles,
} from 'lucide-react';

export const AnalyticsTab = ({ analytics, archive, todayTasks }) => {
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;
  const todayRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // History stats
  const history = analytics.history || [];
  const totalDaysLogged = history.length;
  const avgCompletion = totalDaysLogged > 0
    ? Math.round(history.reduce((acc, h) => acc + (h.rate || 0), 0) / totalDaysLogged)
    : todayRate;

  return (
    <div className="space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6 fill-amber-500/30" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Daily Streak</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-white">{analytics.streak || 1}</span>
              <span className="text-xs text-amber-400 font-semibold">Days 🔥</span>
            </div>
            <span className="text-[11px] text-slate-500">Best: {analytics.bestStreak || 1} days</span>
          </div>
        </div>

        {/* Today's Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Today's Rate</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-white">{todayRate}%</span>
              <span className="text-xs text-emerald-400 font-semibold">{completedCount}/{totalCount}</span>
            </div>
            <span className="text-[11px] text-slate-500">Target: 80%+</span>
          </div>
        </div>

        {/* Focus Minutes */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Deep Focus Time</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-white">{analytics.totalFocusedMinutes || 340}</span>
              <span className="text-xs text-indigo-400 font-semibold">Mins</span>
            </div>
            <span className="text-[11px] text-slate-500">Recorded across tasks</span>
          </div>
        </div>

        {/* Consistency */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Avg Completion</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-white">{avgCompletion}%</span>
              <span className="text-xs text-purple-400 font-semibold">Weekly</span>
            </div>
            <span className="text-[11px] text-slate-500">{totalDaysLogged} recorded days</span>
          </div>
        </div>

      </div>

      {/* 7-Day Performance Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">7-Day Completion Velocity</h3>
          </div>
          <span className="text-xs text-slate-400">Performance History</span>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-6 pb-2 grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-slate-800">
          {history.slice(-7).map((day, idx) => {
            const heightPercent = Math.max(day.rate || 10, 12);
            const isHigh = day.rate >= 80;

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-mono text-slate-400 group-hover:text-white transition">
                  {day.rate}%
                </span>
                <div className="w-full bg-slate-800 rounded-t-lg h-full max-h-[140px] flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${
                      isHigh
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        : 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {day.date.split('-').slice(1).join('/')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Archived Tasks / Disappeared Event Tasks */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-white">
              Daily Auto-Archive & Disappeared Tasks
            </h3>
          </div>
          <span className="text-xs text-slate-500">{archive.length} Items Archived</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          When a day completes or passes, date-specific events automatically disappear from your active dashboard and are archived here to keep your daily view clutter-free.
        </p>

        {archive.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No archived tasks yet. Click "End & Record Day" at the end of your day to archive completed events!
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {archive.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.completed ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  <span className={item.completed ? 'text-slate-300' : 'text-slate-400'}>
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span>{item.category || 'General'}</span>
                  <span>Archived: {item.archivedOn || 'Past Day'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
