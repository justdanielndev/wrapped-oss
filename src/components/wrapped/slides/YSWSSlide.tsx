import React from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';

export default function YSWSSlide({ data }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden bg-wrapped-yellow p-4">
      <div className="absolute inset-0 opacity-10 grid grid-cols-3 gap-4 p-4 pointer-events-none transform -rotate-12 scale-125">
         {Array.from({ length: 12 }).map((_, i) => (
           <div key={i} className="border-2 border-dashed border-wrapped-black h-32 rounded-lg" />
         ))}
      </div>

      <div className="z-10 text-center w-full max-w-lg flex flex-col items-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <h2 className="text-6xl font-black text-wrapped-black uppercase tracking-tighter leading-none">
            SHIPPED
          </h2>
          <p className="text-wrapped-black font-bold uppercase tracking-widest text-sm mt-2">
            YSWS projects
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: 10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative mb-12"
        >
          <div className="relative">
            <motion.div 
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{ x: 10, y: 10, rotate: 5 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 bg-wrapped-orange border-4 border-wrapped-black rounded-lg"
              style={{
                maskImage: 'radial-gradient(circle at 0% 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)',
                WebkitMaskImage: 'radial-gradient(circle at 0% 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)'
              }}
            />

            <div 
              className="w-80 h-40 bg-wrapped-cream border-4 border-wrapped-black relative flex items-center justify-between px-6 z-10 rounded-lg"
              style={{
                maskImage: 'radial-gradient(circle at 0% 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)',
                WebkitMaskImage: 'radial-gradient(circle at 0% 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px)'
              }}
            >
               <div className="text-left">
                 <div className="text-xs font-bold uppercase text-wrapped-muted">ADMIT ONE</div>
                 <div className="text-xl font-black text-wrapped-black">PROJECT</div>
               </div>

               <div className="text-8xl font-black text-wrapped-red leading-none">
                 {data.ySwsSubmissions}
               </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-2xl font-bold text-wrapped-black max-w-xs mx-auto leading-tight"
        >
          Got any cool grants?
          <br />
          <span className="text-sm font-normal opacity-70">
            {(() => {
              const projects = data.ySwsProjects || [];
              if (projects.length === 0) return "You haven't shipped any YSWS projects yet.";
              if (projects.length === 1) return `You participated in ${projects[0]}!`;
              if (projects.length === 2) return `You participated in ${projects[0]} and ${projects[1]}!`;
              if (projects.length === 3) return `You participated in ${projects[0]}, ${projects[1]}, and ${projects[2]}!`;
              return `You participated in ${projects[0]}, ${projects[1]}, and more!`;
            })()}
          </span>
        </motion.p>
      </div>
    </div>
  );
}
