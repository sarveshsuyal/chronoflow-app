import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  CalendarDays,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatTime12 } from '../utils/scheduler';
import { playSound } from '../utils/sound';

export const TaskOrganizerTab = ({
  tasks,
  onToggleTaskComplete,
  onDeleteTask,
  onEditTask,
  onOpenTaskModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, event, general, completed
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredTasks = tasks.filter((task) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchCategory = task.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory) return false;
    }

    // Type filter
    if (filterType === 'event' && task.type !== 'event') return false;
    if (filterType === 'general' && task.type !== 'general') return false;
    if (filterType === 'completed' && !task.completed) return false;
    if (filterType !== 'completed' && task.completed) return false; // Show active by default unless 'completed' tab

    // Priority filter
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Smart Guard Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Smart Isolation: Event Tasks vs. Regular Routines
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Specific Day events are safely isolated. When you complete your day or the date passes, these event tasks automatically disappear into your Daily Progress Archive so your regular habits and upcoming priorities stay clean and undisturbed.
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Active ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            onClick={() => setFilterType('event')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              filterType === 'event'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Day-Specific Events
          </button>
          <button
            onClick={() => setFilterType('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              filterType === 'general'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            General Backlog
          </button>
          <button
            onClick={() => setFilterType('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              filterType === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Done ({tasks.filter((t) => t.completed).length})
          </button>

          <button
            onClick={() => onOpenTaskModal()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 font-medium">No tasks found matching your filter.</p>
            <p className="text-slate-500 text-xs mt-1">Create a new task to get started!</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.completed;
            const isEvent = task.type === 'event';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md shadow-slate-950/40'
                }`}
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isEvent ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                          <CalendarDays className="w-2.5 h-2.5" /> Specific Day
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Backlog
                        </span>
                      )}

                      {task.priority === 'high' && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          High
                        </span>
                      )}
                      {task.priority === 'medium' && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Med
                        </span>
                      )}
                      {task.priority === 'low' && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Low
                        </span>
                      )}

                      {task.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {task.category}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4
                    className={`text-base font-semibold leading-snug ${
                      isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {task.title}
                  </h4>
                </div>

                {/* Footer details & Action */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {task.durationMinutes || 30}m
                    </span>

                    {task.scheduledStart ? (
                      <span className="flex items-center gap-1 text-indigo-400 font-medium">
                        <Sparkles className="w-3 h-3" />
                        {formatTime12(task.scheduledStart)}
                      </span>
                    ) : (
                      <span className="capitalize text-slate-500">
                        {task.preferredWindow || 'Anytime'}
                      </span>
                    )}

                    {task.targetDate && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {task.targetDate}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onToggleTaskComplete(task.id);
                      playSound('complete');
                    }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Done' : 'Check'}</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
