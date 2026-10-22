import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Search,
  Filter,
  Star,
  RotateCcw,
  TrendingUp,
  Edit,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getDifficultTopics,
  saveDifficultTopic,
  updateDifficultTopic,
  deleteDifficultTopic,
  logTopicRevision
} from '../services/studyService';
import { TOPIC_DOMAINS } from '../utils/timetableDefaults';
import { formatReadableDate } from '../utils/dateUtils';
import TopicModal from '../components/TopicModal';
import RevisionModal from '../components/RevisionModal';

export default function DifficultTopicsView({ user }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [activeTopicForEdit, setActiveTopicForEdit] = useState(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  const [activeTopicForRevision, setActiveTopicForRevision] = useState(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadTopics();
  }, [user, domainFilter, statusFilter, search]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await getDifficultTopics(user.id, {
        domain: domainFilter,
        status: statusFilter,
        search
      });
      setTopics(data);
    } catch (e) {
      console.error('Error fetching difficult topics:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTopic = async (topicData) => {
    if (topicData.id) {
      const updated = await updateDifficultTopic(topicData.id, topicData);
      setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await saveDifficultTopic(user.id, topicData);
      setTopics((prev) => [created, ...prev]);
    }
  };

  const handleDeleteTopic = async (id) => {
    await deleteDifficultTopic(id);
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogRevision = async ({ topicId, newConfidence, notes }) => {
    const updated = await logTopicRevision(user.id, {
      topicId,
      newConfidence,
      notes
    });
    if (newConfidence >= 4) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
    setTopics((prev) => prev.map((t) => (t.id === topicId ? updated : t)));
  };

  const strugglingCount = topics.filter((t) => t.confidence_rating <= 2).length;
  const masteredCount = topics.filter((t) => t.confidence_rating >= 4).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#DFCEF4] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7E57C2] mb-1">
              <Brain className="w-4 h-4" />
              <span>Cognitive Mastery & Weak Topics Tracker</span>
            </div>
            <h1 className="font-heading font-bold text-2xl text-[#24324A]">
              Weak Topics & Revision Progression
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Target low-confidence subjects repeatedly until full algorithmic mastery is achieved.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveTopicForEdit(null);
              setIsTopicModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7E57C2] hover:bg-[#6A45AF] text-white text-xs font-semibold shadow-xs transition-colors self-start lg:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Weak Topic</span>
          </button>
        </div>

        {/* Quick Stats Pill Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
            Total Monitored: {topics.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#F3EBF9] text-[#7E57C2] font-semibold">
            High Priority (&lt;= 2★): {strugglingCount}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#EAF5ED] text-[#236944] font-semibold">
            Mastered / Comfortable (&gt;= 4★): {masteredCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 card-shadow flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by topic name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#7E57C2]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="All">All Domains</option>
            {TOPIC_DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Struggling">Struggling</option>
            <option value="Improving">Improving</option>
            <option value="Comfortable">Comfortable</option>
            <option value="Mastered">Mastered</option>
          </select>
        </div>
      </div>

      {/* Topics Cards Grid */}
      {topics.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
          <Brain className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No weak topics registered</p>
          <p className="text-xs">
            {search || domainFilter !== 'All'
              ? 'Try adjusting your search filters.'
              : 'Add any challenging topic (e.g. Dynamic Programming, Redux Middleware, Docker Compose) to track your revisions over time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t) => {
            const conf = t.confidence_rating || 1;
            const isHighPriority = conf <= 2;

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl p-5 border transition-all card-shadow flex flex-col justify-between ${
                  isHighPriority
                    ? 'border-[#DFCEF4] hover:border-[#7E57C2]'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F3EBF9] text-[#7E57C2] border border-[#DFCEF4]">
                      {t.domain}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        t.understanding_status === 'Mastered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.understanding_status === 'Comfortable'
                          ? 'bg-blue-100 text-blue-800'
                          : t.understanding_status === 'Improving'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {t.understanding_status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-base text-[#24324A] mb-1.5">
                    {t.topic_name}
                  </h3>

                  {/* Reason Difficult */}
                  <div className="p-3 rounded-xl bg-[#FFF9F0] border border-[#E2E8F0] text-xs text-slate-700 mb-3">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      Core Difficulty:
                    </span>
                    <p className="whitespace-pre-wrap">{t.reason_difficult}</p>
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">Confidence:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            conf >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1.5">
                        {conf}/5
                      </span>
                    </div>
                  </div>

                  {/* Revision Count & Last Date */}
                  <div className="text-[11px] text-slate-500 flex items-center justify-between mt-2.5">
                    <span className="flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-[#7E57C2]" />
                      Revised: <strong>{t.revision_attempts || 0} times</strong>
                    </span>
                    {t.last_revised_date && (
                      <span>Last: {formatReadableDate(t.last_revised_date)}</span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: Log Revision & Edit */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveTopicForRevision(t);
                      setIsRevisionModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#F3EBF9] hover:bg-[#EADBFA] text-[#7E57C2] text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Log Revision</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActiveTopicForEdit(t);
                        setIsTopicModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#1E4E8C] hover:bg-slate-100"
                      title="Edit topic"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(t.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Topic Modal */}
      {isTopicModalOpen && (
        <TopicModal
          isOpen={isTopicModalOpen}
          topic={activeTopicForEdit}
          onClose={() => {
            setIsTopicModalOpen(false);
            setActiveTopicForEdit(null);
          }}
          onSave={handleSaveTopic}
          onDelete={handleDeleteTopic}
        />
      )}

      {/* Revision Modal */}
      {isRevisionModalOpen && (
        <RevisionModal
          isOpen={isRevisionModalOpen}
          topic={activeTopicForRevision}
          onClose={() => {
            setIsRevisionModalOpen(false);
            setActiveTopicForRevision(null);
          }}
          onLogRevision={handleLogRevision}
        />
      )}
    </div>
  );
}
