import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Brain,
  Bug,
  Sparkles,
  Save,
  Check,
  ChevronRight,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  getReportSourceData,
  getReportGoals,
  saveReportGoals
} from '../services/studyService';
import { calculateReportAnalytics } from '../utils/reportCalculator';
import { generateStudyReportPDF } from '../utils/pdfGenerator';
import { exportSummaryReportCSV, exportTaskRecordsCSV } from '../utils/csvExporter';
import {
  getReportRange,
  formatReadableDate,
  getKolkataDateString,
  formatMinutesToHours
} from '../utils/dateUtils';
import { SUBJECT_COLORS } from '../utils/timetableDefaults';

const COLORS = ['#6B9ACF', '#3B8A61', '#D9534F', '#7E57C2', '#F59E0B', '#06B6D4', '#64748B'];

export default function ReportsView({ user }) {
  const [reportType, setReportType] = useState('weekly'); // 'weekly' | '15-day' | 'monthly' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rawData, setRawData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reflections, setReflections] = useState('');
  const [nextPeriodGoals, setNextPeriodGoals] = useState('');
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [savedGoalsNotice, setSavedGoalsNotice] = useState(false);

  // Initialize dates
  useEffect(() => {
    const range = getReportRange(reportType);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, [reportType]);

  // Load report data whenever dates change
  useEffect(() => {
    if (!user || !startDate || !endDate) return;
    loadReport();
  }, [user, startDate, endDate]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await getReportSourceData(user.id, startDate, endDate);
      setRawData(data);

      const calculated = calculateReportAnalytics({
        tasks: data.tasks,
        studyDays: data.studyDays,
        mistakes: data.mistakes,
        difficultTopics: data.difficultTopics,
        revisions: data.revisions,
        startDate,
        endDate
      });
      setAnalytics(calculated);

      // Load saved goals and reflections from Supabase
      const savedGoals = await getReportGoals(user.id, reportType, startDate, endDate);
      if (savedGoals) {
        setReflections(savedGoals.reflections || '');
        setNextPeriodGoals(savedGoals.next_period_goals || '');
      } else {
        setReflections('');
        setNextPeriodGoals('');
      }
    } catch (e) {
      console.error('Error generating report:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoals = async () => {
    setIsSavingGoals(true);
    try {
      await saveReportGoals(user.id, {
        reportType,
        startDate,
        endDate,
        reflections,
        nextPeriodGoals
      });
      setSavedGoalsNotice(true);
      setTimeout(() => setSavedGoalsNotice(false), 2000);
    } catch (e) {
      console.error('Error saving goals:', e);
    } finally {
      setIsSavingGoals(false);
    }
  };

  // PDF Download Handler
  const handleDownloadPDF = () => {
    if (!analytics) return;
    const title =
      reportType === 'weekly'
        ? 'Weekly Study Performance Report (7-Day)'
        : reportType === '15-day'
        ? '15-Day Study Progress & Analytics Report'
        : reportType === 'monthly'
        ? 'Monthly Comprehensive Study Analytics Report'
        : 'Custom Period Study Performance Report';

    generateStudyReportPDF({
      reportTitle: title,
      analytics,
      reportType,
      reflections,
      goals: nextPeriodGoals,
      userFullName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Scholar'
    });
  };

  // CSV Exporter Handlers
  const handleExportSummaryCSV = () => {
    if (!analytics) return;
    exportSummaryReportCSV(analytics, reportType);
  };

  const handleExportTasksCSV = () => {
    if (!rawData) return;
    exportTaskRecordsCSV(rawData.tasks, { startDate, endDate });
  };

  const pieData = (analytics?.subjectBreakdown || []).map((s) => ({
    name: s.subject,
    value: s.actualHours
  })).filter((s) => s.value > 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#DCEBFA] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E4E8C] mb-1">
              <FileBarChart2 className="w-4 h-4" />
              <span>Performance Analytics & Export Hub (Asia/Kolkata)</span>
            </div>
            <h1 className="font-heading font-bold text-2xl text-[#24324A]">
              Study Reports & Analytics
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Exact Reporting Period:{' '}
              <strong className="text-[#24324A]">
                {formatReadableDate(startDate)} to {formatReadableDate(endDate)}
              </strong>
            </p>
          </div>

          {/* Report Period Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setReportType('weekly')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  reportType === 'weekly'
                    ? 'bg-[#6B9ACF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#24324A]'
                }`}
              >
                Weekly (7-Day)
              </button>
              <button
                onClick={() => setReportType('15-day')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  reportType === '15-day'
                    ? 'bg-[#6B9ACF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#24324A]'
                }`}
              >
                15-Day
              </button>
              <button
                onClick={() => setReportType('monthly')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  reportType === 'monthly'
                    ? 'bg-[#6B9ACF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#24324A]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setReportType('custom')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  reportType === 'custom'
                    ? 'bg-[#6B9ACF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#24324A]'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>
        </div>

        {/* Custom Range Date Pickers */}
        {reportType === 'custom' && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700">Custom Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
            />
          </div>
        )}

        {/* Download Buttons Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B9ACF] hover:bg-[#5888BF] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>
                Download{' '}
                {reportType === 'weekly'
                  ? 'Weekly'
                  : reportType === '15-day'
                  ? '15-Day'
                  : reportType === 'monthly'
                  ? 'Monthly'
                  : ''}{' '}
                PDF Report
              </span>
            </button>

            {/* Export Summary CSV */}
            <button
              onClick={handleExportSummaryCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Summary CSV</span>
            </button>

            {/* Export Raw Tasks CSV */}
            <button
              onClick={handleExportTasksCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Task Records CSV</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Generated on demand from study records
          </span>
        </div>
      </div>

      {loading || !analytics ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Computing report statistics and retrieving database records...
        </div>
      ) : (
        <>
          {/* Executive Summary Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. Completion Rate */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 card-shadow">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Completion Rate
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-heading text-[#24324A]">
                  {analytics.totals.completionPercentage !== null
                    ? `${analytics.totals.completionPercentage}%`
                    : 'N/A'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {analytics.totals.completedTasks} of {analytics.totals.totalStudyTasksScheduled} scheduled study tasks
              </span>
            </div>

            {/* 2. Planned vs Actual Hours */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 card-shadow">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Actual Study Hours
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-heading text-[#1E4E8C]">
                  {analytics.totals.actualHours} hrs
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Planned: {analytics.totals.plannedHours} hrs
              </span>
            </div>

            {/* 3. Question Accuracy */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 card-shadow">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Question Accuracy
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-heading text-emerald-700">
                  {analytics.totals.accuracyPercentage !== null
                    ? `${analytics.totals.accuracyPercentage}%`
                    : 'N/A'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {analytics.totals.correctAnswers} / {analytics.totals.questionsAttempted} Attempted
              </span>
            </div>

            {/* 4. Resolved Mistakes Rate */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 card-shadow">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Resolved Mistakes
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-heading text-rose-700">
                  {analytics.totals.resolvedMistakesCount} / {analytics.totals.mistakesLogged}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {analytics.totals.resolvedMistakesRate}% resolved
              </span>
            </div>
          </div>

          {/* Subject Breakdown & Daily Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject-Wise Time Allocation Chart */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#6B9ACF]" />
                  <h3 className="font-heading font-bold text-sm text-[#24324A]">
                    Subject-Wise Study Hours (Planned vs Actual)
                  </h3>
                </div>
              </div>

              <div className="h-56 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.subjectBreakdown}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="h" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFDF9',
                        borderColor: '#DCEBFA',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="plannedHours" name="Planned (hrs)" fill="#DCEBFA" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actualHours" name="Actual (hrs)" fill="#6B9ACF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Performance Progression */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#3B8A61]" />
                  <h3 className="font-heading font-bold text-sm text-[#24324A]">
                    Daily Completion Percentage Breakdown
                  </h3>
                </div>
              </div>

              <div className="h-56 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.dailyPerformance}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => val.slice(5)}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
                    <Tooltip
                      formatter={(val, name, item) => [
                        `${val}% (${item.payload.completed}/${item.payload.scheduled} tasks)`,
                        'Completion'
                      ]}
                      labelFormatter={(label) => formatReadableDate(label)}
                      contentStyle={{
                        backgroundColor: '#FFFDF9',
                        borderColor: '#DCEBFA',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="completionRate" fill="#3B8A61" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Subject-Wise Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow">
            <h3 className="font-heading font-bold text-sm text-[#24324A] mb-3">
              Subject-Wise Study Statistics & Accuracy
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-[#FFF9F0]">
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Tasks Completed</th>
                    <th className="py-2.5 px-3">Completion %</th>
                    <th className="py-2.5 px-3">Actual Hours</th>
                    <th className="py-2.5 px-3">Planned Hours</th>
                    <th className="py-2.5 px-3">Questions Attempted</th>
                    <th className="py-2.5 px-3">Accuracy %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.subjectBreakdown.map((s) => (
                    <tr key={s.subject} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-[#24324A]">{s.subject}</td>
                      <td className="py-2 px-3">{s.completedTasks} / {s.totalTasks}</td>
                      <td className="py-2 px-3 font-medium text-[#1E4E8C]">{s.completionRate}%</td>
                      <td className="py-2 px-3">{s.actualHours} hrs</td>
                      <td className="py-2 px-3 text-slate-500">{s.plannedHours} hrs</td>
                      <td className="py-2 px-3">{s.questionsAttempted}</td>
                      <td className="py-2 px-3 font-semibold text-emerald-700">
                        {s.accuracyRate !== null ? `${s.accuracyRate}%` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#BCD8F5] card-shadow">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-heading font-bold text-sm text-[#24324A]">
                Actionable Performance Recommendations
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs"
                >
                  <span className="font-bold text-xs text-[#24324A] block mb-1">
                    {idx + 1}. {rec.title}
                  </span>
                  <p className="text-xs text-[#64748B] leading-relaxed">{rec.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Reflections & Next-Period Goals (Persisted to Supabase) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-bold text-sm text-[#24324A]">
                Personal Reflections & Next-Period Goals
              </h3>
              {savedGoalsNotice && (
                <span className="text-xs text-[#236944] bg-[#EAF5ED] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved successfully
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#24324A] mb-1">
                  Self-Reflection for this Period
                </label>
                <textarea
                  rows="4"
                  placeholder="What study habits worked well? What caused timetable deviations? What concept breakthroughs occurred?"
                  value={reflections}
                  onChange={(e) => setReflections(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#24324A] mb-1">
                  Goals for Next Cycle
                </label>
                <textarea
                  rows="4"
                  placeholder="Specific targets (e.g. resolve all 4 edge-case mistakes; complete Dynamic Programming revision; maintain 7h sleep)."
                  value={nextPeriodGoals}
                  onChange={(e) => setNextPeriodGoals(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveGoals}
                disabled={isSavingGoals}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B9ACF] hover:bg-[#5888BF] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Reflections & Goals</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
