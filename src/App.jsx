import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LoginPromptView from './components/LoginPromptView';
import MistakeModal from './components/MistakeModal';
import TopicModal from './components/TopicModal';
import DashboardView from './views/DashboardView';
import TimetableView from './views/TimetableView';
import MistakesView from './views/MistakesView';
import DifficultTopicsView from './views/DifficultTopicsView';
import ReportsView from './views/ReportsView';
import { calculateStudyStreak, saveCodingMistake, saveDifficultTopic } from './services/studyService';
import { Clock, Heart } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [streak, setStreak] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [isGlobalMistakeModalOpen, setIsGlobalMistakeModalOpen] = useState(false);
  const [isGlobalTopicModalOpen, setIsGlobalTopicModalOpen] = useState(false);

  const handleOpenAuth = (msg = '') => {
    const prompt = typeof msg === 'string' && msg.trim()
      ? msg
      : 'Sign in to access your personal study schedule';
    setAuthPromptMessage(prompt);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    if (user) {
      calculateStudyStreak(user.id).then(setStreak);
    }
  }, [user, activeTab]);

  const handleSaveGlobalMistake = async (mistakeData) => {
    if (!user) return;
    await saveCodingMistake(user.id, mistakeData);
    setIsGlobalMistakeModalOpen(false);
  };

  const handleSaveGlobalTopic = async (topicData) => {
    if (!user) return;
    await saveDifficultTopic(user.id, topicData);
    setIsGlobalTopicModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#DCEBFA] text-[#1E4E8C] flex items-center justify-center animate-pulse mb-3">
          <Clock className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-sm font-semibold text-[#24324A]">
          Loading StudyTrack...
        </div>
        <p className="text-xs text-[#64748B] mt-1">Initializing Supabase session</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-[#24324A] flex flex-col selection:bg-[#DCEBFA] selection:text-[#1E4E8C]">
      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streak={streak}
        onOpenAuth={handleOpenAuth}
      />

      {/* Primary Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {!user ? (
          <LoginPromptView onOpenAuth={handleOpenAuth} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                user={user}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenMistakeModal={() => setIsGlobalMistakeModalOpen(true)}
                onOpenTopicModal={() => setIsGlobalTopicModalOpen(true)}
              />
            )}

            {activeTab === 'timetable' && (
              <TimetableView
                user={user}
                onOpenMistakeModal={() => setIsGlobalMistakeModalOpen(true)}
              />
            )}

            {activeTab === 'mistakes' && (
              <MistakesView user={user} />
            )}

            {activeTab === 'topics' && (
              <DifficultTopicsView user={user} />
            )}

            {activeTab === 'reports' && (
              <ReportsView user={user} />
            )}
          </>
        )}
      </main>

      {/* Clean, minimalist footer */}
      <footer className="mt-auto border-t border-[#E2E8F0] bg-[#FFF9F0] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-[#24324A]">StudyTrack</span>
            <span>• Personal Study Progress Tracker & Performance Analytics</span>
          </div>
          <div>
            <span>Empowering daily consistency & mastery</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPromptMessage('');
        }}
        promptMessage={authPromptMessage}
      />

      {isGlobalMistakeModalOpen && (
        <MistakeModal
          isOpen={isGlobalMistakeModalOpen}
          mistake={null}
          onClose={() => setIsGlobalMistakeModalOpen(false)}
          onSave={handleSaveGlobalMistake}
        />
      )}

      {isGlobalTopicModalOpen && (
        <TopicModal
          isOpen={isGlobalTopicModalOpen}
          topic={null}
          onClose={() => setIsGlobalTopicModalOpen(false)}
          onSave={handleSaveGlobalTopic}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
