import React, { useState, useEffect } from 'react';
import {
  Bug,
  Plus,
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit,
  Download,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getCodingMistakes,
  saveCodingMistake,
  updateCodingMistake,
  deleteCodingMistake
} from '../services/studyService';
import { MISTAKE_CATEGORIES } from '../utils/timetableDefaults';
import { formatReadableDate } from '../utils/dateUtils';
import { exportMistakesCSV } from '../utils/csvExporter';
import MistakeModal from '../components/MistakeModal';

export default function MistakesView({ user }) {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'unresolved' | 'resolved'
  const [activeModalMistake, setActiveModalMistake] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadMistakes();
  }, [user, selectedCategory, selectedDifficulty, selectedStatus, search]);

  const loadMistakes = async () => {
    setLoading(true);
    try {
      const isRes =
        selectedStatus === 'resolved' ? true : selectedStatus === 'unresolved' ? false : 'All';
      const data = await getCodingMistakes(user.id, {
        category: selectedCategory,
        difficulty: selectedDifficulty,
        is_resolved: isRes,
        search
      });
      setMistakes(data);
    } catch (e) {
      console.error('Error loading coding mistakes:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolve = async (mistake) => {
    const nextStatus = !mistake.is_resolved;
    if (nextStatus) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    const updated = await updateCodingMistake(mistake.id, {
      is_resolved: nextStatus
    });
    setMistakes((prev) => prev.map((m) => (m.id === mistake.id ? updated : m)));
  };

  const handleSaveMistake = async (mistakeData) => {
    if (mistakeData.id) {
      const updated = await updateCodingMistake(mistakeData.id, mistakeData);
      setMistakes((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } else {
      const created = await saveCodingMistake(user.id, mistakeData);
      setMistakes((prev) => [created, ...prev]);
    }
  };

  const handleDeleteMistake = async (id) => {
    await deleteCodingMistake(id);
    setMistakes((prev) => prev.filter((m) => m.id !== id));
  };

  const totalCount = mistakes.length;
  const resolvedCount = mistakes.filter((m) => m.is_resolved).length;
  const unresolvedCount = totalCount - resolvedCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#F8C6BF] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D9534F] mb-1">
              <Bug className="w-4 h-4" />
              <span>DSA Coding Mistakes & Pattern Reinforcement</span>
            </div>
            <h1 className="font-heading font-bold text-2xl text-[#24324A]">
              DSA Mistake Tracker
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Reinforce algorithmic logic, edge case handling, and time complexity traps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => exportMistakesCSV(mistakes)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                setActiveModalMistake(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D9534F] hover:bg-[#C0392B] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log Coding Mistake</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Pill Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
            Total Logged: {totalCount}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#FDEEEB] text-[#D9534F] font-semibold">
            Unresolved: {unresolvedCount}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#EAF5ED] text-[#236944] font-semibold">
            Resolved: {resolvedCount}
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
            placeholder="Search by problem name or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="All">All Categories</option>
            {MISTAKE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="unresolved">Unresolved Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Mistakes Card Grid */}
      {mistakes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
          <Bug className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No coding mistakes found</p>
          <p className="text-xs">
            {search || selectedCategory !== 'All'
              ? 'Try adjusting your search filters.'
              : 'Every mistake logged is a lesson learned. Click "Log Coding Mistake" to record your first!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mistakes.map((m) => {
            const isResolved = m.is_resolved;
            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl p-5 border transition-all card-shadow ${
                  isResolved
                    ? 'border-[#BFE3CD] bg-[#FBFDFB]'
                    : 'border-[#F8C6BF] hover:border-[#D9534F]'
                }`}
              >
                {/* Header: Title, Category, Difficulty, Link */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FDEEEB] text-[#D9534F] border border-[#F8C6BF]">
                        {m.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          m.difficulty === 'Hard'
                            ? 'bg-rose-100 text-rose-800'
                            : m.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {m.difficulty}
                      </span>
                      {m.topic && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {m.topic}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#24324A] flex items-center gap-1.5">
                      <span>{m.problem_name}</span>
                      {m.problem_url && (
                        <a
                          href={m.problem_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6B9ACF] hover:text-[#1E4E8C] inline-flex items-center"
                          title="Open problem link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </h3>
                  </div>

                  {/* Resolve Toggle Button */}
                  <button
                    onClick={() => handleToggleResolve(m)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      isResolved
                        ? 'bg-[#EAF5ED] text-[#236944] border border-[#BFE3CD]'
                        : 'bg-[#FFF9F0] text-slate-600 border border-slate-200 hover:border-[#3B8A61]'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        isResolved ? 'text-[#3B8A61]' : 'text-slate-400'
                      }`}
                    />
                    <span>{isResolved ? 'Resolved' : 'Mark Resolved'}</span>
                  </button>
                </div>

                {/* Pattern if present */}
                {m.pattern && (
                  <div className="text-[11px] font-medium text-slate-500 mt-2">
                    <strong>Pattern:</strong> {m.pattern}
                  </div>
                )}

                {/* What went wrong */}
                <div className="mt-3 p-3 rounded-xl bg-[#FFF9F0] border border-[#FFE082]/60 text-xs">
                  <span className="font-bold text-[#B76E00] block mb-0.5">
                    What went wrong:
                  </span>
                  <p className="text-slate-700 whitespace-pre-wrap">{m.mistake_explanation}</p>
                </div>

                {/* Correct Approach */}
                <div className="mt-2.5 p-3 rounded-xl bg-[#F0F7FF] border border-[#BCD8F5] text-xs">
                  <span className="font-bold text-[#1E4E8C] block mb-0.5">
                    Correct Approach / Core Condition:
                  </span>
                  <p className="text-slate-700 whitespace-pre-wrap">{m.correct_approach}</p>
                </div>

                {/* Footer: Next revision date & Edit/Delete */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {m.next_revision_date
                        ? `Next revision: ${formatReadableDate(m.next_revision_date)}`
                        : 'No revision date set'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveModalMistake(m);
                        setIsModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-[#1E4E8C]"
                      title="Edit mistake"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMistake(m.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete mistake"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mistake Modal */}
      {isModalOpen && (
        <MistakeModal
          isOpen={isModalOpen}
          mistake={activeModalMistake}
          onClose={() => {
            setIsModalOpen(false);
            setActiveModalMistake(null);
          }}
          onSave={handleSaveMistake}
          onDelete={handleDeleteMistake}
        />
      )}
    </div>
  );
}
