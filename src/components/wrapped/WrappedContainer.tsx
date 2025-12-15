'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WrappedData } from '@/types/wrapped';

export interface SlideConfig {
  component: React.ComponentType<any>;
  theme: 'light' | 'dark';
}

interface WrappedContainerProps {
  data: WrappedData;
  slides: SlideConfig[];
  isSharedView?: boolean;
}

export default function WrappedContainer({ data, slides, isSharedView = false }: WrappedContainerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSharingLoading, setIsSharingLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.muted = true;
    }
  }, []);

  useEffect(() => {
    if (!isSharedView) {
      fetch('/api/share')
        .then(res => res.json())
        .then(data => {
          if (data.publicId) {
            setShareUrl(`${window.location.origin}/view/${data.publicId}`);
          }
        })
        .catch(console.error);
    }
  }, [isSharedView]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audioRef.current?.pause();
      } else if (!isMuted) {
        audioRef.current?.play().catch(console.error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMuted]);

  const handleShare = async () => {
    setIsSharingLoading(true);
    try {
      const res = await fetch('/api/share', { method: 'POST' });
      const data = await res.json();
      if (data.publicId) {
        setShareUrl(`${window.location.origin}/view/${data.publicId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharingLoading(false);
    }
  };

  const handleDeleteShare = async () => {
    setIsSharingLoading(true);
    try {
      await fetch('/api/share', { method: 'DELETE' });
      setShareUrl(null);
      setShowShareMenu(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharingLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setShowShareMenu(false);
    }
  };

  const toggleMute = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      audioRef.current.muted = newMutedState;
      if (!newMutedState) {
        audioRef.current.play().catch(console.error);
      }
    }
  };
  
  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setDirection(1);
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setDirection(-1);
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      nextSlide();
    } else if (event.key === 'ArrowLeft') {
      prevSlide();
    } else if (event.key === ' ') {
      setIsPaused((prev) => !prev);
    }
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleClickOutside = () => setShowShareMenu(false);
    if (showShareMenu) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showShareMenu]);

  const currentSlideConfig = slides[currentSlideIndex];
  const CurrentSlide = currentSlideConfig.component;
  const isDark = currentSlideConfig.theme === 'dark';

  return (
    <div 
      className={`relative w-full h-[100dvh] overflow-hidden flex items-center justify-center transition-colors duration-500 ${isDark ? 'bg-wrapped-black text-wrapped-cream' : 'bg-wrapped-cream text-wrapped-black'}`}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      
      <div className="absolute top-4 left-0 w-full px-4 flex gap-2 z-50">
        {slides.map((_, index) => {
          const isCompleted = index < currentSlideIndex;
          const isActive = index === currentSlideIndex;
          
          return (
            <div key={index} className={`h-1 flex-1 rounded-full overflow-hidden relative ${isDark ? 'bg-white/20' : 'bg-black/20'}`}>
              <div
                className={`h-full ${isDark ? 'bg-white' : 'bg-black'}`}
                style={{
                  width: isCompleted ? '100%' : isActive ? '100%' : '0%',
                  transition: isActive ? 'width 5s linear' : 'none',
                  opacity: 0
                }}
              />
              {isActive && (
                 <ProgressBar 
                   duration={5000} 
                   isPaused={isPaused} 
                   onComplete={nextSlide} 
                   color={isDark ? 'white' : 'black'}
                 />
              )}
              {isCompleted && (
                <div className={`h-full w-full absolute top-0 left-0 ${isDark ? 'bg-white' : 'bg-black'}`} />
              )}
            </div>
          );
        })}
      </div>

      <audio ref={audioRef} src="/music.mp3" loop />
      
      <div className="absolute top-8 left-4 z-50">
        {!isSharedView ? (
            <div className="relative">
                <button
                    onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="19" cy="12" r="1" />
                        <circle cx="5" cy="12" r="1" />
                    </svg>
                </button>
                
                {showShareMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden py-1 text-black">
                        {shareUrl ? (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium"
                                >
                                    Copy Link
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteShare(); }}
                                    disabled={isSharingLoading}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium text-red-600"
                                >
                                    {isSharingLoading ? 'Deleting...' : 'Stop Sharing'}
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                                disabled={isSharingLoading}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-medium"
                            >
                                {isSharingLoading ? 'Creating...' : 'Share Wrapped'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        ) : (
            <a 
                href="/"
                className={`block px-4 py-2 rounded-full backdrop-blur-sm transition-colors text-sm font-bold ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}
            >
                Get your own Wrapped
            </a>
        )}
      </div>

      <button
        onClick={toggleMute}
        className={`absolute top-8 right-4 z-50 p-2 rounded-full backdrop-blur-sm transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      <div className="absolute inset-0 flex z-40">
        <div className="w-1/3 h-full cursor-w-resize" onClick={(e) => { e.stopPropagation(); prevSlide(); }} />
        <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); nextSlide(); }} />
        <div className="w-1/3 h-full cursor-e-resize" onClick={(e) => { e.stopPropagation(); nextSlide(); }} />
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlideIndex}
          custom={direction}
          variants={{
            enter: (direction: number) => ({
              x: direction > 0 ? '100%' : '-100%',
              opacity: 0,
            }),
            center: {
              zIndex: 1,
              x: 0,
              opacity: 1,
            },
            exit: (direction: number) => ({
              zIndex: 0,
              x: direction < 0 ? '100%' : '-100%',
              opacity: 0,
            })
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0 flex items-center justify-center w-full h-full pointer-events-none"
        >
          <div className="pointer-events-auto w-full h-full">
             <CurrentSlide data={data} isActive={!isPaused} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProgressBar({ duration, isPaused, onComplete, color }: { duration: number, isPaused: boolean, onComplete: () => void, color: string }) {
  const [progress, setProgress] = useState(0);
  const lastTimeRef = useRef(Date.now());
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (!isPaused && !hasCompletedRef.current) {
        setProgress((prev) => {
          const newProgress = prev + (delta / duration) * 100;
          if (newProgress >= 100) {
            if (!hasCompletedRef.current) {
              hasCompletedRef.current = true;
              onComplete();
            }
            return 100;
          }
          return newProgress;
        });
      }
      
      if (!hasCompletedRef.current) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    lastTimeRef.current = Date.now();
    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, duration, onComplete]);

  return (
    <div 
      className="h-full absolute top-0 left-0"
      style={{ 
        width: `${progress}%`, 
        backgroundColor: color 
      }} 
    />
  );
}
