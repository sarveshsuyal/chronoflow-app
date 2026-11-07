import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TimelineTab } from './components/TimelineTab';
import { TaskOrganizerTab } from './components/TaskOrganizerTab';
import { RoutinesTab } from './components/RoutinesTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { TaskModal } from './components/TaskModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import {
  loadInitialState,
  saveState,
  STORAGE_KEYS,
  getTodayDateString,
  checkDayRollover,
} from './utils/storage';
import { autoArrangeSchedule, timeToMinutes } from './utils/scheduler';
import { playSound } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [tasks, setTasks] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [analytics, setAnalytics] = useState({ streak: 1, history: [] });
  const [archive, setArchive] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [focusTask, setFocusTask] = useState(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize data on mount
  useEffect(() => {
    const state = loadInitialState();
    setTasks(state.tasks || []);
    setRoutines(state.routines || []);
    setAnalytics(state.analytics || { streak: 1, history: [] });
    setArchive(state.archive || []);

    if (state.rolledOver) {
      triggerToast('🌅 Good morning! Daily routines refreshed & past events archived.');
    }
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync to localStorage
  const updateTasks = (newTasks) => {
    setTasks(newTasks);
    saveState(STORAGE_KEYS.TASKS, newTasks);
  };

  const updateRoutines = (newRoutines) => {
    setRoutines(newRoutines);
    saveState(STORAGE_KEYS.ROUTINES, newRoutines);
  };

  const updateAnalytics = (newAnalytics) => {
    setAnalytics(newAnalytics);
    saveState(STORAGE_KEYS.ANALYTICS, newAnalytics);
  };

  const updateArchive = (newArchive) => {
    setArchive(newArchive);
    saveState(STORAGE_KEYS.ARCHIVE, newArchive);
  };

  // Filter tasks that belong to today
  const todayDateStr = getTodayDateString();
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.type === 'event') {
        return !t.targetDate || t.targetDate === todayDateStr;
      }
      return true; // General backlog tasks can be scheduled today
    });
  }, [tasks, todayDateStr]);

  // Combined and sorted timeline items (Routines + Scheduled Tasks)
  const timelineItems = useMemo(() => {
    const items = [];

    // 1. Add active routines
    routines.forEach((r) => {
      if (r.active !== false && r.startTime) {
        items.push({
          ...r,
          isRoutine: true,
          scheduledStart: r.startTime,
          scheduledEnd: r.endTime,
        });
      }
    });

    // 2. Add scheduled tasks
    todayTasks.forEach((t) => {
      if (t.scheduledStart) {
        items.push({
          ...t,
          isRoutine: false,
        });
      }
    });

    // Sort chronologically by start time
    return items.sort((a, b) => {
      const minA = timeToMinutes(a.scheduledStart);
      const minB = timeToMinutes(b.scheduledStart);
      return minA - minB;
    });
  }, [routines, todayTasks]);

  // Auto-Arrange Schedule Handler
  const handleAutoArrange = () => {
    const scheduled = autoArrangeSchedule(tasks, routines);
    updateTasks(scheduled);
    playSound('start');
    confetti({ particleCount: 70, spread: 60 });
    triggerToast('✨ Schedule auto-optimized! Ad-hoc tasks arranged around your routines.');
  };

  // Toggle Task Completion
  const handleToggleTaskComplete = (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          confetti({ particleCount: 80, spread: 60 });
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    });
    updateTasks(updated);
  };

  // Toggle Routine Completion
  const handleToggleRoutineComplete = (routineId) => {
    const updated = routines.map((r) => {
      if (r.id === routineId) {
        const nextCompleted = !r.completed;
        if (nextCompleted) {
          confetti({ particleCount: 80, spread: 60 });
        }
        return { ...r, completed: nextCompleted };
      }
      return r;
    });
    updateRoutines(updated);
  };

  // Toggle Routine Active
  const handleToggleRoutineActive = (routineId) => {
    const updated = routines.map((r) => {
      if (r.id === routineId) {
        return { ...r, active: !r.active };
      }
      return r;
    });
    updateRoutines(updated);
  };

  // Quick manual update of scheduled time (from Focus card or Timeline)
  const handleUpdateItemTime = (itemId, isRoutine, newStart, newEnd) => {
    if (isRoutine) {
      const updated = routines.map((r) => {
        if (r.id === itemId) {
          return { ...r, startTime: newStart, endTime: newEnd };
        }
        return r;
      });
      updateRoutines(updated);
    } else {
      const updated = tasks.map((t) => {
        if (t.id === itemId) {
          return {
            ...t,
            scheduledStart: newStart,
            scheduledEnd: newEnd,
            isLocked: true,
            autoScheduled: false,
          };
        }
        return t;
      });
      updateTasks(updated);
    }
    triggerToast('Manual time updated and locked in schedule!');
  };

  // Add / Edit Task
  const handleSaveTask = (taskPayload) => {
    const existingIndex = tasks.findIndex((t) => t.id === taskPayload.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...tasks];
      updated[existingIndex] = taskPayload;
    } else {
      updated = [taskPayload, ...tasks];
    }
    // Automatically auto-arrange so the new task gets an immediate smart time slot!
    const autoArranged = autoArrangeSchedule(updated, routines);
    updateTasks(autoArranged);
    triggerToast('Task saved and smartly placed in today\'s schedule!');
  };

  // Delete Task
  const handleDeleteTask = (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    updateTasks(updated);
  };

  // Add Routine
  const handleAddRoutine = (routinePayload) => {
    const updated = [...routines, routinePayload];
    updateRoutines(updated);
    // Re-arrange schedule so ad-hoc tasks yield to the new routine anchor
    const rearranged = autoArrangeSchedule(tasks, updated);
    updateTasks(rearranged);
    triggerToast('Routine anchor created! Tasks readjusted around it.');
  };

  // Delete Routine
  const handleDeleteRoutine = (routineId) => {
    const updated = routines.filter((r) => r.id !== routineId);
    updateRoutines(updated);
  };

  // End Day & Rollover
  const handleEndDay = () => {
    const today = getTodayDateString();
    const completedTasksCount = tasks.filter((t) => t.completed).length;
    const completedRoutinesCount = routines.filter((r) => r.completed).length;
    const totalItems = tasks.length + routines.length;
    const totalDone = completedTasksCount + completedRoutinesCount;
    const rate = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

    const newHistory = [
      ...(analytics.history || []),
      {
        date: today,
        completed: totalDone,
        total: totalItems,
        rate,
        focusMinutes: Math.round(
          tasks.reduce((acc, t) => acc + (t.timeSpentSeconds || 0), 0) / 60
        ),
      },
    ];

    const newStreak = rate >= 60 ? (analytics.streak || 0) + 1 : 1;
    const newBestStreak = Math.max(analytics.bestStreak || 0, newStreak);

    // Filter day-specific tasks that disappear
    const remainingTasks = [];
    const newArchived = [...archive];

    tasks.forEach((t) => {
      if (t.autoDisappearOnDayEnd || t.type === 'event') {
        newArchived.push({
          ...t,
          archivedOn: today,
          autoExpired: !t.completed,
        });
      } else {
        remainingTasks.push({
          ...t,
          scheduledStart: null,
          scheduledEnd: null,
          autoScheduled: false,
        });
      }
    });

    // Reset daily routines
    const refreshedRoutines = routines.map((r) => ({
      ...r,
      completed: false,
    }));

    const updatedAnalytics = {
      ...analytics,
      streak: newStreak,
      bestStreak: newBestStreak,
      history: newHistory,
    };

    updateTasks(remainingTasks);
    updateRoutines(refreshedRoutines);
    updateAnalytics(updatedAnalytics);
    updateArchive(newArchived);

    triggerToast('🎉 Day successfully logged! Event tasks archived, routines reset for tomorrow.');
  };

  // Modal open helpers
  const handleOpenTaskModal = (taskToEdit = null) => {
    setEditingTask(taskToEdit);
    setIsTaskModalOpen(true);
  };

  const handleOpenFocusModal = (task) => {
    setFocusTask(task);
    setIsFocusModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-indigo-600 text-white font-medium text-xs sm:text-sm shadow-2xl shadow-indigo-600/40 border border-indigo-400/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toastMessage}
        </div>
      )}

      {/* App Header */}
      <Header
        analytics={analytics}
        todayTasks={todayTasks}
        onOpenTaskModal={() => handleOpenTaskModal(null)}
        onEndDay={handleEndDay}
      />

      {/* Tabs Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          scheduledToday: timelineItems.filter((i) => !i.completed).length,
          pendingTasks: tasks.filter((t) => !t.completed).length,
          routines: routines.filter((r) => r.active).length,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'timeline' && (
          <TimelineTab
            timelineItems={timelineItems}
            onAutoArrange={handleAutoArrange}
            onToggleTaskComplete={handleToggleTaskComplete}
            onToggleRoutineComplete={handleToggleRoutineComplete}
            onOpenFocusModal={handleOpenFocusModal}
            onOpenTaskModal={() => handleOpenTaskModal(null)}
            onUpdateItemTime={handleUpdateItemTime}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskOrganizerTab
            tasks={tasks}
            onToggleTaskComplete={handleToggleTaskComplete}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleOpenTaskModal}
            onOpenTaskModal={() => handleOpenTaskModal(null)}
          />
        )}

        {activeTab === 'routines' && (
          <RoutinesTab
            routines={routines}
            onToggleRoutineComplete={handleToggleRoutineComplete}
            onToggleRoutineActive={handleToggleRoutineActive}
            onAddRoutine={handleAddRoutine}
            onDeleteRoutine={handleDeleteRoutine}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            analytics={analytics}
            archive={archive}
            todayTasks={todayTasks}
            routines={routines}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        editingTask={editingTask}
      />

      {/* Distraction-Free Focus Timer Modal */}
      <FocusTimerModal
        task={focusTask}
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        onCompleteTask={(taskId) => {
          handleToggleTaskComplete(taskId);
          setIsFocusModalOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        ChronoFlow Smart Time OS • Zero-overlap scheduling & habit anchors
      </footer>
    </div>
  );
}
