// CSV Exporter for Study Progress & Performance Analytics

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Detailed Task Records CSV
 */
export function exportTaskRecordsCSV(tasks = [], period = {}) {
  const headers = [
    'Date (Asia/Kolkata)',
    'Task Order',
    'Title',
    'Subject',
    'Start Time',
    'End Time',
    'Planned Minutes',
    'Actual Minutes',
    'Status',
    'Completed',
    'Questions Planned',
    'Questions Attempted',
    'Correct Answers',
    'Incorrect Answers',
    'Spans Midnight',
    'Revision Required',
    'Difficult Topics Notes',
    'Mistake Notes',
    'Personal Notes'
  ];

  const rows = tasks.map((t) => [
    t.date,
    t.task_order,
    t.title,
    t.subject,
    t.start_time,
    t.end_time,
    t.planned_duration_minutes,
    t.actual_duration_minutes,
    t.status,
    t.is_completed ? 'YES' : 'NO',
    t.questions_planned,
    t.questions_attempted,
    t.correct_answers,
    t.incorrect_answers,
    t.spans_midnight ? 'YES' : 'NO',
    t.revision_required ? 'YES' : 'NO',
    t.difficult_topics_notes || '',
    t.mistake_notes || '',
    t.personal_notes || ''
  ]);

  const csv = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(','))
  ].join('\r\n');

  const filename = `study_task_records_${period.startDate || 'all'}_to_${period.endDate || 'all'}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export Executive Summary & Analytics CSV
 */
export function exportSummaryReportCSV(analytics, reportType = 'report') {
  const { totals, reportingPeriod, subjectBreakdown, dailyPerformance } = analytics;

  const lines = [];

  // Metadata
  lines.push(['REPORT TYPE', reportType.toUpperCase()]);
  lines.push(['START DATE', reportingPeriod.startDate]);
  lines.push(['END DATE', reportingPeriod.endDate]);
  lines.push(['TIMEZONE', 'Asia/Kolkata']);
  lines.push([]);

  // Executive Summary
  lines.push(['--- EXECUTIVE SUMMARY METRICS ---']);
  lines.push(['Metric', 'Value']);
  lines.push(['Total Scheduled Tasks', totals.allScheduledTasks]);
  lines.push(['Study Tasks Scheduled', totals.totalStudyTasksScheduled]);
  lines.push(['Completed Tasks', totals.completedTasks]);
  lines.push(['Partially Completed Tasks', totals.partiallyCompletedTasks]);
  lines.push(['Missed Tasks', totals.missedTasks]);
  lines.push(['Completion Rate (%)', totals.completionPercentage !== null ? totals.completionPercentage : 'N/A']);
  lines.push(['Planned Study Hours', totals.plannedHours]);
  lines.push(['Actual Study Hours', totals.actualHours]);
  lines.push(['Questions Planned', totals.questionsPlanned]);
  lines.push(['Questions Attempted', totals.questionsAttempted]);
  lines.push(['Correct Answers', totals.correctAnswers]);
  lines.push(['Incorrect Answers', totals.incorrectAnswers]);
  lines.push(['Accuracy Rate (%)', totals.accuracyPercentage !== null ? totals.accuracyPercentage : 'N/A']);
  lines.push(['Mistakes Logged', totals.mistakesLogged]);
  lines.push(['Resolved Mistakes', totals.resolvedMistakesCount]);
  lines.push(['Active Weak Topics', totals.activeWeakTopics]);
  lines.push([]);

  // Subject Breakdown
  lines.push(['--- SUBJECT-WISE STUDY BREAKDOWN ---']);
  lines.push(['Subject', 'Completed Tasks', 'Total Tasks', 'Completion %', 'Actual Hours', 'Planned Hours', 'Questions Attempted', 'Accuracy %']);
  subjectBreakdown.forEach((s) => {
    lines.push([
      s.subject,
      s.completedTasks,
      s.totalTasks,
      s.completionRate,
      s.actualHours,
      s.plannedHours,
      s.questionsAttempted,
      s.accuracyRate !== null ? s.accuracyRate : 'N/A'
    ]);
  });
  lines.push([]);

  // Daily Log
  lines.push(['--- DAILY PERFORMANCE LOG ---']);
  lines.push(['Date', 'Completed Tasks', 'Scheduled Tasks', 'Completion %', 'Actual Hours', 'Planned Hours', 'Questions Attempted', 'Correct Answers']);
  dailyPerformance.forEach((d) => {
    lines.push([
      d.date,
      d.completed,
      d.scheduled,
      d.completionRate,
      d.actualHours,
      d.plannedHours,
      d.questionsAttempted,
      d.correctAnswers
    ]);
  });

  const csv = lines
    .map((row) => (row.length === 0 ? '' : row.map(escapeCSV).join(',')))
    .join('\r\n');

  const filename = `study_performance_summary_${reportingPeriod.startDate}_to_${reportingPeriod.endDate}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export DSA Coding Mistakes CSV
 */
export function exportMistakesCSV(mistakes = []) {
  const headers = [
    'Date Logged',
    'Problem Name',
    'Problem URL',
    'Topic',
    'Pattern',
    'Difficulty',
    'Category',
    'Mistake Explanation',
    'Correct Approach',
    'Next Revision Date',
    'Resolved Status'
  ];

  const rows = mistakes.map((m) => [
    m.created_at ? m.created_at.slice(0, 10) : '',
    m.problem_name,
    m.problem_url || '',
    m.topic || '',
    m.pattern || '',
    m.difficulty,
    m.category,
    m.mistake_explanation,
    m.correct_approach,
    m.next_revision_date || '',
    m.is_resolved ? 'RESOLVED' : 'UNRESOLVED'
  ]);

  const csv = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(','))
  ].join('\r\n');

  downloadCSV(csv, 'coding_mistakes_export.csv');
}
