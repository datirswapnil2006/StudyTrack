import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
  Edit3
} from 'lucide-react';
import {
  getStudyDay,
  saveStudyDay,
  getDailyTasks,
  saveDailyTasks,
  updateDailyTask
} from '../services/studyService';
import {
  getTemplateTasks,
  SUBJECT_OPTIONS,
  STATUS_OPTIONS,
  SUBJECT_COLORS,
  SLEEP_NOTE
} from '../utils/timetableDefaults';
import {
  getKolkataDateString,
  formatReadableDate,
  formatMinutesToHours,
  calculateDurationMinutes
} from '../utils/dateUtils';
import TaskEditModal from '../components/TaskEditModal';

export default function TimetableView({ user, onOpenMistakeModal }) {
  const [selectedDate, setSelectedDate] = useState(getKolkataDateString());
  const [templateType, setTemplateType] = useState('college');
  const [tasks, setTasks] = useState([]);
  const [sleepHours, setSleepHours] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [savingNotice, setSavingNotice] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadTimetable();
  }, [user, selectedDate]);

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const day = await getStudyDay(user.id, selectedDate);
      let dayTasks = await getDailyTasks(user.id, selectedDate);

      if (!dayTasks || dayTasks.length === 0) {
        const defaultT = day?.template_type || 'college';
        setTemplateType(defaultT);
        const templateDefaults = getTemplateTasks(defaultT);
        dayTasks = await saveDailyTasks(user.id, selectedDate, templateDefaults, defaultT, day?.id);
        if (!day) {
          await saveStudyDay(user.id, {
            date: selectedDate,
            template_type: defaultT,
            sleep_hours: null,
            notes: ''
          });
        }
      } else {
        setTemplateType(day?.template_type || 'college');
      }

      setTasks(dayTasks);
      setSleepHours(day?.sleep_hours !== null && day?.sleep_hours !== undefined ? String(day.sleep_hours) : '');
      setNotes(day?.notes || '');
    } catch (e) {
      console.error('Error loading timetable:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateReset = async (type) => {
    const confirm = window.confirm(
      `Reset schedule to ${type === 'college' ? 'College Day' : 'No-College Day'} template? Any customized tasks on ${selectedDate} will be reset.`
    );
    if (!confirm) return;

    setTemplateType(type);
    const defaults = getTemplateTasks(type);
    const updated = await saveDailyTasks(user.id, selectedDate, defaults, type);
    await saveStudyDay(user.id, {
      date: selectedDate,
      template_type: type,
      sleep_hours: sleepHours ? Number(sleepHours) : null,
      notes
    });
    setTasks(updated);
    showSavedNotification();
  };

  const showSavedNotification = () => {
    setSavingNotice(true);
    setTimeout(() => setSavingNotice(false), 2000);
  };

  const handleSaveDayDetails = async () => {
    await saveStudyDay(user.id, {
      date: selectedDate,
      template_type: templateType,
      sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
      notes
    });
    showSavedNotification();
  };

  // Task ordering actions
  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= tasks.length) return;

    const newTasks = [...tasks];
    const [moved] = newTasks.splice(index, 1);
    newTasks.splice(targetIdx, 0, moved);

    // Reassign order
    const ordered = newTasks.map((t, idx) => ({ ...t, task_order: idx + 1 }));
    setTasks(ordered);
    await saveDailyTasks(user.id, selectedDate, ordered, templateType);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Remove this task from the day?')) return;
    const filtered = tasks
      .filter((t) => t.id !== id)
      .map((t, idx) => ({ ...t, task_order: idx + 1 }));
    setTasks(filtered);
    await saveDailyTasks(user.id, selectedDate, filtered, templateType);
  };

  const handleAddTask = async () => {
    const newTask = {
      id: `task_${Date.now()}`,
      task_order: tasks.length + 1,
      title: 'New Study Block',
      subject: 'DSA',
      start_time: '18:00',
      end_time: '19:00',
      planned_duration_minutes: 60,
      actual_duration_minutes: 0,
      status: 'Not Started',
      is_completed: false,
      questions_planned: 0,
      questions_attempted: 0,
      correct_answers: 0,
      incorrect_answers: 0,
      spans_midnight: false,
      revision_required: false
    };

    const updated = [...tasks, newTask];
    setTasks(updated);
    await saveDailyTasks(user.id, selectedDate, updated, templateType);
    setEditingTask(newTask);
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    const isComp = newStatus === 'Completed';
    const task = tasks.find((t) => t.id === taskId);
    const updated = await updateDailyTask(taskId, {
      status: newStatus,
      is_completed: isComp,
      actual_duration_minutes:
        isComp && (!task.actual_duration_minutes || task.actual_duration_minutes === 0)
          ? task.planned_duration_minutes
          : task.actual_duration_minutes
    });

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const handleSaveModalTask = async (updatedTask) => {
    const saved = await updateDailyTask(updatedTask.id, updatedTask);
    setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    showSavedNotification();
  };

  // Calculations
  const studyTasks = tasks.filter((t) => t.subject !== 'Break');
  const plannedMinutes = studyTasks.reduce((acc, t) => acc + (t.planned_duration_minutes || 0), 0);
  const actualMinutes = studyTasks.reduce((acc, t) => acc + (t.actual_duration_minutes || 0), 0);
  const completedCount = studyTasks.filter((t) => t.is_completed || t.status === 'Completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Date Selection and Template Toggles */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#DCEBFA] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E4E8C] mb-1">
              <Calendar className="w-4 h-4" />
              <span>Timetable Management & Daily Customization</span>
            </div>
            <h1 className="font-heading font-bold text-2xl text-[#24324A]">
              Daily Timetable Planner
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Scheduled Date: <strong>{formatReadableDate(selectedDate)}</strong> (Asia/Kolkata)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-white"
            />

            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => handleTemplateReset('college')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  templateType === 'college'
                    ? 'bg-[#6B9ACF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#24324A]'
                }`}
              >
                College Day Template
              </button>
              <button
                onClick={() => handleTemplateReset('no-college')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  templateType === 'no-college'
                    ? 'bg-[#6B9ACF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#24324A]'
                }`}
              >
                No-College Day Template
              </button>
            </div>

            <button
              onClick={handleAddTask}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6B9ACF] hover:bg-[#5888BF] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Task</span>
            </button>
          </div>
        </div>

        {/* Saved Toast Notice */}
        {savingNotice && (
          <div className="mt-3 py-1.5 px-3 bg-[#EAF5ED] text-[#236944] text-xs font-medium rounded-lg flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Changes saved successfully!</span>
          </div>
        )}

        {/* Sleep & Sunday Notice Banner */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#64748B] gap-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {SLEEP_NOTE}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-[#1E4E8C]">
              Planned: {formatMinutesToHours(plannedMinutes)} | Actual: {formatMinutesToHours(actualMinutes)}
            </span>
          </div>
        </div>
      </div>

      {/* Timetable Tasks Table / Card List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-heading font-bold text-base text-[#24324A]">
            Tasks for {formatReadableDate(selectedDate)} ({tasks.length} total)
          </h2>
          <span className="text-xs text-slate-500">
            {completedCount} of {studyTasks.length} study tasks completed
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No tasks found. Click above to apply a template.
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task, idx) => {
              const colors = SUBJECT_COLORS[task.subject] || SUBJECT_COLORS.General;
              const isDone = task.is_completed || task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-[#F8FAFC] border-slate-200 text-slate-500'
                      : 'bg-white border-slate-200/80 hover:border-[#BCD8F5]'
                  }`}
                >
                  {/* Left: Reorder, Order number, Subject badge, Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === tasks.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {task.task_order || idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {task.subject}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isDone ? 'line-through text-slate-400' : 'text-[#24324A]'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.spans_midnight && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            Late Night (Spans Midnight)
                          </span>
                        )}
                        {task.revision_required && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                            Revision Required
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {task.start_time} – {task.end_time} ({task.planned_duration_minutes}m)
                        </span>
                        <span>Actual: <strong>{task.actual_duration_minutes || 0}m</strong></span>
                        {task.questions_attempted > 0 && (
                          <span className="text-emerald-700 font-medium">
                            {task.correct_answers}/{task.questions_attempted} Correct
                          </span>
                        )}
                        {task.mistake_notes && (
                          <span className="text-rose-600 truncate max-w-[180px]">
                            • Note: {task.mistake_notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Status selector, Edit, Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <select
                      value={task.status || 'Not Started'}
                      onChange={(e) => handleQuickStatusChange(task.id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                        isDone
                          ? 'bg-[#EAF5ED] text-[#236944] border-[#BFE3CD]'
                          : task.status === 'Missed'
                          ? 'bg-[#FDEEEB] text-[#D9534F] border-[#F8C6BF]'
                          : task.status === 'In Progress'
                          ? 'bg-[#DCEBFA] text-[#1E4E8C] border-[#BCD8F5]'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#1E4E8C] hover:bg-slate-100"
                      title="Edit task full details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Notes & Sleep Hours Recording */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#DCEBFA] card-shadow space-y-3">
        <h3 className="font-heading font-bold text-sm text-[#24324A]">
          Daily Reflection & Sleep Hours (Asia/Kolkata)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Sleep Hours (Target: 6–7h)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              placeholder="e.g. 6.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Day's Summary & Progress Notes
            </label>
            <input
              type="text"
              placeholder="Summary of today's study progress, hurdles, or accomplishments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveDayDetails}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6B9ACF] hover:bg-[#5888BF] text-white shadow-xs"
          >
            Save Day Notes & Sleep
          </button>
        </div>
      </div>

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskEditModal
          isOpen={Boolean(editingTask)}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveModalTask}
          onOpenMistakeLogger={onOpenMistakeModal}
        />
      )}
    </div>
  );
}
