import React, { useState } from 'react';
import { Database, CheckCircle2, ChevronRight, X, ExternalLink, KeyRound, ShieldAlert } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export default function SupabaseSetupBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (dismissed) return null;

  if (isConfigured) {
    return (
      <div className="bg-[#EAF5ED] border-b border-[#BFE3CD] px-4 py-2 text-xs text-[#236944] flex items-center justify-between">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3B8A61] shrink-0" />
          <span>
            <strong>Supabase Connected:</strong> Active session with PostgreSQL and Row Level Security (RLS). All data is automatically synchronized to your database.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#3B8A61] hover:text-[#236944] p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF3E0] border-b border-[#FFE082] px-4 py-2.5 text-xs text-[#B76E00]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Local Persistence Active:</strong> Study data is currently saving to local secure storage. To sync with Supabase PostgreSQL, add your project credentials to <code className="bg-white/80 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px]">.env</code>.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowGuide(true)}
            className="font-semibold underline hover:text-amber-900 flex items-center gap-1"
          >
            <span>Supabase Setup Guide</span>
            <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-900 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Database className="w-5 h-5 text-[#6B9ACF]" />
                <h3 className="font-heading font-bold text-base">
                  Connect Supabase Database & Auth
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Follow these simple steps to enable cloud persistence, authentication, and PostgreSQL tables:
            </p>

            <ol className="space-y-3 text-xs text-slate-700 list-decimal pl-4">
              <li>
                <strong>Create Supabase Project:</strong> Sign in at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                and create a new free project.
              </li>
              <li>
                <strong>Execute Schema:</strong> Go to the <strong>SQL Editor</strong> in your Supabase dashboard and run the file provided at <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">supabase/schema.sql</code>. It creates all tables, triggers, and Row Level Security policies.
              </li>
              <li>
                <strong>Configure Environment Variables:</strong> Copy your project's URL and Anon Key from <em>Project Settings → API</em> into your <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> file:
                <pre className="mt-1.5 p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-publishable-anon-key`}
                </pre>
              </li>
              <li>
                <strong>Restart Dev Server:</strong> Run <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">npm run dev</code> to connect instantly.
              </li>
            </ol>

            <div className="p-3 rounded-xl bg-[#EAF5ED] text-[#236944] text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Don't worry if you haven't set up Supabase yet! The app currently runs in full local session mode so you can track schedules, log mistakes, and generate reports right now.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-xl bg-[#6B9ACF] text-white text-xs font-semibold hover:bg-[#5888BF]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
