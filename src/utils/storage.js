// Storage, Day Rollover, and State Persistence Manager

const STORAGE_KEYS = {
  TASKS: 'chronoflow_tasks_v1',
  ROUTINES: 'chronoflow_routines_v1',
  ANALYTICS: 'chronoflow_analytics_v1',
  ARCHIVE: 'chronoflow_archived_v1',
  LAST_ACTIVE_DATE: 'chronoflow_last_date_v1',
  USER_SETTINGS: 'chronoflow_settings_v1',
};

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initial Seed Data for immediate awesome first-run experience
const DEFAULT_ROUTINES = [
  {
    id: 'r-1',
    title: 'Morning Fuel & Stretch',
    startTime: '07:30',
    endTime: '08:15',
    category: 'Health',
    color: '#10b981', // Emerald
    isFixed: true,
    active: true,
    completed: true,
  },
  {
    id: 'r-2',
    title: 'Daily Standup & Goal Setting',
    startTime: '09:00',
    endTime: '09:30',
    category: 'Work',
    color: '#6366f1', // Indigo
    isFixed: true,
    active: true,
    completed: true,
  },
  {
    id: 'r-3',
    title: 'Lunch & Power Walk',
    startTime: '13:00',
    endTime: '13:45',
    category: 'Health',
    color: '#f59e0b', // Amber
    isFixed: true,
    active: true,
    completed: false,
  },
  {
    id: 'r-4',
    title: 'Evening Decompress & Reading',
    startTime: '20:30',
    endTime: '21:15',
    category: 'Mindset',
    color: '#8b5cf6', // Purple
    isFixed: true,
    active: true,
    completed: false,
  },
];

const DEFAULT_TASKS = [
  {
    id: 't-1',
    title: 'Audit Intrusion Detection Architecture',
    category: 'Engineering',
    priority: 'high',
    durationMinutes: 45,
    preferredWindow: 'morning',
    scheduledStart: '09:45',
    scheduledEnd: '10:30',
    type: 'event', // event / specific day
    targetDate: getTodayDateString(),
    completed: true,
    timeSpentSeconds: 2700,
    autoDisappearOnDayEnd: true,
  },
  {
    id: 't-2',
    title: 'Refactor Model Inference Pipeline',
    category: 'Coding',
    priority: 'high',
    durationMinutes: 60,
    preferredWindow: 'morning',
    scheduledStart: '10:45',
    scheduledEnd: '11:45',
    type: 'event',
    targetDate: getTodayDateString(),
    completed: false,
    timeSpentSeconds: 900,
    autoDisappearOnDayEnd: true,
  },
  {
    id: 't-3',
    title: 'Prepare OS Project Demo Slides',
    category: 'Academics',
    priority: 'medium',
    durationMinutes: 40,
    preferredWindow: 'afternoon',
    scheduledStart: '14:00',
    scheduledEnd: '14:40',
    type: 'event',
    targetDate: getTodayDateString(),
    completed: false,
    timeSpentSeconds: 0,
    autoDisappearOnDayEnd: true,
  },
  {
    id: 't-4',
    title: 'Review Machine Learning Test Coverage',
    category: 'Engineering',
    priority: 'low',
    durationMinutes: 30,
    preferredWindow: 'afternoon',
    scheduledStart: '15:00',
    scheduledEnd: '15:30',
    type: 'general',
    targetDate: '',
    completed: false,
    timeSpentSeconds: 0,
    autoDisappearOnDayEnd: false,
  },
  {
    id: 't-5',
    title: 'Submit Lab Report by 11:59 PM',
    category: 'Important',
    priority: 'high',
    durationMinutes: 45,
    preferredWindow: 'evening',
    scheduledStart: '18:00',
    scheduledEnd: '18:45',
    type: 'event',
    targetDate: getTodayDateString(),
    completed: false,
    timeSpentSeconds: 0,
    autoDisappearOnDayEnd: true,
  },
];

const DEFAULT_ANALYTICS = {
  streak: 4,
  bestStreak: 12,
  totalFocusedMinutes: 340,
  history: [
    { date: '2026-11-03', completed: 6, total: 7, rate: 85, focusMinutes: 180 },
    { date: '2026-11-04', completed: 5, total: 6, rate: 83, focusMinutes: 165 },
    { date: '2026-11-05', completed: 7, total: 8, rate: 87, focusMinutes: 210 },
    { date: '2026-11-06', completed: 6, total: 6, rate: 100, focusMinutes: 195 },
  ],
};

// Check and perform automatic day-rollover
export const checkDayRollover = (tasks, routines, analytics, archive) => {
  const today = getTodayDateString();
  const lastActive = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE);

  if (!lastActive) {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
    return { tasks, routines, analytics, archive, rolledOver: false };
  }

  // If date changed: Perform auto-disappear & routine refresh!
  if (lastActive !== today) {
    console.log(`[ChronoFlow] Day rollover detected: ${lastActive} -> ${today}`);

    // 1. Calculate stats for the elapsed day
    const completedTasksCount = tasks.filter((t) => t.completed).length;
    const completedRoutinesCount = routines.filter((r) => r.completed).length;
    const totalItems = tasks.length + routines.length;
    const totalDone = completedTasksCount + completedRoutinesCount;
    const rate = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

    const newHistory = [
      ...(analytics.history || []),
      {
        date: lastActive,
        completed: totalDone,
        total: totalItems,
        rate,
        focusMinutes: Math.round(
          tasks.reduce((acc, t) => acc + (t.timeSpentSeconds || 0), 0) / 60
        ),
      },
    ];

    // Update streak
    const newStreak = rate >= 60 ? (analytics.streak || 0) + 1 : 1;
    const newBestStreak = Math.max(analytics.bestStreak || 0, newStreak);

    // 2. Separate day-specific tasks that should DISAPPEAR
    const remainingTasks = [];
    const newArchived = [...(archive || [])];

    tasks.forEach((t) => {
      // Disappear if:
      // a) It's marked autoDisappearOnDayEnd
      // b) Or it is an event task targeting a past date
      const isPastEvent = t.type === 'event' && t.targetDate && t.targetDate < today;
      if (t.autoDisappearOnDayEnd || isPastEvent) {
        newArchived.push({
          ...t,
          archivedOn: lastActive,
          autoExpired: !t.completed,
        });
      } else {
        // Carry forward general backlog tasks
        remainingTasks.push({
          ...t,
          scheduledStart: null,
          scheduledEnd: null,
          autoScheduled: false,
        });
      }
    });

    // 3. Reset recurring routines for the fresh new day
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

    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(remainingTasks));
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(refreshedRoutines));
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(updatedAnalytics));
    localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(newArchived));

    return {
      tasks: remainingTasks,
      routines: refreshedRoutines,
      analytics: updatedAnalytics,
      archive: newArchived,
      rolledOver: true,
    };
  }

  return { tasks, routines, analytics, archive, rolledOver: false };
};

// Load state with fallback to defaults
export const loadInitialState = () => {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const savedRoutines = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    const savedAnalytics = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    const savedArchive = localStorage.getItem(STORAGE_KEYS.ARCHIVE);

    const tasks = savedTasks ? JSON.parse(savedTasks) : DEFAULT_TASKS;
    const routines = savedRoutines ? JSON.parse(savedRoutines) : DEFAULT_ROUTINES;
    const analytics = savedAnalytics ? JSON.parse(savedAnalytics) : DEFAULT_ANALYTICS;
    const archive = savedArchive ? JSON.parse(savedArchive) : [];

    return checkDayRollover(tasks, routines, analytics, archive);
  } catch (e) {
    console.error('Error loading initial state:', e);
    return {
      tasks: DEFAULT_TASKS,
      routines: DEFAULT_ROUTINES,
      analytics: DEFAULT_ANALYTICS,
      archive: [],
      rolledOver: false,
    };
  }
};

export const saveState = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
};

export { STORAGE_KEYS };
