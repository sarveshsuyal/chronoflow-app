// Smart Scheduler & Auto-Arrangement Engine

// Helper: Convert "HH:mm" to minutes from midnight
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h * 60) + (m || 0);
};

// Helper: Convert minutes from midnight to "HH:mm"
export const minutesToTime = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.floor(totalMinutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Helper: Convert "HH:mm" to 12-hour format like "09:30 AM"
export const formatTime12 = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${(m || 0).toString().padStart(2, '0')} ${period}`;
};

/**
 * Auto-Arranges tasks into the day's timeline without overlapping fixed routines!
 * 
 * @param {Array} tasks - List of all user tasks
 * @param {Array} routines - List of recurring daily routines (e.g. Workout, Lunch, Sleep)
 * @param {Object} options - Working hours & buffer settings
 * @returns {Array} Updated tasks with auto-calculated scheduledStart & scheduledEnd
 */
export const autoArrangeSchedule = (
  tasks,
  routines,
  options = { dayStart: '08:00', dayEnd: '22:00', bufferMinutes: 10 }
) => {
  const dayStartMin = timeToMinutes(options.dayStart);
  const dayEndMin = timeToMinutes(options.dayEnd);
  const buffer = options.bufferMinutes;

  // 1. Gather all immovable/fixed blocks (Fixed Routines & Locked Events)
  const occupiedSlots = [];

  // Routines that have a fixed time
  routines.forEach((r) => {
    if (r.active !== false && r.startTime && r.endTime) {
      const start = timeToMinutes(r.startTime);
      const end = timeToMinutes(r.endTime);
      if (end > start) {
        occupiedSlots.push({
          start,
          end,
          title: r.title,
          isRoutine: true,
        });
      }
    }
  });

  // Locked tasks that user already anchored manually
  tasks.forEach((t) => {
    if (t.isLocked && t.scheduledStart && t.scheduledEnd && !t.completed) {
      const start = timeToMinutes(t.scheduledStart);
      const end = timeToMinutes(t.scheduledEnd);
      if (end > start) {
        occupiedSlots.push({
          start,
          end,
          title: t.title,
          isUserLocked: true,
        });
      }
    }
  });

  // Sort occupied blocks by start time
  occupiedSlots.sort((a, b) => a.start - b.start);

  // 2. Compute available free intervals in the day
  let freeIntervals = [];
  let currentPointer = dayStartMin;

  for (const block of occupiedSlots) {
    if (block.start > currentPointer) {
      freeIntervals.push({
        start: currentPointer,
        end: Math.min(block.start, dayEndMin),
      });
    }
    currentPointer = Math.max(currentPointer, block.end);
    if (currentPointer >= dayEndMin) break;
  }

  if (currentPointer < dayEndMin) {
    freeIntervals.push({
      start: currentPointer,
      end: dayEndMin,
    });
  }

  // Filter out tiny slivers less than 15 mins
  freeIntervals = freeIntervals.filter((i) => i.end - i.start >= 15);

  // 3. Filter tasks that need scheduling for today
  // Exclude completed tasks and already locked tasks
  const candidateTasks = tasks.filter(
    (t) => !t.completed && !t.isLocked && t.type !== 'routine'
  );

  // Define priority weights
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  // Preferred window definition in minutes
  const windowRanges = {
    morning: { start: timeToMinutes('08:00'), end: timeToMinutes('12:00') },
    afternoon: { start: timeToMinutes('12:00'), end: timeToMinutes('17:00') },
    evening: { start: timeToMinutes('17:00'), end: timeToMinutes('22:00') },
    anytime: { start: dayStartMin, end: dayEndMin },
  };

  // Sort candidates by priority (high first), then duration
  const sortedCandidates = [...candidateTasks].sort((a, b) => {
    const pA = priorityWeight[a.priority] || 2;
    const pB = priorityWeight[b.priority] || 2;
    if (pB !== pA) return pB - pA;
    // Prefer shorter tasks first or user preference
    return (a.durationMinutes || 30) - (b.durationMinutes || 30);
  });

  // Map to store assigned times
  const assignedMap = {};

  // 4. Slot tasks into best fitting intervals
  for (const task of sortedCandidates) {
    const duration = task.durationMinutes || 30;
    const prefWindow = windowRanges[task.preferredWindow] || windowRanges.anytime;

    let placed = false;

    // First pass: Try to find a slot inside the preferred window
    for (let i = 0; i < freeIntervals.length; i++) {
      const interval = freeIntervals[i];
      // Check overlap between interval and preferred window
      const effectiveStart = Math.max(interval.start, prefWindow.start);
      const effectiveEnd = Math.min(interval.end, prefWindow.end);

      if (effectiveEnd - effectiveStart >= duration) {
        // Place task here!
        const taskStart = effectiveStart;
        const taskEnd = taskStart + duration;

        assignedMap[task.id] = {
          scheduledStart: minutesToTime(taskStart),
          scheduledEnd: minutesToTime(taskEnd),
        };

        // Update freeIntervals
        const newIntervals = [];
        if (taskStart > interval.start) {
          newIntervals.push({ start: interval.start, end: taskStart });
        }
        const nextAvailStart = taskEnd + buffer;
        if (interval.end > nextAvailStart) {
          newIntervals.push({ start: nextAvailStart, end: interval.end });
        }
        freeIntervals.splice(i, 1, ...newIntervals);
        placed = true;
        break;
      }
    }

    // Second pass: If not placed in preferred window, place in ANY available free slot
    if (!placed) {
      for (let i = 0; i < freeIntervals.length; i++) {
        const interval = freeIntervals[i];
        if (interval.end - interval.start >= duration) {
          const taskStart = interval.start;
          const taskEnd = taskStart + duration;

          assignedMap[task.id] = {
            scheduledStart: minutesToTime(taskStart),
            scheduledEnd: minutesToTime(taskEnd),
          };

          const newIntervals = [];
          const nextAvailStart = taskEnd + buffer;
          if (interval.end > nextAvailStart) {
            newIntervals.push({ start: nextAvailStart, end: interval.end });
          }
          freeIntervals.splice(i, 1, ...newIntervals);
          placed = true;
          break;
        }
      }
    }
  }

  // Return new tasks array with updated schedule times
  return tasks.map((task) => {
    if (assignedMap[task.id]) {
      return {
        ...task,
        ...assignedMap[task.id],
        autoScheduled: true,
      };
    }
    return task;
  });
};
