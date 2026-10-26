import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, images, currentIndex, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % images.length);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241E1B]/90 backdrop-blur-sm" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white" onClick={(e) => { e.stopPropagation(); onClose(); }}><X size={32} /></button>
      
      <button 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full"
        onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + images.length) % images.length); }}
      >
        <ChevronLeft size={48} />
      </button>
      
      <img src={images[currentIndex]} alt="Resultado" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
      
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full"
        onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % images.length); }}
      >
        <ChevronRight size={48} />
      </button>
    </div>
  );
};
