// Default Timetable Templates & Metadata

export const SUBJECT_OPTIONS = [
  'DSA',
  'MERN',
  'Python',
  'DevOps',
  'Aptitude',
  'Revision',
  'General',
  'Break'
];

export const SUBJECT_COLORS = {
  DSA: { bg: '#DCEBFA', text: '#1E4E8C', border: '#BCD8F5' },
  MERN: { bg: '#EAF5ED', text: '#236944', border: '#BFE3CD' },
  Python: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  DevOps: { bg: '#F3EBF9', text: '#5B21B6', border: '#DFCEF4' },
  Aptitude: { bg: '#FDEEEB', text: '#9B2C2C', border: '#F8C6BF' },
  Revision: { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' },
  General: { bg: '#F1F5F9', text: '#334155', border: '#E2E8F0' },
  Break: { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' }
};

export const MISTAKE_CATEGORIES = [
  'Conceptual',
  'Logical',
  'Implementation',
  'Edge Case',
  'Time Complexity'
];

export const TOPIC_DOMAINS = [
  'DSA',
  'MERN',
  'Python',
  'DevOps',
  'Aptitude',
  'CS Fundamentals',
  'Other'
];

export const STATUS_OPTIONS = [
  'Not Started',
  'In Progress',
  'Completed',
  'Partially Completed',
  'Missed'
];

export const SLEEP_NOTE = "Pro Tip: 6–7 hours of uninterrupted sleep recommended daily for peak cognitive retention. Sunday is reserved for weekly test & deep revision.";

export const COLLEGE_DAY_TEMPLATE = [
  {
    task_order: 1,
    title: 'DSA — Learn concepts and solve 2 problems',
    subject: 'DSA',
    start_time: '05:30',
    end_time: '07:30',
    planned_duration_minutes: 120,
    questions_planned: 2,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 2,
    title: 'Breakfast and getting ready',
    subject: 'Break',
    start_time: '07:30',
    end_time: '09:00',
    planned_duration_minutes: 90,
    questions_planned: 0,
    spans_midnight: false,
    is_break: true
  },
  {
    task_order: 3,
    title: 'College — Practice 10–15 aptitude questions on phone',
    subject: 'Aptitude',
    start_time: '09:00',
    end_time: '16:00',
    planned_duration_minutes: 420,
    questions_planned: 12,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 4,
    title: 'Snack and rest',
    subject: 'Break',
    start_time: '16:30',
    end_time: '17:30',
    planned_duration_minutes: 60,
    questions_planned: 0,
    spans_midnight: false,
    is_break: true
  },
  {
    task_order: 5,
    title: 'MERN — Implement one small feature',
    subject: 'MERN',
    start_time: '17:30',
    end_time: '19:00',
    planned_duration_minutes: 90,
    questions_planned: 0,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 6,
    title: 'Dinner and break',
    subject: 'Break',
    start_time: '19:00',
    end_time: '20:00',
    planned_duration_minutes: 60,
    questions_planned: 0,
    spans_midnight: false,
    is_break: true
  },
  {
    task_order: 7,
    title: 'Python — Concepts and small scripts',
    subject: 'Python',
    start_time: '20:00',
    end_time: '21:00',
    planned_duration_minutes: 60,
    questions_planned: 0,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 8,
    title: 'DevOps — Docker, Git and Linux hands-on',
    subject: 'DevOps',
    start_time: '21:00',
    end_time: '22:00',
    planned_duration_minutes: 60,
    questions_planned: 0,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 9,
    title: "Revision — Record today's progress & mistake notes",
    subject: 'Revision',
    start_time: '22:00',
    end_time: '22:15',
    planned_duration_minutes: 15,
    questions_planned: 0,
    spans_midnight: false,
    is_break: false
  }
];

export const NO_COLLEGE_DAY_TEMPLATE = [
  {
    task_order: 1,
    title: 'DSA — Concepts and 3 problems',
    subject: 'DSA',
    start_time: '07:00',
    end_time: '09:30',
    planned_duration_minutes: 150,
    questions_planned: 3,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 2,
    title: 'Breakfast and morning routine',
    subject: 'Break',
    start_time: '09:30',
    end_time: '10:30',
    planned_duration_minutes: 60,
    questions_planned: 0,
    spans_midnight: false,
    is_break: true
  },
  {
    task_order: 3,
    title: 'Aptitude — Practice and timed test',
    subject: 'Aptitude',
    start_time: '10:30',
    end_time: '12:00',
    planned_duration_minutes: 90,
    questions_planned: 15,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 4,
    title: 'Lunch and rest',
    subject: 'Break',
    start_time: '12:00',
    end_time: '14:00',
    planned_duration_minutes: 120,
    questions_planned: 0,
    spans_midnight: false,
    is_break: true
  },
  {
    task_order: 5,
    title: 'MERN — Build and debug application feature',
    subject: 'MERN',
    start_time: '14:00',
    end_time: '17:00',
    planned_duration_minutes: 180,
    questions_planned: 0,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 6,
    title: 'Evening snack & rest break',
    subject: 'Break',
    start_time: '17:00',
    end_time: '17:30',
    planned_duration_minutes: 30,
    questions_planned: 0,
    spans_midnight: false,
    is_break: true
  },
  {
    task_order: 7,
    title: 'Python — Concepts and projects',
    subject: 'Python',
    start_time: '17:30',
    end_time: '19:00',
    planned_duration_minutes: 90,
    questions_planned: 0,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 8,
    title: 'Dinner and walk',
    subject: 'Break',
    start_time: '19:00',
    end_time: '20:00',
    planned_duration_minutes: 60,
    questions_planned: 0,
    spans_midnight: false,
    is_break: true
  },
  {
    task_order: 9,
    title: 'DevOps — Hands-on projects & containerization',
    subject: 'DevOps',
    start_time: '20:00',
    end_time: '22:00',
    planned_duration_minutes: 120,
    questions_planned: 0,
    spans_midnight: false,
    is_break: false
  },
  {
    task_order: 10,
    title: 'Late-night revision and redo DSA mistakes',
    subject: 'Revision',
    start_time: '22:00',
    end_time: '00:00',
    planned_duration_minutes: 120,
    questions_planned: 0,
    spans_midnight: true,
    is_break: false
  }
];

export function getTemplateTasks(templateType = 'college') {
  const source = templateType === 'no-college' ? NO_COLLEGE_DAY_TEMPLATE : COLLEGE_DAY_TEMPLATE;
  return source.map((task, idx) => ({
    id: `temp_${Date.now()}_${idx}`,
    ...task,
    status: 'Not Started',
    is_completed: false,
    actual_duration_minutes: 0,
    questions_attempted: 0,
    correct_answers: 0,
    incorrect_answers: 0,
    difficult_topics_notes: '',
    mistake_notes: '',
    revision_required: false,
    personal_notes: ''
  }));
}
