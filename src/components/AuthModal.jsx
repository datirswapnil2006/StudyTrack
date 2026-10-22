import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp, useDemoAccount, isConfigured } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await signUp(email, password, fullName);
        if (error) throw error;
        setSuccessMsg(
          isConfigured
            ? 'Account created! Please check your email inbox to confirm your registration.'
            : 'Account registered successfully!'
        );
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    useDemoAccount();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#BCD8F5] relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#DCEBFA] text-[#1E4E8C] flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-[#24324A]">
            {isRegister ? 'Create Study Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            {isConfigured
              ? 'Authenticate securely with Supabase Auth'
              : 'Sign in to access your customized personal study schedule'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FDEEEB] border border-[#F8C6BF] text-[#D9534F] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#EAF5ED] border border-[#BFE3CD] text-[#236944] text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#24324A] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Aditya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF] focus:ring-2 focus:ring-[#DCEBFA]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="your.email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF] focus:ring-2 focus:ring-[#DCEBFA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24324A] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-[#6B9ACF] focus:ring-2 focus:ring-[#DCEBFA]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#6B9ACF] hover:bg-[#5888BF] text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isRegister ? (
              <>
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col gap-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs text-[#2B6CB0] font-medium hover:underline"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register"}
          </button>

          <button
            type="button"
            onClick={handleDemoMode}
            className="text-xs text-[#64748B] hover:text-[#24324A] underline"
          >
            Or continue in Demo Scholar Mode
          </button>
        </div>
      </div>
    </div>
  );
}
