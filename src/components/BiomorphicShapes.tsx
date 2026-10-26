import React from 'react';

interface OrganicBlobProps {
  className?: string;
  variant?: 'cellular' | 'curve' | 'oval' | 'hero-treatments' | 'menu-accent';
}

export const OrganicBlob: React.FC<OrganicBlobProps> = ({ className = '', variant = 'cellular' }) => {
  if (variant === 'hero-treatments') {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        <svg
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#9B8065] opacity-[0.06] transform scale-110 sm:scale-125"
          aria-hidden="true"
        >
          {/* Formas orgânicas biomórficas inspiradas em celulas e contornos suaves */}
          <path
            d="M520 180C610 240 680 340 650 450C620 560 500 680 380 670C260 660 140 520 160 400C180 280 320 180 420 150C460 138 480 150 520 180Z"
            fill="currentColor"
          />
          <path
            d="M300 220C420 180 560 220 600 320C640 420 580 540 480 600C380 660 240 640 180 530C120 420 180 260 300 220Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'menu-accent') {
    return (
      <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
        <svg
          viewBox="0 0 400 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#9B8065] opacity-[0.05]"
          aria-hidden="true"
        >
          <path
            d="M-50 100C100 50 250 150 280 300C310 450 180 580 20 550C-140 520 -200 350 -180 220C-160 120 -100 120 -50 100Z"
            fill="currentColor"
          />
          <circle cx="320" cy="180" r="140" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
        </svg>
      </div>
    );
  }

  if (variant === 'curve') {
    return (
      <div className={`pointer-events-none select-none ${className}`}>
        <svg
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#9B8065] opacity-[0.04]"
          aria-hidden="true"
        >
          <path
            d="M100 300C150 180 320 120 450 180C580 240 620 400 520 500C420 600 220 580 140 480C60 380 50 420 100 300Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // Variant cellular (padrão)
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[#9B8065] opacity-[0.05]"
        aria-hidden="true"
      >
        <path
          d="M380 140C440 200 470 290 430 370C390 450 280 500 190 460C100 420 30 300 60 210C90 120 210 50 300 80C330 90 350 110 380 140Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};
