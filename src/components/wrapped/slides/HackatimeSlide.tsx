import React from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';
import { Squiggle } from '../ui/Shapes';

export default function HackatimeSlide({ data }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden bg-wrapped-cream text-wrapped-black">
      <div className="absolute inset-0 z-0">
        <Squiggle className="absolute top-[-50px] right-[-50px] w-[400px] text-wrapped-blue opacity-20 rotate-45" />
        <Squiggle className="absolute bottom-[-50px] left-[-50px] w-[400px] text-wrapped-red opacity-20 -rotate-12" />
        
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
      </div>

      <div className="z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold uppercase tracking-widest mb-8 bg-wrapped-black text-wrapped-cream px-4 py-1 rotate-2 inline-block"
        >
          Hackatime
        </motion.div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="relative flex flex-col items-center"
        >
          <h1 className="text-[120px] md:text-[160px] font-black leading-[0.8] tracking-tighter text-wrapped-red mix-blend-multiply">
            {Math.round(data.hackatimeHours)}
          </h1>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-black text-wrapped-black mt-4"
          >
            HOURS
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 max-w-md text-lg font-medium leading-tight"
        >
          <p>
            That's <span className="font-black bg-wrapped-yellow px-1">{(data.hackatimeHours * 60).toLocaleString()}</span> minutes of coding.
            <br />
            <span className="text-sm text-wrapped-muted mt-2 block">(Or debugging. Mostly debugging, be honest.)</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
