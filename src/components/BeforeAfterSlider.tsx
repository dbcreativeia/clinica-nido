import React, { useState } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  area: string;
  interval: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  area,
  interval
}) => {
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isInteractive, setIsInteractive] = useState(false);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (touchX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DAD0] overflow-hidden shadow-xs flex flex-col">
      {/* Top badges & Segmented control */}
      <div className="p-3 border-b border-[#E5DAD0] flex items-center justify-between gap-2 bg-[#F7F2EB]">
        <div>
          <span className="text-xs font-semibold text-[#241E1B] block leading-tight">
            {area}
          </span>
          <span className="text-[10px] text-[#8C7359] uppercase tracking-wider font-semibold">
            Avaliação após {interval}
          </span>
        </div>

        {/* Quick Tab Toggle on Mobile */}
        <div className="flex bg-[#E5DAD0] p-0.5 rounded-full text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('before')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === 'before'
                ? 'bg-[#44342E] text-[#FFFFFF] shadow-xs'
                : 'text-[#241E1B]/80 hover:text-[#241E1B]'
            }`}
          >
            Antes
          </button>
          <button
            onClick={() => setActiveTab('after')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === 'after'
                ? 'bg-[#44342E] text-[#FFFFFF] shadow-xs'
                : 'text-[#241E1B]/80 hover:text-[#241E1B]'
            }`}
          >
            Depois
          </button>
        </div>
      </div>

      {/* Main Image Stage com degradê escuro */}
      <div className="relative aspect-4/3 w-full bg-[#181310] overflow-hidden">
        <img
          src={activeTab === 'after' ? afterImage : beforeImage}
          alt={`Resultado Endoslim - ${area} (${activeTab === 'after' ? 'Depois' : 'Antes'})`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#181310]/80 via-transparent to-transparent pointer-events-none" />

        {/* Overlay Badge */}
        <div className="absolute top-3 left-3 bg-[#181310]/90 backdrop-blur-md text-[#FFFFFF] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs border border-white/10">
          {activeTab === 'after' ? `Depois (${interval})` : 'Condição Prévia (Antes)'}
        </div>

        <div className="absolute bottom-2 right-2 text-[10px] text-[#FFFFFF]/90 bg-[#181310]/75 backdrop-blur-xs px-2 py-0.5 rounded-md">
          Toque para alternar
        </div>
      </div>

      {/* Bottom context notice */}
      <div className="p-2.5 text-center text-[10px] text-[#8C7359] font-medium bg-[#F7F2EB] border-t border-[#E5DAD0]">
        Caso clínico autorizado pela paciente • Sem edição digital
      </div>
    </div>
  );
};
