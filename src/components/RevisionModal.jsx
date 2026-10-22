import React, { useState } from 'react';
import { X, RotateCcw, Star, CheckCircle, TrendingUp } from 'lucide-react';

export default function RevisionModal({
  isOpen,
  topic,
  onClose,
  onLogRevision
}) {
  const [newConfidence, setNewConfidence] = useState(topic?.confidence_rating || 3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !topic) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onLogRevision({
        topicId: topic.id,
        newConfidence,
        notes
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DFCEF4] relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F3EBF9] text-[#7E57C2] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#24324A]">
                Log Topic Revision
              </h2>
              <span className="text-xs text-[#64748B]">
                Attempt #{ (topic.revision_attempts || 0) + 1 }
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 rounded-xl bg-[#FFF9F0] border border-slate-200">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Topic Under Review
            </span>
            <div className="font-bold text-sm text-[#24324A] mt-0.5">
              {topic.topic_name}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              <strong>Domain:</strong> {topic.domain} | <strong>Current Confidence:</strong> {topic.confidence_rating}/5
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1.5">
              Updated Confidence Rating After Revision (1 to 5)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewConfidence(star)}
                  className={`p-2 rounded-xl border transition-all ${
                    newConfidence >= star
                      ? 'bg-amber-400 border-amber-500 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-300 hover:border-amber-300'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
              <span className="text-xs font-bold text-[#7E57C2] ml-2">
                {newConfidence}/5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Revision Notes & Problem Solving Insights
            </label>
            <textarea
              rows="3"
              required
              placeholder="What did you review? (e.g. solved 2 LeetCode Mediums on this pattern; clarified edge cases; formulas rewritten on cheat sheet)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#7E57C2]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-[#7E57C2] hover:bg-[#6A45AF] text-white shadow-xs disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Record Revision</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
