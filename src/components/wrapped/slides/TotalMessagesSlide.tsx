import React from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';

export default function TotalMessagesSlide({ data }: SlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center w-full relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-20">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute border-[20px] border-wrapped-cream rounded-full"
            style={{ width: `${i * 200}px`, height: `${i * 200}px` }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="z-10 max-w-2xl px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <h2 className="text-[120px] font-black text-wrapped-cyan leading-none tracking-tighter">
            {data.totalMessages.toLocaleString()}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-2xl font-bold text-wrapped-cream"
        >
          You sent <span className="text-wrapped-cyan">{data.totalMessages.toLocaleString()}</span> messages across the Slack.
          <br />
          That's a lot of yapping.
        </motion.div>
      </div>
    </div>
  );
}
