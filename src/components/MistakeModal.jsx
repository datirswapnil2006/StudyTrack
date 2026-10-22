import React, { useState, useEffect } from 'react';
import { X, Bug, Link as LinkIcon, Calendar, CheckCircle2, Save, Trash2 } from 'lucide-react';
import { MISTAKE_CATEGORIES } from '../utils/timetableDefaults';
import { getKolkataDateString } from '../utils/dateUtils';

export default function MistakeModal({
  isOpen,
  mistake,
  onClose,
  onSave,
  onDelete
}) {
  const [formData, setFormData] = useState({
    problem_name: '',
    problem_url: '',
    topic: 'DSA',
    pattern: '',
    difficulty: 'Medium',
    category: 'Logical',
    mistake_explanation: '',
    correct_approach: '',
    next_revision_date: '',
    is_resolved: false
  });

  useEffect(() => {
    if (mistake) {
      setFormData({
        problem_name: mistake.problem_name || '',
        problem_url: mistake.problem_url || '',
        topic: mistake.topic || 'DSA',
        pattern: mistake.pattern || '',
        difficulty: mistake.difficulty || 'Medium',
        category: mistake.category || 'Logical',
        mistake_explanation: mistake.mistake_explanation || '',
        correct_approach: mistake.correct_approach || '',
        next_revision_date: mistake.next_revision_date || '',
        is_resolved: Boolean(mistake.is_resolved)
      });
    } else {
      // Default next revision in 2 days
      const date = new Date();
      date.setDate(date.getDate() + 2);
      const revDateStr = date.toISOString().slice(0, 10);
      setFormData({
        problem_name: '',
        problem_url: '',
        topic: 'Binary Search',
        pattern: 'Two Pointers',
        difficulty: 'Medium',
        category: 'Logical',
        mistake_explanation: '',
        correct_approach: '',
        next_revision_date: revDateStr,
        is_resolved: false
      });
    }
  }, [mistake, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(mistake || {}),
      ...formData
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#F8C6BF] relative animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FDEEEB] text-[#D9534F] flex items-center justify-center">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-[#24324A]">
                {mistake?.id ? 'Edit DSA Mistake' : 'Log New DSA Mistake'}
              </h2>
              <p className="text-xs text-[#64748B]">
                Track root causes and reinforce the correct algorithmic approach
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Problem Title / Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 33. Search in Rotated Sorted Array"
              value={formData.problem_name}
              onChange={(e) => setFormData({ ...formData, problem_name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Problem URL (LeetCode / Codeforces / GFG)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                placeholder="https://leetcode.com/problems/..."
                value={formData.problem_url}
                onChange={(e) => setFormData({ ...formData, problem_url: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Topic *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dynamic Programming, Graphs"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Algorithm Pattern
              </label>
              <input
                type="text"
                placeholder="e.g. Sliding Window, Monotonic Stack"
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Mistake Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-rose-700"
              >
                {MISTAKE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Explanation of What Went Wrong *
            </label>
            <textarea
              required
              rows="3"
              placeholder="Why did the bug happen? (e.g., forgot that array contains negative numbers; infinite loop on duplicates)"
              value={formData.mistake_explanation}
              onChange={(e) => setFormData({ ...formData, mistake_explanation: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Correct Approach & Key Invariant *
            </label>
            <textarea
              required
              rows="3"
              placeholder="How should this problem be solved properly? What is the core condition or data structure?"
              value={formData.correct_approach}
              onChange={(e) => setFormData({ ...formData, correct_approach: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#FFF9F0] border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Next Revision Date
              </label>
              <input
                type="date"
                value={formData.next_revision_date}
                onChange={(e) => setFormData({ ...formData, next_revision_date: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div className="flex items-center pt-5 gap-2">
              <input
                type="checkbox"
                id="is_resolved"
                checked={formData.is_resolved}
                onChange={(e) => setFormData({ ...formData, is_resolved: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-300"
              />
              <label htmlFor="is_resolved" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Resolved / Re-solved without hints
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {mistake?.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this coding mistake record?')) {
                    onDelete(mistake.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                <span>Save Mistake</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
