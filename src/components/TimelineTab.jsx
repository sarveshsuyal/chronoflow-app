import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Anchor,
  AlertCircle,
  Timer,
  ChevronRight,
  Maximize2,
  Lock,
  Edit2,
  Check,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatTime12, timeToMinutes } from '../utils/scheduler';
import { playSound } from '../utils/sound';

export const TimelineTab = ({
  timelineItems,
  onAutoArrange,
  onToggleTaskComplete,
  onToggleRoutineComplete,
  onOpenFocusModal,
  onOpenTaskModal,
  onUpdateItemTime,
}) => {
  // Focus Timer state
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Inline time editing state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [isEditingFocusTimer, setIsEditingFocusTimer] = useState(false);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(25);

  // Find next or currently active item based on current time
  useEffect(() => {
    if (!activeTimerTask) {
      const firstUncompleted = timelineItems.find(
        (item) => !item.completed && item.scheduledStart
      );
      if (firstUncompleted) {
        setActiveTimerTask(firstUncompleted);
        setTimerSecondsLeft((firstUncompleted.durationMinutes || 30) * 60);
      }
    }
  }, [timelineItems, activeTimerTask]);

  // Timer interval tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playSound('celebrate');
      confetti({ particleCount: 100, spread: 70 });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  const handleStartTimer = (task) => {
    setActiveTimerTask(task);
    setTimerSecondsLeft((task.durationMinutes || 30) * 60);
    setIsTimerRunning(true);
    playSound('start');
  };

  const handleTogglePlayPause = () => {
    setIsTimerRunning(!isTimerRunning);
    if (!isTimerRunning) {
      playSound('start');
    }
  };

  const handleCompleteActive = () => {
    if (activeTimerTask) {
      if (activeTimerTask.isRoutine) {
        onToggleRoutineComplete(activeTimerTask.id);
      } else {
        onToggleTaskComplete(activeTimerTask.id);
      }
      setIsTimerRunning(false);
      playSound('complete');
      confetti({ particleCount: 90, spread: 60 });
    }
  };

  const formatTimerClock = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveInlineTime = (itemId, isRoutine) => {
    if (onUpdateItemTime && editStartTime && editEndTime) {
      onUpdateItemTime(itemId, isRoutine, editStartTime, editEndTime);
    }
    setEditingItemId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Auto-Arranger Callout + Action */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-white">Smart Auto-Arranger</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Have ad-hoc tasks? Click Auto-Arrange to automatically weave them into open time slots around your daily routines without conflicts!
          </p>
        </div>

        <button
          onClick={onAutoArrange}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 active:scale-95 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Auto-Arrange Today</span>
        </button>
      </div>

      {/* Active Focus Card */}
      {activeTimerTask && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Timer className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Focus Zone
                </span>

                {/* Inline Time Editor for Focus Card */}
                {editingItemId === activeTimerTask.id ? (
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-indigo-500/50">
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs px-1.5 py-0.5 rounded text-white focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-slate-500 text-xs">-</span>
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs px-1.5 py-0.5 rounded text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleSaveInlineTime(activeTimerTask.id, activeTimerTask.isRoutine)}
                      className="px-2 py-0.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingItemId(null)}
                      className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingItemId(activeTimerTask.id);
                      setEditStartTime(activeTimerTask.scheduledStart || activeTimerTask.startTime || '09:00');
                      setEditEndTime(activeTimerTask.scheduledEnd || activeTimerTask.endTime || '10:00');
                    }}
                    className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white bg-slate-950/80 hover:bg-indigo-600/20 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition group cursor-pointer"
                    title="Click to manually edit scheduled time"
                  >
                    <span>
                      {formatTime12(activeTimerTask.scheduledStart || activeTimerTask.startTime)} - {formatTime12(activeTimerTask.scheduledEnd || activeTimerTask.endTime)}
                    </span>
                    <Edit2 className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition" />
                  </button>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {activeTimerTask.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Quick Timer Adjust (-5m, Clock, +5m) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTimerSecondsLeft((prev) => Math.max(60, prev - 300))}
                className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono border border-slate-800 transition"
                title="Subtract 5 minutes"
              >
                -5m
              </button>

              {isEditingFocusTimer ? (
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-indigo-500">
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={customTimerMinutes}
                    onChange={(e) => setCustomTimerMinutes(Number(e.target.value))}
                    className="w-14 bg-slate-900 border border-slate-700 text-indigo-300 text-center font-mono font-bold rounded py-0.5 text-sm"
                  />
                  <span className="text-xs text-slate-400">m</span>
                  <button
                    onClick={() => {
                      setTimerSecondsLeft(customTimerMinutes * 60);
                      setIsEditingFocusTimer(false);
                    }}
                    className="px-2 py-0.5 text-xs bg-indigo-600 text-white rounded font-medium"
                  >
                    Set
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setCustomTimerMinutes(Math.round(timerSecondsLeft / 60));
                    setIsEditingFocusTimer(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-2xl font-bold text-indigo-300 tracking-wider cursor-pointer hover:border-indigo-500/50 transition"
                  title="Click to type custom minutes"
                >
                  {formatTimerClock(timerSecondsLeft)}
                </div>
              )}

              <button
                onClick={() => setTimerSecondsLeft((prev) => prev + 300)}
                className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono border border-slate-800 transition"
                title="Add 5 minutes"
              >
                +5m
              </button>
            </div>

            {/* Play/Pause */}
            <button
              onClick={handleTogglePlayPause}
              className={`p-3 rounded-xl transition ${
                isTimerRunning
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
              }`}
              title={isTimerRunning ? 'Pause' : 'Start Focus'}
            >
              {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Mark complete */}
            <button
              onClick={handleCompleteActive}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30"
              title="Mark as Done"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>

            {/* Fullscreen focus modal */}
            <button
              onClick={() => onOpenFocusModal(activeTimerTask)}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
              title="Expand Full Focus Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hourly Timeline Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Today's Flow ({timelineItems.length} Blocks)
          </h3>
          <span className="text-xs text-slate-500">
            Routines locked • Ad-hoc slotted
          </span>
        </div>

        {timelineItems.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 font-medium">No items scheduled for today yet.</p>
            <p className="text-slate-500 text-xs mt-1">Add a task and hit "Auto-Arrange Today"!</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 space-y-4 py-2">
            {timelineItems.map((item, index) => {
              const isRoutine = Boolean(item.isRoutine);
              const startStr = item.scheduledStart || item.startTime;
              const endStr = item.scheduledEnd || item.endTime;
              const duration = item.durationMinutes || (startStr && endStr ? timeToMinutes(endStr) - timeToMinutes(startStr) : 30);
              const isCompleted = item.completed;
              const isCurrent = activeTimerTask?.id === item.id;
              const isInlineEditing = editingItemId === item.id;

              return (
                <div key={item.id || index} className="relative pl-6 sm:pl-8 group">
                  
                  {/* Timeline Node Icon */}
                  <div
                    className={`absolute -left-[17px] top-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                      isCompleted
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                        : isRoutine
                        ? 'bg-amber-950/80 border-amber-500/80 text-amber-400'
                        : 'bg-slate-900 border-indigo-500 text-indigo-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                    ) : isRoutine ? (
                      <Anchor className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Card Block */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : isCurrent
                        ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-950/40'
                        : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          
                          {/* Time display or inline editor */}
                          {isInlineEditing ? (
                            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-indigo-500">
                              <input
                                type="time"
                                value={editStartTime}
                                onChange={(e) => setEditStartTime(e.target.value)}
                                className="bg-slate-900 text-xs px-1 py-0.5 rounded text-white"
                              />
                              <span className="text-slate-500 text-xs">-</span>
                              <input
                                type="time"
                                value={editEndTime}
                                onChange={(e) => setEditEndTime(e.target.value)}
                                className="bg-slate-900 text-xs px-1 py-0.5 rounded text-white"
                              />
                              <button
                                onClick={() => handleSaveInlineTime(item.id, isRoutine)}
                                className="px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="text-slate-400 hover:text-white px-1 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditStartTime(startStr || '09:00');
                                setEditEndTime(endStr || '10:00');
                              }}
                              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 font-mono bg-slate-950 hover:bg-indigo-600/20 hover:text-white px-2 py-0.5 rounded border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer group/time"
                              title="Click to edit manual time"
                            >
                              <span>{formatTime12(startStr)} - {formatTime12(endStr)}</span>
                              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover/time:text-indigo-400" />
                            </button>
                          )}

                          <span className="text-[11px] text-slate-400 font-medium">
                            ({duration} mins)
                          </span>

                          {isRoutine && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Fixed Routine
                            </span>
                          )}

                          {item.isLocked && !isRoutine && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Manual Locked
                            </span>
                          )}

                          {item.autoScheduled && !isRoutine && !item.isLocked && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Auto-Arranged
                            </span>
                          )}

                          {item.priority === 'high' && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              High
                            </span>
                          )}

                          {item.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {item.category}
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-base font-semibold ${
                            isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        {!isCompleted && (
                          <button
                            onClick={() => handleStartTimer(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition"
                          >
                            <Play className="w-3 h-3 fill-current text-indigo-400" />
                            <span>Focus</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (isRoutine) {
                              onToggleRoutineComplete(item.id);
                            } else {
                              onToggleTaskComplete(item.id);
                            }
                            playSound('complete');
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCompleted ? 'Done' : 'Complete'}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
