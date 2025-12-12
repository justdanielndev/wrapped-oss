import React from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';

export default function TopChannelsSlide({ data }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden p-8">
      <div className="absolute inset-0 z-0 grid grid-cols-6 gap-8 p-8 opacity-20 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-12 h-12 rounded-full bg-wrapped-red"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring" }}
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-md">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-wrapped-black mb-12 text-center tracking-tight"
        >
          Your top channels
        </motion.h2>

        <div className="flex flex-col gap-4">
          {data.topChannels.map((channel, index) => (
            <motion.div
              key={channel.name}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="flex items-center gap-4"
            >
              <span className="text-4xl font-black text-wrapped-black w-8">{channel.rank}</span>
              <div className="bg-wrapped-black text-wrapped-cream px-6 py-4 text-3xl font-bold transform -skew-x-6 w-full shadow-lg">
                <span className="transform skew-x-6 inline-block">#{channel.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
