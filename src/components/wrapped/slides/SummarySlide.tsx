import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideProps } from '@/types/wrapped';

export default function SummarySlide({ data }: SlideProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col h-full w-full bg-wrapped-black text-wrapped-cream p-4 pt-20 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />

      <div className="flex justify-between items-start mb-2 z-10 shrink-0">
        <h1 className="text-5xl font-black tracking-tighter leading-none">
          2025 Wrapped
        </h1>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Summary</div>
          <div className="text-sm font-bold">{data.userName}</div>
        </div>
      </div>

      <div className="grid grid-cols-6 grid-rows-6 gap-1.5 flex-1 z-10 min-h-0 pb-2">
        
        <div className="col-span-4 row-span-2 bg-wrapped-cream text-wrapped-black rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Messages</span>
          <span className="text-4xl md:text-5xl font-black tracking-tighter leading-none">{data.totalMessages.toLocaleString()}</span>
        </div>

        <div className="col-span-2 row-span-2 bg-wrapped-blue text-wrapped-black rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Hackatime</span>
          <span className="text-3xl md:text-4xl font-black tracking-tighter leading-none">{Math.round(data.hackatimeHours)}<span className="text-xl">h</span></span>
        </div>

        <div className="col-span-6 row-span-1 bg-wrapped-yellow text-wrapped-black rounded-2xl p-2 flex items-center justify-between px-4">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Habitat</span>
          <span className="text-xl md:text-2xl font-black tracking-tighter truncate">#{data.topChannels[0].name}</span>
        </div>

        <div className="col-span-3 row-span-2 bg-wrapped-red text-wrapped-cream rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Shipped</span>
          <span className="text-4xl md:text-5xl font-black tracking-tighter leading-none">{data.ySwsSubmissions}</span>
        </div>

        <div className="col-span-3 row-span-2 bg-[#1e1e1e] text-wrapped-cream border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Bestie</span>
          <span className="text-xl md:text-2xl font-black tracking-tighter truncate">@{data.topDms[0].name}</span>
        </div>

        <div className="col-span-2 row-span-1 bg-wrapped-purple text-wrapped-cream rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
          <span className="text-[8px] font-bold uppercase opacity-60">Meta msgs</span>
          <span className="text-xl font-black leading-none">{data.metaMessages}</span>
        </div>
        <div className="col-span-2 row-span-1 bg-wrapped-cream text-wrapped-black rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
          <span className="text-[8px] font-bold uppercase opacity-60">Prox2 msgs</span>
          <span className="text-xl font-black leading-none">{data.prox2Messages}</span>
        </div>
        <div className="col-span-2 row-span-1 bg-[#2a2a2a] text-wrapped-cream rounded-xl p-1.5 flex flex-col justify-center items-center text-center border border-white/10">
          <span className="text-[8px] font-bold uppercase opacity-60">Confessions msgs</span>
          <span className="text-xl font-black leading-none">{data.confessionsMessages}</span>
        </div>

      </div>
    </div>
  );
}
