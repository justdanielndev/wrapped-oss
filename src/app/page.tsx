'use client';

import { useState, useEffect } from 'react';
import WrappedContainer, { SlideConfig } from '@/components/wrapped/WrappedContainer';
import { SLIDES } from '@/lib/slides';
import { WrappedData } from '@/types/wrapped';

export default function Home() {
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    includePrivates: true,
    githubUsername: ''
  });
  const [onWaitlist, setOnWaitlist] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const params = new URLSearchParams(window.location.search);
        const customHackatime = params.get('customHackatime');
        const url = customHackatime 
          ? `/api/wrapped?customHackatime=${customHackatime}` 
          : '/api/wrapped';

        const res = await fetch(url);
        
        if (res.status === 401) {
          setLoading(false);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setData(data);
        } else if (res.status === 404) {
            const errorData = await res.json();
            if (errorData.waitlist) {
                setOnWaitlist(true);
                if (errorData.waitlist.status === 'processing') {
                    setIsProcessing(true);
                } else {
                    setWaitlistPosition(errorData.waitlist.position);
                }
            } else {
                const waitlistRes = await fetch('/api/waitlist', { method: 'POST' });
                if (waitlistRes.ok) {
                    setOnWaitlist(true);
                    window.location.reload();
                } else {
                    setError('Failed to load data');
                }
            }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to check status.');
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, []);

  const handleLogin = () => {
    if (!config.githubUsername) {
        setError('Please enter your GitHub username');
        return;
    }
    
    const baseUrl = config.includePrivates ? '/api/auth/login' : '/api/auth/login-noprivates';
    const url = `${baseUrl}?github=${encodeURIComponent(config.githubUsername)}`;
    window.location.href = url;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wrapped-black text-wrapped-cream">
        <div className="animate-pulse text-2xl font-bold">Loading your 2025 Wrapped...</div>
      </div>
    );
  }

  if (onWaitlist) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-wrapped-black text-wrapped-cream p-4">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-black mb-6 tracking-tighter">
            {isProcessing ? '⚙️' : '⏳'}
          </h1>
          <h2 className="text-4xl font-black mb-4 tracking-tighter">
            {isProcessing ? 'Crunching the numbers...' : "You're on the list!"}
          </h2>
          
          {!isProcessing && waitlistPosition !== null && (
             <div className="bg-white/10 rounded-xl p-4 mb-6">
                <p className="text-sm uppercase tracking-widest opacity-70 mb-1">Your Position</p>
                <p className="text-4xl font-black">{waitlistPosition}</p>
             </div>
          )}

          <p className="text-xl opacity-80 mb-8">
            {isProcessing 
                ? "We're generating your wrapped right now! This shouldn't take long."
                : "We'll get your wrapped ready and try to let you know in Slack once it's done! Please check back later :3"
            }
          </p>
          <p className="text-sm opacity-60">
            This might take a few minutes to a few hours depending on demand. I'm sorry for the wait :( but slack rate limits are a pain.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    if (showConfig) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-wrapped-black text-wrapped-cream p-4">
                <div className="w-full max-w-md">
                    <h1 className="text-4xl font-black mb-8 tracking-tighter text-center">
                        Configure your Wrapped
                    </h1>
                    
                    <div className="flex flex-col gap-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <label className="flex items-start gap-4 cursor-pointer">
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox"
                                        checked={config.includePrivates}
                                        onChange={(e) => setConfig(prev => ({ ...prev, includePrivates: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wrapped-red"></div>
                                </div>
                                <div className="flex-1">
                                    <span className="text-lg font-bold block mb-1">Include DMs & Private Channels</span>
                                    <p className="text-sm opacity-60 leading-relaxed">
                                        We'll count messages in your DMs and private channels to show an accurate message count, together with your top DMs and channels.
                                        <br/>
                                        <span className="text-wrapped-red font-bold">We do not read or store your message content at any point.</span>
                                        <br/>
                                        Your token is deleted immediately after counting your messages.
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold uppercase tracking-widest opacity-70 ml-1">GitHub Username</label>
                            <input
                                type="text"
                                value={config.githubUsername}
                                onChange={(e) => setConfig(prev => ({ ...prev, githubUsername: e.target.value }))}
                                placeholder="torvalds"
                                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-wrapped-red transition-colors w-full"
                            />
                            <p className="text-xs opacity-50 ml-1">Used to find your shipped projects.</p>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

                        <button
                            onClick={handleLogin}
                            className="bg-wrapped-red text-wrapped-cream px-8 py-4 rounded-xl text-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-3 w-full mt-4"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.315zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.522-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.522 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.522 2.521A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.52h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.522 2.527 2.527 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                            </svg>
                            Sign in with Slack
                        </button>
                        
                        <button 
                            onClick={() => setShowConfig(false)}
                            className="text-sm opacity-50 hover:opacity-100 transition-opacity"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-wrapped-black text-wrapped-cream p-4">
        <h1 className="text-6xl font-black mb-8 tracking-tighter">
          HC Wrapped
        </h1>
        <p className="text-xl mb-8 opacity-80 text-center max-w-md">
          Ready to see your year in review? Sign in with Slack to generate your Hack Club Wrapped.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setShowConfig(true)}
            className="bg-wrapped-red text-wrapped-cream px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform flex items-center gap-3"
          >
            Get your Wrapped
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <WrappedContainer data={data} slides={SLIDES} />
    </main>
  );
}
