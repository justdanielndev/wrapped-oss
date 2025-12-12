import React from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';

export default function Prox2Slide({ data }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden bg-wrapped-black text-wrapped-cream">
      <div className="absolute inset-0 opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }} 
      />
      
      <div className="z-10 text-center px-6 relative w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7"
        >
          <div className="inline-block border-2 border-wrapped-cream px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">
            Classified
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mix-blend-difference">
            PROX2
          </h2>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="relative mb-7"
        >
          <div className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-transparent text-stroke-2 text-stroke-cream opacity-50 absolute top-0 left-1/2 -translate-x-1/2 blur-sm">
            {data.prox2Messages}
          </div>
          <div className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-wrapped-cream relative z-10">
            {data.prox2Messages}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xl font-bold uppercase tracking-widest opacity-60"
        >
          Anon confessions or meta posts.
          <br />
          <span className="text-xs mt-2 block opacity-50 normal-case tracking-normal">
            (CRT definitely didn't read your slack IDs secretly)
          </span>
        </motion.p>
      </div>
    </div>
  );
}
