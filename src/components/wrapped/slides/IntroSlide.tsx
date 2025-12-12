import React from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';
import { Squiggle } from '../ui/Shapes';

export default function IntroSlide({ data }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center w-full relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
         <Squiggle className="absolute top-20 left-[-50px] w-[300px] text-wrapped-black rotate-12" />
         <Squiggle className="absolute bottom-40 right-[-50px] w-[400px] text-wrapped-black -rotate-6" />
      </div>

      <div className="z-10 flex flex-col items-center gap-6 max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8"
        >
          <img 
            src="https://assets.hackclub.com/flag-standalone.svg" 
            alt="Hack Club Flag" 
            className="w-32 h-auto"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-wrapped-black"
        >
          We're ready for you,
          <br />
          <span className="text-4xl text-wrapped-red">{data.userName}.</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm font-medium text-wrapped-muted uppercase tracking-widest"
        >
          Here's your wrapped!
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 1.2, type: "spring", bounce: 0.5 }}
          className="relative"
        >
          <h1 className="text-[140px] leading-[0.8] font-black text-wrapped-red tracking-tighter mix-blend-multiply">
            2025
          </h1>
        </motion.div>
      </div>
    </div>
  );
}
