import React from 'react';
import {
  Lock,
  LogIn,
  CalendarDays,
  Bug,
  Brain,
  FileBarChart2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPromptView({ onOpenAuth }) {
  const { useDemoAccount } = useAuth();

  const features = [
    {
      icon: CalendarDays,
      title: 'College & No-College Timetables',
      desc: 'Smart schedules tailored for college routines and focused self-study days, including late-night midnight tasks.',
      color: 'bg-[#DCEBFA] text-[#1E4E8C] border-[#BCD8F5]'
    },
    {
      icon: Bug,
      title: 'Dedicated DSA Mistake Tracker',
      desc: 'Catalog LeetCode mistakes by category (Conceptual, Edge Case, Time Complexity) and schedule spaced revisions.',
      color: 'bg-[#FDEEEB] text-[#D9534F] border-[#F8C6BF]'
    },
    {
      icon: Brain,
      title: 'Weak Topics & Cognitive Mastery',
      desc: 'Monitor challenging concepts with 1–5 star confidence levels and track improvements over multiple revisions.',
      color: 'bg-[#F3EBF9] text-[#7E57C2] border-[#DFCEF4]'
    },
    {
      icon: FileBarChart2,
      title: 'Executive PDF & CSV Reports',
      desc: 'Export downloadable weekly, 15-day, and monthly reports with charts, recommendations, and next-cycle goals.',
      color: 'bg-[#EAF5ED] text-[#236944] border-[#BFE3CD]'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in zoom-in-95 duration-200">
      {/* Hero Welcome Card */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 border border-[#DCEBFA] shadow-[0_4px_24px_rgba(36,50,74,0.06)] text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#DCEBFA]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-[#F3EBF9]/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B9ACF] to-[#4F7EAE] text-white flex items-center justify-center mx-auto shadow-md shadow-[#6B9ACF]/30">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEBFA] text-[#1E4E8C] text-xs font-bold border border-[#BCD8F5]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Study Progress Tracker</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#24324A] tracking-tight">
            Sign In to Access Your Study Dashboard
          </h1>

          <p className="text-sm text-[#64748B] leading-relaxed">
            Please sign in or create an account to view and manage your daily study timetable, track DSA practice mistakes, record weak topics, and generate performance reports.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('Please sign in or create an account to get started.')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#6B9ACF] hover:bg-[#5888BF] text-white font-bold text-sm shadow-md shadow-[#6B9ACF]/25 hover:scale-102 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={useDemoAccount}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-[#FFF9F0] text-slate-700 font-semibold text-sm transition-all cursor-pointer"
            >
              Continue in Demo Mode
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs card-hover flex gap-4"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${feat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-sm text-[#24324A]">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
