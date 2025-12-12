import React from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';

export default function ConfessionsMetaSlide({ data }: SlideProps) {
  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">

      <div className="flex-1 bg-wrapped-red flex items-center justify-center relative overflow-hidden">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center z-10"
        >
          <h3 className="text-3xl font-black text-wrapped-cream uppercase mb-2">#confessions</h3>
          <div className="text-6xl font-black text-wrapped-black">{data.confessionsMessages}</div>
          <div className="text-sm font-bold text-wrapped-cream/80 mt-2">MESSAGES SENT</div>
        </motion.div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://assets.hackclub.com/flag-standalone.svg')] bg-repeat space-x-4" />
      </div>

      <div className="flex-1 bg-wrapped-black flex items-center justify-center relative overflow-hidden">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          className="text-center z-10"
        >
          <h3 className="text-3xl font-black text-wrapped-cream uppercase mb-2">#meta</h3>
          <div className="text-6xl font-black text-wrapped-blue">{data.metaMessages}</div>
          <div className="text-sm font-bold text-wrapped-cream/80 mt-2">MESSAGES SENT</div>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-wrapped-cream text-wrapped-black px-6 py-2 rounded-full font-black text-xl z-20 border-4 border-wrapped-black"
      >
        VS
      </motion.div>
    </div>
  );
}
