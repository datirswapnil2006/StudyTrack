import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Flame,
  Plus,
  Bug,
  Brain,
  FileBarChart2,
  TrendingUp,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  RotateCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import confetti from 'canvas-confetti';
import {
  getStudyDay,
  saveStudyDay,
  getDailyTasks,
  saveDailyTasks,
  updateDailyTask,
  getCodingMistakes,
  getDifficultTopics,
  calculateStudyStreak
} from '../services/studyService';
import {
  getTemplateTasks,
  SUBJECT_COLORS,
  SLEEP_NOTE
} from '../utils/timetableDefaults';
import {
  getKolkataDateString,
  formatReadableDate,
  formatMinutesToHours,
  minutesToDecimalHours
} from '../utils/dateUtils';
import TaskEditModal from '../components/TaskEditModal';

export default function DashboardView({
  user,
  onNavigate,
  onOpenMistakeModal,
  onOpenTopicModal
}) {
  const [selectedDate, setSelectedDate] = useState(getKolkataDateString());
  const [templateType, setTemplateType] = useState('college');
  const [tasks, setTasks] = useState([]);
  const [studyDay, setStudyDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [recentMistakes, setRecentMistakes] = useState([]);
  const [topTopics, setTopTopics] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [streak, setStreak] = useState(0);

  // Load today's data
  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user, selectedDate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch study day
      let day = await getStudyDay(user.id, selectedDate);
      let dayTasks = await getDailyTasks(user.id, selectedDate);

      // If no tasks exist for this date, initialize with default template
      if (!dayTasks || dayTasks.length === 0) {
        const defaultTemplate = day?.template_type || 'college';
        setTemplateType(defaultTemplate);
        const initialTasks = getTemplateTasks(defaultTemplate);
        dayTasks = await saveDailyTasks(user.id, selectedDate, initialTasks, defaultTemplate, day?.id);
        if (!day) {
          day = await saveStudyDay(user.id, {
            date: selectedDate,
            template_type: defaultTemplate
          });
        }
      } else {
        setTemplateType(day?.template_type || 'college');
      }

      setStudyDay(day);
      setTasks(dayTasks);

      // 2. Fetch recent mistakes
      const mistakes = await getCodingMistakes(user.id);
      setRecentMistakes(mistakes.slice(0, 3));

      // 3. Fetch top weak topics
      const topics = await getDifficultTopics(user.id);
      setTopTopics(topics.slice(0, 3));

      // 4. Calculate streak
      const currentStreak = await calculateStudyStreak(user.id);
      setStreak(currentStreak);

      // 5. Generate 7-day trend
      await loadWeeklyTrend();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyTrend = async () => {
    try {
      const trend = [];
      const base = new Date(selectedDate);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(base);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayTasks = await getDailyTasks(user.id, dateStr);
        const studyT = dayTasks.filter((t) => t.subject !== 'Break');
        const done = studyT.filter((t) => t.is_completed || t.status === 'Completed').length;
        const total = studyT.length;
        const compRate = total > 0 ? Math.round((done / total) * 100) : 0;
        const dayName = new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(d);
        trend.push({
          day: dayName,
          date: dateStr,
          completion: compRate,
          completed: done,
          total
        });
      }
      setWeeklyTrend(trend);
    } catch (e) {
      console.error('Error loading trend:', e);
    }
  };

  // Switch template for selected date
  const handleTemplateSwitch = async (newType) => {
    if (newType === templateType) return;
    const confirmSwitch = window.confirm(
      `Switch to ${newType === 'college' ? 'College Day' : 'No-College Day'}? This will reload the default tasks for ${selectedDate}.`
    );
    if (!confirmSwitch) return;

    setTemplateType(newType);
    const newTasks = getTemplateTasks(newType);
    const updated = await saveDailyTasks(user.id, selectedDate, newTasks, newType);
    await saveStudyDay(user.id, {
      date: selectedDate,
      template_type: newType
    });
    setTasks(updated);
  };

  // Toggle task completion
  const handleToggleComplete = async (task) => {
    const nextCompleted = !task.is_completed;
    const nextStatus = nextCompleted ? 'Completed' : 'Not Started';

    if (nextCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }

    const updatedTask = await updateDailyTask(task.id, {
      is_completed: nextCompleted,
      status: nextStatus,
      // If completed and actual duration was 0, default to planned duration
      actual_duration_minutes:
        nextCompleted && (!task.actual_duration_minutes || task.actual_duration_minutes === 0)
          ? task.planned_duration_minutes
          : task.actual_duration_minutes
    });

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    loadWeeklyTrend();
  };

  const handleSaveEditedTask = async (updatedFields) => {
    const saved = await updateDailyTask(updatedFields.id, updatedFields);
    setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    loadWeeklyTrend();
  };

  // Calculations for today
  const studyTasks = tasks.filter((t) => t.subject !== 'Break');
  const totalStudyTasks = studyTasks.length;
  const completedCount = studyTasks.filter((t) => t.is_completed || t.status === 'Completed').length;
  const completionPercentage =
    totalStudyTasks > 0 ? Math.round((completedCount / totalStudyTasks) * 100) : null;

  const totalPlannedMinutes = studyTasks.reduce((acc, t) => acc + (t.planned_duration_minutes || 0), 0);
  const totalActualMinutes = studyTasks.reduce((acc, t) => acc + (t.actual_duration_minutes || 0), 0);

  const totalQuestionsAttempted = studyTasks.reduce((acc, t) => acc + (t.questions_attempted || 0), 0);
  const totalCorrect = studyTasks.reduce((acc, t) => acc + (t.correct_answers || 0), 0);
  const totalIncorrect = studyTasks.reduce((acc, t) => acc + (t.incorrect_answers || 0), 0);
  const gradedQuestions = totalCorrect + totalIncorrect;
  const accuracyPercentage =
    gradedQuestions > 0 ? Math.round((totalCorrect / gradedQuestions) * 100) : null;

  const revisionRequiredTasks = tasks.filter((t) => t.revision_required);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Date, Template Switcher, Quick Actions */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#DCEBFA] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E4E8C] mb-1">
              <Calendar className="w-4 h-4" />
              <span>Asia/Kolkata Daily Planner</span>
            </div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#24324A]">
              Study Dashboard
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Tracking day: <strong>{formatReadableDate(selectedDate)}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Selector */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-white text-[#24324A] focus:outline-none focus:border-[#6B9ACF]"
            />

            {/* Template Selector */}
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => handleTemplateSwitch('college')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  templateType === 'college'
                    ? 'bg-[#6B9ACF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#24324A]'
                }`}
              >
                College Day
              </button>
              <button
                onClick={() => handleTemplateSwitch('no-college')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  templateType === 'no-college'
                    ? 'bg-[#6B9ACF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#24324A]'
                }`}
              >
                No-College Day
              </button>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#DCEBFA] hover:bg-[#BCD8F5] text-[#1E4E8C] text-xs font-semibold shadow-xs transition-colors"
            >
              <FileBarChart2 className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Sleep Recommendation Pro-Tip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {SLEEP_NOTE}
          </span>
          <span className="text-[11px] font-semibold text-[#1E4E8C] hidden md:inline">
            Active Template: {templateType === 'college' ? 'College Day' : 'No-College Day'}
          </span>
        </div>
      </div>

      {/* 4 Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Completion Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow card-hover">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Daily Completion</span>
            <div className="w-8 h-8 rounded-xl bg-[#EAF5ED] text-[#3B8A61] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[#24324A]">
              {completionPercentage !== null ? `${completionPercentage}%` : 'N/A'}
            </span>
            <span className="text-xs text-[#64748B]">
              ({completedCount} of {totalStudyTasks} tasks)
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#3B8A61] h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* 2. Study Time (Actual vs Planned) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow card-hover">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Study Duration</span>
            <div className="w-8 h-8 rounded-xl bg-[#DCEBFA] text-[#1E4E8C] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[#24324A]">
              {formatMinutesToHours(totalActualMinutes)}
            </span>
            <span className="text-xs text-[#64748B]">
              / Planned {formatMinutesToHours(totalPlannedMinutes)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Actual: {minutesToDecimalHours(totalActualMinutes)} hrs</span>
            <span>Planned: {minutesToDecimalHours(totalPlannedMinutes)} hrs</span>
          </div>
        </div>

        {/* 3. Questions Attempted & Accuracy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow card-hover">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Problem Accuracy</span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[#24324A]">
              {accuracyPercentage !== null ? `${accuracyPercentage}%` : 'N/A'}
            </span>
            <span className="text-xs text-[#64748B]">
              ({totalCorrect} correct / {totalQuestionsAttempted} attempted)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px]">
            <span className="text-emerald-700 font-semibold">{totalCorrect} correct</span>
            <span className="text-rose-700 font-semibold">{totalIncorrect} mistakes</span>
          </div>
        </div>

        {/* 4. Study Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow card-hover">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Study Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[#24324A]">
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </span>
            <span className="text-xs text-amber-700 font-semibold">
              {streak > 0 ? 'Consistent habit!' : 'Start today!'}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-3">
            Consecutive days with completed timetable tasks
          </p>
        </div>
      </div>

      {/* Revision Alert Banner if any task flagged */}
      {revisionRequiredTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#F3EBF9] border border-[#DFCEF4] flex items-center justify-between text-xs text-[#5B21B6]">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#7E57C2] shrink-0" />
            <span>
              <strong>{revisionRequiredTasks.length} task(s) flagged for revision:</strong>{' '}
              {revisionRequiredTasks.map((t) => t.title).join(', ')}.
            </span>
          </div>
          <button
            onClick={() => onNavigate('timetable')}
            className="font-bold underline hover:text-[#4A148C] shrink-0"
          >
            Review in Timetable
          </button>
        </div>
      )}

      {/* Main Grid: Today's Tasks & Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Timetable Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#6B9ACF]" />
                <h2 className="font-heading font-bold text-lg text-[#24324A]">
                  Today's Timetable Schedule
                </h2>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-semibold text-[#1E4E8C] hover:underline flex items-center gap-0.5"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No tasks scheduled for this day. Click above to load the template.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {tasks.map((task) => {
                  const colors = SUBJECT_COLORS[task.subject] || SUBJECT_COLORS.General;
                  const isBreak = task.subject === 'Break';
                  const isDone = task.is_completed || task.status === 'Completed';

                  return (
                    <div
                      key={task.id}
                      className={`py-3 px-2 rounded-xl transition-colors flex items-center justify-between gap-3 ${
                        isDone ? 'bg-[#F8FAFC]/70' : 'hover:bg-[#FFF9F0]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(task)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-[#3B8A61] border-[#3B8A61] text-white'
                              : 'border-slate-300 hover:border-[#6B9ACF] bg-white'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Title and metadata */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0"
                              style={{ backgroundColor: colors.bg, color: colors.text }}
                            >
                              {task.subject}
                            </span>
                            <span
                              className={`text-xs font-medium truncate ${
                                isDone ? 'line-through text-slate-400' : 'text-[#24324A]'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.spans_midnight && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 shrink-0">
                                Late Night
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>
                              {task.start_time} – {task.end_time} ({task.planned_duration_minutes}m)
                            </span>
                            {task.actual_duration_minutes > 0 && (
                              <span className="font-semibold text-[#1E4E8C]">
                                • Actual: {task.actual_duration_minutes}m
                              </span>
                            )}
                            {task.questions_attempted > 0 && (
                              <span className="text-emerald-700 font-medium">
                                • {task.correct_answers}/{task.questions_attempted} Qs
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action: Edit task button */}
                      <button
                        onClick={() => setEditingTask(task)}
                        className="text-xs text-slate-500 hover:text-[#1E4E8C] px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 7-Day Completion Trend Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#6B9ACF]" />
                <h3 className="font-heading font-bold text-sm text-[#24324A]">
                  7-Day Schedule Completion Trend
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Task completion %</span>
            </div>
            <div className="h-44 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
                  <Tooltip
                    formatter={(val, name, item) => [
                      `${val}% (${item.payload.completed}/${item.payload.total} tasks)`,
                      'Completion'
                    ]}
                    contentStyle={{
                      backgroundColor: '#FFFDF9',
                      borderColor: '#DCEBFA',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="completion" fill="#6B9ACF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): DSA Mistakes & Weak Topics Widgets */}
        <div className="space-y-4">
          {/* Quick Actions Card */}
          <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#BCD8F5] card-shadow">
            <h3 className="font-heading font-bold text-sm text-[#24324A] mb-3">
              Quick Study Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenMistakeModal}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-[#F8C6BF] hover:bg-[#FDEEEB] text-[#D9534F] text-xs font-semibold transition-colors"
              >
                <Bug className="w-5 h-5 mb-1" />
                <span>Log DSA Mistake</span>
              </button>
              <button
                onClick={onOpenTopicModal}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-[#DFCEF4] hover:bg-[#F3EBF9] text-[#7E57C2] text-xs font-semibold transition-colors"
              >
                <Brain className="w-5 h-5 mb-1" />
                <span>Add Weak Topic</span>
              </button>
            </div>
          </div>

          {/* Recent Mistakes Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-500" />
                <h3 className="font-heading font-bold text-sm text-[#24324A]">
                  Recent DSA Mistakes
                </h3>
              </div>
              <button
                onClick={() => onNavigate('mistakes')}
                className="text-[11px] font-semibold text-[#1E4E8C] hover:underline"
              >
                View all
              </button>
            </div>

            {recentMistakes.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No mistakes recorded yet. Keep solving DSA problems!
              </div>
            ) : (
              <div className="space-y-2.5 mt-3">
                {recentMistakes.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onNavigate('mistakes')}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-[#F8C6BF] bg-[#FFF9F0]/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#24324A] truncate max-w-[170px]">
                        {m.problem_name}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                        {m.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-1">
                      {m.mistake_explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Weak Topics Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#7E57C2]" />
                <h3 className="font-heading font-bold text-sm text-[#24324A]">
                  High-Priority Weak Topics
                </h3>
              </div>
              <button
                onClick={() => onNavigate('topics')}
                className="text-[11px] font-semibold text-[#1E4E8C] hover:underline"
              >
                View all
              </button>
            </div>

            {topTopics.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No weak topics registered yet.
              </div>
            ) : (
              <div className="space-y-2.5 mt-3">
                {topTopics.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('topics')}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-[#DFCEF4] bg-[#F3EBF9]/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#24324A] truncate max-w-[170px]">
                        {t.topic_name}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        {t.confidence_rating}/5 ★
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{t.domain}</span>
                      <span>{t.revision_attempts || 0} revisions</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskEditModal
          isOpen={Boolean(editingTask)}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEditedTask}
          onOpenMistakeLogger={() => {
            onOpenMistakeModal();
          }}
        />
      )}
    </div>
  );
}
