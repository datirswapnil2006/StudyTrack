import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Save
} from 'lucide-react';
import {
  SUBJECT_OPTIONS,
  STATUS_OPTIONS,
  SUBJECT_COLORS
} from '../utils/timetableDefaults';
import { calculateDurationMinutes, formatMinutesToHours } from '../utils/dateUtils';

export default function TaskEditModal({
  isOpen,
  task,
  onClose,
  onSave,
  onOpenMistakeLogger
}) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        planned_duration_minutes: task.planned_duration_minutes || 0,
        actual_duration_minutes: task.actual_duration_minutes || 0,
        questions_planned: task.questions_planned || 0,
        questions_attempted: task.questions_attempted || 0,
        correct_answers: task.correct_answers || 0,
        incorrect_answers: task.incorrect_answers || 0,
        status: task.status || 'Not Started',
        is_completed: Boolean(task.is_completed || task.status === 'Completed'),
        spans_midnight: Boolean(task.spans_midnight),
        revision_required: Boolean(task.revision_required),
        difficult_topics_notes: task.difficult_topics_notes || '',
        mistake_notes: task.mistake_notes || '',
        personal_notes: task.personal_notes || ''
      });
    }
  }, [task]);

  if (!isOpen || !formData) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      // Auto update duration if times change
      if (field === 'start_time' || field === 'end_time' || field === 'spans_midnight') {
        const start = field === 'start_time' ? value : prev.start_time;
        const end = field === 'end_time' ? value : prev.end_time;
        const spans = field === 'spans_midnight' ? value : prev.spans_midnight;
        next.planned_duration_minutes = calculateDurationMinutes(start, end, spans);
      }

      // Sync is_completed with status
      if (field === 'status') {
        next.is_completed = value === 'Completed';
      }
      if (field === 'is_completed') {
        next.status = value ? 'Completed' : 'Not Started';
      }

      return next;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isDsaTask = formData.subject === 'DSA';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#DCEBFA] max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DCEBFA] text-[#1E4E8C] flex items-center justify-center font-bold">
              #{formData.task_order || 1}
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-[#24324A]">
                Edit Study Task
              </h2>
              <span className="text-xs text-[#64748B]">
                {formData.date ? `Scheduled for ${formData.date}` : 'Daily timetable schedule'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Title & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF] focus:ring-2 focus:ring-[#DCEBFA]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Subject / Domain
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF] bg-white"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Durations */}
          <div className="p-3.5 rounded-xl bg-[#FFF9F0] border border-[#E2E8F0] space-y-3">
            <div className="text-xs font-bold text-[#24324A] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#6B9ACF]" />
              <span>Time Scheduling & Durations</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Planned (mins)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.planned_duration_minutes}
                  onChange={(e) => handleChange('planned_duration_minutes', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Actual Study (mins)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.actual_duration_minutes}
                  onChange={(e) => handleChange('actual_duration_minutes', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-[#1E4E8C]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="spans_midnight"
                checked={formData.spans_midnight}
                onChange={(e) => handleChange('spans_midnight', e.target.checked)}
                className="rounded border-slate-300 text-[#6B9ACF] focus:ring-[#DCEBFA]"
              />
              <label htmlFor="spans_midnight" className="text-xs text-slate-700 cursor-pointer">
                Spans midnight (e.g. 10:00 PM to 12:00 AM) — associates with study start day
              </label>
            </div>
          </div>

          {/* Status & Completion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Completion Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-5 gap-2">
              <input
                type="checkbox"
                id="is_completed"
                checked={formData.is_completed}
                onChange={(e) => handleChange('is_completed', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#3B8A61] focus:ring-[#BFE3CD]"
              />
              <label htmlFor="is_completed" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Mark as Completed
              </label>
            </div>
          </div>

          {/* Questions Metrics */}
          <div className="p-3.5 rounded-xl bg-[#F0F7FF] border border-[#BCD8F5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E4E8C] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                Problem & Question Tracking
              </span>
              <span className="text-[11px] text-[#64748B]">
                Accuracy:{' '}
                {formData.correct_answers + formData.incorrect_answers > 0
                  ? `${Math.round(
                      (formData.correct_answers /
                        (formData.correct_answers + formData.incorrect_answers)) *
                        100
                    )}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Questions Planned
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.questions_planned}
                  onChange={(e) => handleChange('questions_planned', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Attempted
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.questions_attempted}
                  onChange={(e) => handleChange('questions_attempted', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-emerald-700 mb-1">
                  Correct Answers
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.correct_answers}
                  onChange={(e) => handleChange('correct_answers', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-rose-700 mb-1">
                  Incorrect Answers
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.incorrect_answers}
                  onChange={(e) => handleChange('incorrect_answers', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-rose-300 bg-rose-50 text-rose-800 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Dedicated DSA Mistakes & Weak Topics notes */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#24324A] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  Mistake Notes
                </label>
                {isDsaTask && onOpenMistakeLogger && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenMistakeLogger(formData);
                      onClose();
                    }}
                    className="text-[11px] font-semibold text-[#6B9ACF] hover:underline flex items-center gap-1"
                  >
                    <span>+ Log in DSA Mistake Tracker</span>
                  </button>
                )}
              </div>
              <textarea
                rows="2"
                placeholder="What mistakes occurred? (e.g., missed edge cases, off-by-one, overflow)"
                value={formData.mistake_notes}
                onChange={(e) => handleChange('mistake_notes', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Difficult Topics & Concepts Encountered
              </label>
              <textarea
                rows="2"
                placeholder="Concepts that felt confusing or require second revision..."
                value={formData.difficult_topics_notes}
                onChange={(e) => handleChange('difficult_topics_notes', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Personal Study Notes & Key Takeaways
              </label>
              <textarea
                rows="2"
                placeholder="Key syntax, insights, or commands learned today..."
                value={formData.personal_notes}
                onChange={(e) => handleChange('personal_notes', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="revision_required"
                checked={formData.revision_required}
                onChange={(e) => handleChange('revision_required', e.target.checked)}
                className="rounded border-slate-300 text-[#7E57C2] focus:ring-[#DFCEF4]"
              />
              <label htmlFor="revision_required" className="text-xs font-medium text-slate-800 cursor-pointer">
                Flag this task for deep weekend / Sunday revision
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-[#6B9ACF] hover:bg-[#5888BF] text-white shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Task Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
