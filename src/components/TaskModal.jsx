import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Calendar,
  Tag,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Sliders,
  Lock,
} from 'lucide-react';
import { getTodayDateString } from '../utils/storage';
import { timeToMinutes, minutesToTime } from '../utils/scheduler';
import { playSound } from '../utils/sound';

export const TaskModal = ({ isOpen, onClose, onSaveTask, editingTask }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [priority, setPriority] = useState('medium');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [customDuration, setCustomDuration] = useState(false);
  const [type, setType] = useState('event'); // 'event' or 'general'
  const [schedulingMode, setSchedulingMode] = useState('auto'); // 'auto' or 'manual'
  const [preferredWindow, setPreferredWindow] = useState('morning');
  const [manualStart, setManualStart] = useState('10:00');
  const [manualEnd, setManualEnd] = useState('10:30');
  const [targetDate, setTargetDate] = useState(getTodayDateString());
  const [autoDisappear, setAutoDisappear] = useState(true);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setCategory(editingTask.category || 'Engineering');
      setPriority(editingTask.priority || 'medium');
      setDurationMinutes(editingTask.durationMinutes || 30);
      setType(editingTask.type || 'event');
      setTargetDate(editingTask.targetDate || getTodayDateString());
      setAutoDisappear(editingTask.autoDisappearOnDayEnd !== false);

      if (editingTask.isLocked && editingTask.scheduledStart) {
        setSchedulingMode('manual');
        setManualStart(editingTask.scheduledStart);
        setManualEnd(editingTask.scheduledEnd || minutesToTime(timeToMinutes(editingTask.scheduledStart) + (editingTask.durationMinutes || 30)));
      } else {
        setSchedulingMode('auto');
        setPreferredWindow(editingTask.preferredWindow || 'morning');
      }
    } else {
      setTitle('');
      setCategory('Engineering');
      setPriority('medium');
      setDurationMinutes(30);
      setCustomDuration(false);
      setType('event');
      setSchedulingMode('auto');
      setPreferredWindow('morning');
      setManualStart('10:00');
      setManualEnd('10:30');
      setTargetDate(getTodayDateString());
      setAutoDisappear(true);
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  // When manual start time or duration changes, recalculate manual end time
  const handleStartChange = (newStart) => {
    setManualStart(newStart);
    const startMin = timeToMinutes(newStart);
    setManualEnd(minutesToTime(startMin + Number(durationMinutes)));
  };

  const handleDurationChange = (newDuration) => {
    setDurationMinutes(Number(newDuration));
    if (schedulingMode === 'manual') {
      const startMin = timeToMinutes(manualStart);
      setManualEnd(minutesToTime(startMin + Number(newDuration)));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const isManual = schedulingMode === 'manual';
    const computedDuration = isManual
      ? Math.max(10, timeToMinutes(manualEnd) - timeToMinutes(manualStart))
      : Number(durationMinutes);

    const taskPayload = {
      id: editingTask?.id || `t-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'General',
      priority,
      durationMinutes: computedDuration,
      type,
      schedulingMode,
      preferredWindow: isManual ? 'custom' : preferredWindow,
      targetDate: type === 'event' ? targetDate : '',
      autoDisappearOnDayEnd: type === 'event' ? autoDisappear : false,
      completed: editingTask?.completed || false,
      timeSpentSeconds: editingTask?.timeSpentSeconds || 0,
      isLocked: isManual, // Locked so auto-arranger never displaces it!
      scheduledStart: isManual ? manualStart : (editingTask?.scheduledStart || null),
      scheduledEnd: isManual ? manualEnd : (editingTask?.scheduledEnd || null),
      autoScheduled: !isManual,
    };

    onSaveTask(taskPayload);
    playSound('start');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base px-2 py-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-sm">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Prepare system test cases, Write documentation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Behavior / Isolation Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Behavior
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setType('event')}
                className={`p-3 rounded-xl border text-left transition ${
                  type === 'event'
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Specific Day / Event</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Bound to a date. Auto-disappears when the day passes so regular routines stay protected.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('general')}
                className={`p-3 rounded-xl border text-left transition ${
                  type === 'general'
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>General Backlog</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Persistent backlog task. Carries forward until finished.
                </p>
              </button>
            </div>
          </div>

          {/* Target Date if event type */}
          {type === 'event' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="autoDisappear"
                  checked={autoDisappear}
                  onChange={(e) => setAutoDisappear(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="autoDisappear" className="text-xs text-slate-300">
                  Auto-disappear when day ends
                </label>
              </div>
            </div>
          )}

          {/* Time Scheduling Mode: Smart Auto vs Manual Exact */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Time Scheduling Method
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSchedulingMode('auto')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  schedulingMode === 'auto'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Auto-Arrange (Smart)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSchedulingMode('manual');
                  const startMin = timeToMinutes(manualStart);
                  setManualEnd(minutesToTime(startMin + Number(durationMinutes)));
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  schedulingMode === 'manual'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>⏰ Manual Exact Time</span>
              </button>
            </div>

            {/* If Auto Mode: Preferred window */}
            {schedulingMode === 'auto' ? (
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Preferred Time Window
                </label>
                <select
                  value={preferredWindow}
                  onChange={(e) => setPreferredWindow(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="morning">Morning (08:00 - 12:00)</option>
                  <option value="afternoon">Afternoon (12:00 - 17:00)</option>
                  <option value="evening">Evening (17:00 - 22:00)</option>
                  <option value="anytime">Anytime (Smart fit into any open slot)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  The auto-arranger will place this task into the best free gap in this window without overlapping your routines.
                </p>
              </div>
            ) : (
              /* If Manual Mode: Exact Start & End Time */
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={manualStart}
                      onChange={(e) => handleStartChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={manualEnd}
                      onChange={(e) => setManualEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                  <Lock className="w-3 h-3" />
                  <span>Locked Block: Auto-arranger will protect this exact time slot.</span>
                </div>
              </div>
            )}
          </div>

          {/* Duration & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Duration (Mins)
                </label>
                <button
                  type="button"
                  onClick={() => setCustomDuration(!customDuration)}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  {customDuration ? 'Presets' : 'Custom'}
                </button>
              </div>

              {customDuration ? (
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={durationMinutes}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="Minutes"
                />
              ) : (
                <select
                  value={durationMinutes}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value={15}>15 Minutes (Quick sprint)</option>
                  <option value={25}>25 Minutes (Pomodoro)</option>
                  <option value={30}>30 Minutes (Standard)</option>
                  <option value={45}>45 Minutes (Focus block)</option>
                  <option value={60}>60 Minutes (1 Hour Deep)</option>
                  <option value={90}>90 Minutes (Long session)</option>
                  <option value={120}>120 Minutes (2 Hours)</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="high">High (Top Priority)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="low">Low (Flexible)</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Engineering, Study, Health, Personal"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95 transition"
            >
              {editingTask ? 'Update Task' : 'Save Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
