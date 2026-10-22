import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Bug,
  Brain,
  FileBarChart2,
  LogOut,
  LogIn,
  Database,
  CheckCircle,
  Menu,
  X,
  Flame,
  Clock,
  ChevronDown,
  User,
  Shield,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatReadableDate, getKolkataDateString, TIMEZONE } from '../utils/dateUtils';

export default function Navbar({ activeTab, setActiveTab, streak = 0, onOpenAuth }) {
  const { user, signOut, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const dropdownRef = useRef(null);

  const todayStr = getKolkataDateString();

  // Real-time Asia/Kolkata clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTimeStr(timeFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'mistakes', label: 'DSA Mistakes', icon: Bug },
    { id: 'topics', label: 'Weak Topics', icon: Brain },
    { id: 'reports', label: 'Reports', icon: FileBarChart2 }
  ];

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F0]/90 backdrop-blur-xl border-b border-[#24324A]/10 shadow-[0_2px_12px_rgba(36,50,74,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px]">
          {/* Brand Logo & Interactive Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6B9ACF] to-[#4F7EAE] flex items-center justify-center text-white shadow-md shadow-[#6B9ACF]/25 group-hover:scale-105 transition-transform duration-200">
                  <Clock className="w-5 h-5 text-white stroke-[2.2]" />
                </div>
                {/* Live Activity Pulse Indicator */}
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#FFF9F0]"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-xl text-[#24324A] tracking-tight group-hover:text-[#1E4E8C] transition-colors">
                    StudyTrack
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#DCEBFA] text-[#1E4E8C] border border-[#BCD8F5]">
                    PRO
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                  <span className="font-medium">{formatReadableDate(todayStr)}</span>
                  {currentTimeStr && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[10px] bg-white/80 px-1.5 py-0.2 rounded border border-slate-200 text-[#1E4E8C] font-semibold">
                        {currentTimeStr}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/70 p-1.5 rounded-2xl border border-slate-200/70 shadow-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#6B9ACF] text-white shadow-sm shadow-[#6B9ACF]/30 scale-[1.02]'
                      : 'text-[#64748B] hover:text-[#24324A] hover:bg-[#FFF9F0]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Streak Indicator with subtle glow */}
            <div
              title={`${streak} consecutive days with completed tasks`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FEF3C7] to-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs font-bold shadow-xs hover:scale-105 transition-transform"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streak}d Streak</span>
            </div>

            {/* User Profile / Auth Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-white/80 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6B9ACF] to-[#8EB7E5] text-white flex items-center justify-center font-bold text-xs shadow-xs uppercase">
                    {userInitial}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold text-[#24324A] truncate max-w-[100px]">
                      {userName}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FFFDF9] border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 bg-[#FFF9F0] rounded-xl border border-slate-100 mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#6B9ACF] text-white flex items-center justify-center font-bold text-xs">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#24324A] truncate">{userName}</p>
                          <p className="text-[10px] text-[#64748B] truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveTab('timetable');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#DCEBFA]/40 hover:text-[#1E4E8C] rounded-lg transition-colors text-left"
                      >
                        <CalendarDays className="w-4 h-4 text-[#6B9ACF]" />
                        <span>Manage Daily Timetable</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('reports');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#DCEBFA]/40 hover:text-[#1E4E8C] rounded-lg transition-colors text-left"
                      >
                        <FileBarChart2 className="w-4 h-4 text-[#6B9ACF]" />
                        <span>Performance Analytics</span>
                      </button>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          signOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B9ACF] hover:bg-[#5888BF] text-white text-xs font-bold shadow-sm shadow-[#6B9ACF]/30 hover:scale-102 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{streak}d</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#24324A] hover:bg-[#DCEBFA]/50 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-[#FFF9F0] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between py-1.5 px-2 mb-2 bg-white/70 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Live Time (IST):</span>
            <span className="font-mono text-xs font-bold text-[#1E4E8C]">{currentTimeStr}</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#6B9ACF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#24324A] hover:bg-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-[#64748B] truncate max-w-[180px]">
              {user?.email || 'Demo Mode'}
            </span>
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-[#D9534F] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-[#1E4E8C] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-50"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
