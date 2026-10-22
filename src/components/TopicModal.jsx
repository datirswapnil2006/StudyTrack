import React, { useState, useEffect } from 'react';
import { X, Brain, Star, Save, Trash2 } from 'lucide-react';
import { TOPIC_DOMAINS } from '../utils/timetableDefaults';
import { getKolkataDateString } from '../utils/dateUtils';

export default function TopicModal({
  isOpen,
  topic,
  onClose,
  onSave,
  onDelete
}) {
  const [formData, setFormData] = useState({
    topic_name: '',
    domain: 'DSA',
    reason_difficult: '',
    confidence_rating: 2,
    revision_attempts: 0,
    understanding_status: 'Struggling'
  });

  useEffect(() => {
    if (topic) {
      setFormData({
        topic_name: topic.topic_name || '',
        domain: topic.domain || 'DSA',
        reason_difficult: topic.reason_difficult || '',
        confidence_rating: topic.confidence_rating || 1,
        revision_attempts: topic.revision_attempts || 0,
        understanding_status: topic.understanding_status || 'Struggling'
      });
    } else {
      setFormData({
        topic_name: '',
        domain: 'DSA',
        reason_difficult: '',
        confidence_rating: 2,
        revision_attempts: 0,
        understanding_status: 'Struggling'
      });
    }
  }, [topic, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(topic || {}),
      ...formData
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DFCEF4] relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F3EBF9] text-[#7E57C2] flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-[#24324A]">
                {topic?.id ? 'Edit Weak Topic' : 'Register Weak Topic'}
              </h2>
              <p className="text-xs text-[#64748B]">
                Track concept clarity and progressive mastery over multiple revisions
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
              Topic Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Graph Cycle Detection (Union-Find) or Docker Networking"
              value={formData.topic_name}
              onChange={(e) => setFormData({ ...formData, topic_name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#7E57C2]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Domain / Subject *
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                {TOPIC_DOMAINS.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Understanding Status
              </label>
              <select
                value={formData.understanding_status}
                onChange={(e) => setFormData({ ...formData, understanding_status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-[#7E57C2]"
              >
                <option value="Struggling">Struggling</option>
                <option value="Improving">Improving</option>
                <option value="Comfortable">Comfortable</option>
                <option value="Mastered">Mastered</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Why is this topic difficult? *
            </label>
            <textarea
              required
              rows="3"
              placeholder="e.g. Difficulty formulating base cases in recursion, or visualizing 3-dimensional DP tables."
              value={formData.reason_difficult}
              onChange={(e) => setFormData({ ...formData, reason_difficult: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#7E57C2]"
            />
          </div>

          {/* Confidence Rating Stars */}
          <div className="p-3.5 rounded-xl bg-[#F3EBF9]/50 border border-[#DFCEF4]">
            <label className="block text-xs font-semibold text-[#5B21B6] mb-2">
              Confidence Rating: {formData.confidence_rating} / 5
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    const status =
                      star >= 5 ? 'Mastered' : star >= 4 ? 'Comfortable' : star >= 3 ? 'Improving' : 'Struggling';
                    setFormData({ ...formData, confidence_rating: star, understanding_status: status });
                  }}
                  className={`p-2 rounded-xl border transition-all ${
                    formData.confidence_rating >= star
                      ? 'bg-amber-400 border-amber-500 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-300 hover:border-amber-300'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
              <span className="text-xs text-slate-600 font-medium ml-2">
                {formData.confidence_rating <= 2
                  ? 'High priority for revision'
                  : formData.confidence_rating >= 4
                  ? 'Solid foundation'
                  : 'Moderate understanding'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {topic?.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this weak topic record?')) {
                    onDelete(topic.id);
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
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-[#7E57C2] hover:bg-[#6A45AF] text-white shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Topic</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
