'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';
import { CLANS } from '@/lib/clans';

const GROUPS = CLANS.map(c => c.name);

export default function GroupSlide({ data }: SlideProps) {
  const [displayedGroup, setDisplayedGroup] = useState(GROUPS[0]);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let counter = 0;
    const duration = 2000;
    const steps = 20;
    const stepTime = duration / steps;
    
    interval = setInterval(() => {
      setDisplayedGroup(GROUPS[Math.floor(Math.random() * GROUPS.length)]);
      counter++;
      if (counter >= steps) {
        clearInterval(interval);
        setDisplayedGroup(data.randomGroup);
        setIsRevealed(true);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [data.randomGroup]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden bg-wrapped-red text-wrapped-cream">
      <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none"
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />
      
      <div className="z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-center w-full"
        >
          <div className="text-xl font-bold uppercase tracking-widest bg-wrapped-black text-wrapped-cream px-4 py-2 inline-block transform -rotate-2">
           Your clan
          </div>
        </motion.div>

        <div className="relative min-h-[200px] flex flex-col items-center justify-center">


          <motion.div
            key={displayedGroup}
            className={`text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter ${isRevealed ? 'text-wrapped-cream' : 'text-wrapped-black/20'}`}
          >
            {displayedGroup.split(' ').map((word, i) => (
              <div key={i} className={i % 2 === 0 ? 'ml-[-20px]' : 'ml-[20px]'}>
                {word}
              </div>
            ))}
          </motion.div>
        </div>

        {isRevealed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-xl font-bold max-w-md"
          >
            <span className="text-sm font-normal opacity-80 uppercase tracking-widest mt-2 block">
              Hope you feel cozy here!
            </span>
          </motion.p>
        )}
      </div>
    </div>
  );
}
