import React from 'react';

export default function SukaalifeLogo({ className = "h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 460 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* "suka" text in Soft Purple */}
      <g fill="#A98ADB" stroke="#A98ADB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* s */}
        <path d="M 52 64 C 52 53 72 51 72 44 C 72 39 60 38 48 45" fill="none" strokeWidth="11" />
        <path d="M 46 64 C 46 76 74 76 74 86 C 74 94 58 95 44 87" fill="none" strokeWidth="11" />
        
        {/* u */}
        <path d="M 92 48 L 92 76 C 92 88 112 88 112 76 L 112 48" fill="none" strokeWidth="11" />
        <path d="M 112 70 L 112 90" fill="none" strokeWidth="11" />

        {/* k (stem & lower diagonal) */}
        <path d="M 132 25 L 132 90" fill="none" strokeWidth="11" />
        <path d="M 132 68 Q 150 72 166 90" fill="none" strokeWidth="11" />
        <path d="M 132 68 Q 142 62 148 55" fill="none" strokeWidth="10" />

        {/* a (first) */}
        <circle cx="198" cy="70" r="19" fill="none" strokeWidth="11" />
        <path d="M 217 50 L 217 90" fill="none" strokeWidth="11" />

        {/* a (second) */}
        <circle cx="256" cy="70" r="19" fill="none" strokeWidth="11" />
        <path d="M 275 50 L 275 90" fill="none" strokeWidth="11" />
      </g>

      {/* Green Leaf Accent on top-right arm of 'k' */}
      <path
        d="M 142 58 C 142 42 165 38 168 38 C 168 38 168 56 142 58 Z"
        fill="#9FE2D1"
      />

      {/* "life" text in Soft Mint Green */}
      <g fill="#9FE2D1" stroke="#9FE2D1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* l */}
        <path d="M 298 25 L 298 90" fill="none" strokeWidth="11" />

        {/* i */}
        <circle cx="318" cy="30" r="6" fill="#9FE2D1" stroke="none" />
        <path d="M 318 48 L 318 90" fill="none" strokeWidth="11" />

        {/* f */}
        <path d="M 352 35 C 352 26 342 24 335 28 L 335 90" fill="none" strokeWidth="11" />
        <path d="M 326 50 L 348 50" fill="none" strokeWidth="10" />

        {/* e */}
        <circle cx="378" cy="70" r="19" fill="none" strokeWidth="11" />
        <path d="M 359 70 L 396 70" fill="none" strokeWidth="10" />
      </g>

      {/* Curved Smile Arc Under "life" */}
      <path
        d="M 302 100 Q 352 124 398 98"
        fill="none"
        stroke="#9FE2D1"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}