import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ 
  items, 
  title = "Perguntas Frequentes" 
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {title && (
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#241E1B] mb-6 text-center">
          {title}
        </h3>
      )}

      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-[#FFFFFF] rounded-xl border border-[#E5DAD0] overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-medium text-[#241E1B] hover:text-[#44342E] transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-serif font-medium text-[#241E1B]">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#8C7359] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'transform rotate-180 text-[#44342E]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-[#5C4B44] leading-relaxed font-normal border-t border-[#E5DAD0] pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
