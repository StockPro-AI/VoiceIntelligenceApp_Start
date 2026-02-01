import React from 'react';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { getLoginUrl } from '@/const';
import { Mic } from 'lucide-react';

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Voice Intelligence
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {user?.role === 'admin' ? 'Admin' : 'User'}
                  </p>
                </div>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="text-sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {!isAuthenticated ? (
          // Landing Section
          <div className="text-center space-y-8 py-20">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white">
                Transform Your Voice Into Intelligence
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Record, transcribe, and intelligently enrich your thoughts with AI-powered processing.
                Seamless desktop integration with global hotkey activation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-semibold px-8"
              >
                Learn More
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 pt-16">
              {[
                {
                  title: 'Voice Recording',
                  description: 'Crystal-clear audio capture with advanced noise cancellation',
                  icon: '🎤',
                },
                {
                  title: 'AI Transcription',
                  description: 'Accurate speech-to-text powered by Whisper API',
                  icon: '📝',
                },
                {
                  title: 'Smart Enrichment',
                  description: 'Transform transcripts with AI-powered formatting and summarization',
                  icon: '✨',
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // App Section
          <div className="space-y-8">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Voice Intelligence Assistant
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Press Alt+Shift+V to activate anytime, or use the interface below
              </p>
            </div>

            <VoiceRecorder />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>Voice Intelligence © 2026. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
