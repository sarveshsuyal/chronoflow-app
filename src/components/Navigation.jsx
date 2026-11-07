import React from 'react';
import { CalendarClock, CheckSquare, Repeat, BarChart3 } from 'lucide-react';

export const Navigation = ({ activeTab, setActiveTab, counts }) => {
  const tabs = [
    {
      id: 'timeline',
      label: "Today's Schedule",
      icon: CalendarClock,
      badge: counts.scheduledToday,
      description: 'Auto-Arranged Flow',
    },
    {
      id: 'tasks',
      label: 'Tasks & Backlog',
      icon: CheckSquare,
      badge: counts.pendingTasks,
      description: 'Smart Organizer',
    },
    {
      id: 'routines',
      label: 'Daily Routines',
      icon: Repeat,
      badge: counts.routines,
      description: 'Habit Anchors',
    },
    {
      id: 'analytics',
      label: 'Daily Progress',
      icon: BarChart3,
      badge: null,
      description: 'Stats & History',
    },
  ];

  return (
    <div className="border-b border-slate-800/80 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[11px] font-semibold rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
