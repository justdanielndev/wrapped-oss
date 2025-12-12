import React from 'react';

export const Squiggle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 20" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10" />
  </svg>
);

export const Circle = ({ className }: { className?: string }) => (
  <div className={`rounded-full ${className}`} />
);

export const GridPattern = ({ className }: { className?: string }) => (
  <div className={`grid grid-cols-6 gap-4 ${className}`}>
    {Array.from({ length: 24 }).map((_, i) => (
      <div key={i} className="aspect-square rounded-full bg-current" />
    ))}
  </div>
);
