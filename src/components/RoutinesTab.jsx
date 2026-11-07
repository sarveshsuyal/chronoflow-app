import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Clock,
  CheckCircle2,
  Lock,
  Trash2,
  Edit2,
  Sparkles,
  Info,
} from 'lucide-react';
import { formatTime12 } from '../utils/scheduler';
import { playSound } from '../utils/sound';

export const RoutinesTab = ({
  routines,
  onToggleRoutineComplete,
  onToggleRoutineActive,
  onAddRoutine,
  onDeleteRoutine,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('08:45');
  const [newCategory, setNewCategory] = useState('Health');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddRoutine({
      id: `r-${Date.now()}`,
      title: newTitle.trim(),
      startTime: newStart,
      endTime: newEnd,
      category: newCategory,
      isFixed: true,
      active: true,
      completed: false,
    });

    setNewTitle('');
    setShowAddModal(false);
    playSound('start');
  };

  return (
    <div className="space-y-6">
      
      {/* Intro info box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 mt-0.5">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Daily Routines & Habit Anchors
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              These recurring habits are locked blocks in your day. The smart scheduler will weave your unpredictable ad-hoc tasks safely around these anchors so your work gets done without sacrificing your health, lunch, or personal routines.
            </p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Active Routines ({routines.filter((r) => r.active).length})
          </h3>
          <p className="text-xs text-slate-500">Resets automatically every new day</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Routine</span>
        </button>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routines.map((routine) => {
          const isCompleted = routine.completed;
          const isActive = routine.active;

          return (
            <div
              key={routine.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                !isActive
                  ? 'bg-slate-900/30 border-slate-800 opacity-50'
                  : isCompleted
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40 shadow-md shadow-slate-950/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {formatTime12(routine.startTime)} - {formatTime12(routine.endTime)}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {routine.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleRoutineActive(routine.id)}
                      className={`text-xs px-2 py-0.5 rounded transition ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isActive ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => onDeleteRoutine(routine.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                      title="Delete routine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4
                  className={`text-base font-semibold ${
                    isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                  }`}
                >
                  {routine.title}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-500">
                  <Lock className="w-3 h-3 text-amber-500" />
                  Locked Anchor
                </span>

                <button
                  onClick={() => {
                    onToggleRoutineComplete(routine.id);
                    playSound('complete');
                  }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isCompleted ? 'Done Today' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Routine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Repeat className="w-5 h-5 text-indigo-400" />
                Add Daily Routine Anchor
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym & Cardio, Reading, Lunch"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Health">Health & Fitness</option>
                  <option value="Work">Work & Standup</option>
                  <option value="Learning">Learning & Study</option>
                  <option value="Mindset">Mindset & Mindfulness</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  Create Anchor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
