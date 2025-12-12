import React from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';

export default function PeopleDmsSlide({ data }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden p-8 bg-wrapped-black">
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#338eda 1px, transparent 1px), linear-gradient(90deg, #338eda 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-5xl font-black text-wrapped-cream tracking-tighter mb-2">
            YOUR SQUAD
          </h2>
          <p className="text-wrapped-blue font-bold uppercase tracking-widest text-sm">
            Top DMs
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {data.topDms.map((person, index) => (
            <motion.div
              key={person.name}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex items-center gap-4 group"
            >
              <div className="text-4xl font-black text-wrapped-blue/50 w-8 text-right">
                {index + 1}
              </div>
              
              <div className="flex-1 bg-wrapped-cream text-wrapped-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(51,142,218,1)] transform transition-transform group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_0px_rgba(51,142,218,1)]">
                <div className="flex items-center gap-3">
                  {person.image ? (
                    <img src={person.image} alt={person.name} className="w-10 h-10 rounded-full object-cover border-2 border-wrapped-black" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-wrapped-black text-wrapped-cream flex items-center justify-center font-bold text-lg">
                      {person.name[0]}
                    </div>
                  )}
                  <span className="text-xl font-bold truncate max-w-[140px]">{person.name}</span>
                </div>
                <div className="bg-wrapped-blue/20 px-2 py-1 rounded text-xs font-bold text-wrapped-blue uppercase">
                  {person.count} msgs
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
