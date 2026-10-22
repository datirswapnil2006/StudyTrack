import { minutesToDecimalHours, formatMinutesToHours } from './dateUtils';

/**
 * Calculates complete, transparent statistics and analytics from raw records.
 * Follows all transparent calculation rules strictly.
 */
export function calculateReportAnalytics({
  tasks = [],
  studyDays = [],
  mistakes = [],
  difficultTopics = [],
  revisions = [],
  startDate,
  endDate
}) {
  // 1. Task counts (filter out breaks from study counts or track explicitly)
  // Non-break tasks scheduled
  const studyTasks = tasks.filter((t) => t.subject !== 'Break');
  const allScheduledTasks = tasks.length;
  const totalStudyTasksScheduled = studyTasks.length;

  let completedTasks = 0;
  let partiallyCompletedTasks = 0;
  let missedTasks = 0;
  let inProgressTasks = 0;
  let notStartedTasks = 0;

  // Study Hours
  let plannedMinutes = 0;
  let actualMinutes = 0;

  // Questions
  let questionsPlanned = 0;
  let questionsAttempted = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;

  // Subject breakdown map
  const subjectMap = {};

  // Daily map
  const dailyMap = {};

  studyTasks.forEach((t) => {
    // Status
    if (t.is_completed || t.status === 'Completed') {
      completedTasks += 1;
    } else if (t.status === 'Partially Completed') {
      partiallyCompletedTasks += 1;
    } else if (t.status === 'Missed') {
      missedTasks += 1;
    } else if (t.status === 'In Progress') {
      inProgressTasks += 1;
    } else {
      notStartedTasks += 1;
    }

    // Durations
    const pMin = t.planned_duration_minutes || 0;
    const aMin = t.actual_duration_minutes || 0;
    plannedMinutes += pMin;
    actualMinutes += aMin;

    // Questions
    questionsPlanned += t.questions_planned || 0;
    questionsAttempted += t.questions_attempted || 0;
    correctAnswers += t.correct_answers || 0;
    incorrectAnswers += t.incorrect_answers || 0;

    // Subject breakdown
    const subj = t.subject || 'General';
    if (!subjectMap[subj]) {
      subjectMap[subj] = {
        subject: subj,
        totalTasks: 0,
        completedTasks: 0,
        plannedMinutes: 0,
        actualMinutes: 0,
        questionsAttempted: 0,
        correctAnswers: 0,
        incorrectAnswers: 0
      };
    }
    subjectMap[subj].totalTasks += 1;
    if (t.is_completed || t.status === 'Completed') {
      subjectMap[subj].completedTasks += 1;
    }
    subjectMap[subj].plannedMinutes += pMin;
    subjectMap[subj].actualMinutes += aMin;
    subjectMap[subj].questionsAttempted += t.questions_attempted || 0;
    subjectMap[subj].correctAnswers += t.correct_answers || 0;
    subjectMap[subj].incorrectAnswers += t.incorrect_answers || 0;

    // Daily breakdown
    const dateStr = t.date;
    if (dateStr) {
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          scheduled: 0,
          completed: 0,
          partiallyCompleted: 0,
          missed: 0,
          plannedMinutes: 0,
          actualMinutes: 0,
          questionsAttempted: 0,
          correctAnswers: 0
        };
      }
      dailyMap[dateStr].scheduled += 1;
      if (t.is_completed || t.status === 'Completed') dailyMap[dateStr].completed += 1;
      if (t.status === 'Partially Completed') dailyMap[dateStr].partiallyCompleted += 1;
      if (t.status === 'Missed') dailyMap[dateStr].missed += 1;
      dailyMap[dateStr].plannedMinutes += pMin;
      dailyMap[dateStr].actualMinutes += aMin;
      dailyMap[dateStr].questionsAttempted += t.questions_attempted || 0;
      dailyMap[dateStr].correctAnswers += t.correct_answers || 0;
    }
  });

  // Calculate completion percentage: completed / scheduled * 100
  const completionPercentage =
    totalStudyTasksScheduled > 0
      ? parseFloat(((completedTasks / totalStudyTasksScheduled) * 100).toFixed(1))
      : null; // Display N/A if 0

  // Calculate accuracy percentage: correct / (correct + incorrect) * 100
  const totalGradedQuestions = correctAnswers + incorrectAnswers;
  const accuracyPercentage =
    totalGradedQuestions > 0
      ? parseFloat(((correctAnswers / totalGradedQuestions) * 100).toFixed(1))
      : null; // Display N/A if 0

  // Subject analytics array
  const subjectBreakdown = Object.values(subjectMap).map((s) => {
    const compRate = s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0;
    const graded = s.correctAnswers + s.incorrectAnswers;
    const accRate = graded > 0 ? Math.round((s.correctAnswers / graded) * 100) : null;
    return {
      ...s,
      completionRate: compRate,
      accuracyRate: accRate,
      plannedHours: minutesToDecimalHours(s.plannedMinutes),
      actualHours: minutesToDecimalHours(s.actualMinutes)
    };
  });

  // Daily logs array
  const dailyPerformance = Object.values(dailyMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => {
      const compRate = d.scheduled > 0 ? Math.round((d.completed / d.scheduled) * 100) : 0;
      return {
        ...d,
        completionRate: compRate,
        plannedHours: minutesToDecimalHours(d.plannedMinutes),
        actualHours: minutesToDecimalHours(d.actualMinutes)
      };
    });

  // Best performing days (highest completion and study hours)
  const bestPerformingDays = [...dailyPerformance]
    .filter((d) => d.completed > 0 || d.actualMinutes > 0)
    .sort((a, b) => b.completed - a.completed || b.actualMinutes - a.actualMinutes)
    .slice(0, 3);

  // Missed tasks and areas needing attention
  const missedTasksList = studyTasks.filter(
    (t) => t.status === 'Missed' || (t.status === 'Not Started' && t.date < new Date().toISOString().slice(0, 10))
  );

  // Mistakes analysis
  const mistakeCategoryCounts = {
    Conceptual: 0,
    Logical: 0,
    Implementation: 0,
    'Edge Case': 0,
    'Time Complexity': 0
  };
  const patternMap = {};
  let resolvedMistakesCount = 0;

  mistakes.forEach((m) => {
    if (mistakeCategoryCounts[m.category] !== undefined) {
      mistakeCategoryCounts[m.category] += 1;
    }
    if (m.is_resolved) resolvedMistakesCount += 1;

    const patternKey = m.pattern?.trim() || m.topic?.trim() || 'General';
    patternMap[patternKey] = (patternMap[patternKey] || 0) + 1;
  });

  const frequentMistakePatterns = Object.entries(patternMap)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Difficult topics ranking
  const rankedDifficultTopics = [...difficultTopics].sort(
    (a, b) => (a.confidence_rating || 1) - (b.confidence_rating || 1)
  );

  const topicsRequiringRevision = difficultTopics.filter(
    (t) => (t.confidence_rating || 1) <= 2 || t.understanding_status === 'Struggling'
  );

  // Confidence improvements from revision logs
  const resolvedMistakesRate =
    mistakes.length > 0 ? Math.round((resolvedMistakesCount / mistakes.length) * 100) : 0;

  // Actionable recommendations generator
  const recommendations = [];

  if (completionPercentage !== null && completionPercentage < 65) {
    recommendations.push({
      type: 'warning',
      title: 'Adjust Timetable Pacing',
      message: `Your task completion rate is ${completionPercentage}%. Consider trimming scheduled task scopes or scheduling explicit buffer recovery breaks.`
    });
  } else if (completionPercentage !== null && completionPercentage >= 85) {
    recommendations.push({
      type: 'success',
      title: 'Excellent Consistency',
      message: `Outstanding task completion rate of ${completionPercentage}%! Your study schedule adherence is strong and reliable.`
    });
  }

  if (accuracyPercentage !== null && accuracyPercentage < 70) {
    recommendations.push({
      type: 'coral',
      title: 'Strengthen Concept Fundamentals',
      message: `Current question accuracy is ${accuracyPercentage}%. Slow down before writing code—practice dry-running algorithms on paper first.`
    });
  }

  if (mistakeCategoryCounts['Edge Case'] > 2) {
    recommendations.push({
      type: 'lavender',
      title: 'Focus on Edge Cases',
      message: `You recorded ${mistakeCategoryCounts['Edge Case']} edge case mistakes. Always test null/empty arrays, single elements, and boundary values before submission.`
    });
  }

  if (mistakeCategoryCounts['Time Complexity'] > 1) {
    recommendations.push({
      type: 'lavender',
      title: 'Pre-calculate Big-O Constraints',
      message: 'Analyze input size N and target time complexity (e.g. N <= 10^5 requires O(N log N) or O(N)) prior to drafting brute-force solutions.'
    });
  }

  if (topicsRequiringRevision.length > 0) {
    recommendations.push({
      type: 'blue',
      title: 'Prioritize Weak Topics',
      message: `You have ${topicsRequiringRevision.length} high-priority weak topics needing revision (${topicsRequiringRevision.slice(0, 2).map((t) => t.topic_name).join(', ')}). Reserve Sunday revision blocks to solidify them.`
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'blue',
      title: 'Continuous Review',
      message: 'Keep maintaining your daily study habit. Review your logged mistakes 24 hours after solving them to lock in retention.'
    });
  }

  return {
    reportingPeriod: {
      startDate,
      endDate
    },
    totals: {
      allScheduledTasks,
      totalStudyTasksScheduled,
      completedTasks,
      partiallyCompletedTasks,
      missedTasks,
      inProgressTasks,
      notStartedTasks,
      completionPercentage, // e.g. 80.5 or null for N/A
      plannedMinutes,
      actualMinutes,
      plannedHours: minutesToDecimalHours(plannedMinutes),
      actualHours: minutesToDecimalHours(actualMinutes),
      questionsPlanned,
      questionsAttempted,
      correctAnswers,
      incorrectAnswers,
      totalGradedQuestions,
      accuracyPercentage, // e.g. 75.0 or null for N/A
      mistakesLogged: mistakes.length,
      resolvedMistakesCount,
      resolvedMistakesRate,
      activeWeakTopics: difficultTopics.length,
      topicsRequiringRevisionCount: topicsRequiringRevision.length,
      revisionsLogged: revisions.length
    },
    subjectBreakdown,
    dailyPerformance,
    bestPerformingDays,
    missedTasksList,
    mistakeCategoryCounts,
    frequentMistakePatterns,
    rankedDifficultTopics,
    topicsRequiringRevision,
    recommendations
  };
}
