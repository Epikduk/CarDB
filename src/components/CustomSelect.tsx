import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function CustomSelect({ options, value, onChange, placeholder, className }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef} style={{ zIndex: isOpen ? 100 : 1 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-[11px] font-bold text-slate-800 shadow-sm hover:border-green-500 transition-all outline-none"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in duration-150 z-[200]">
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {options.map((option: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-colors ${
                  value === option 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-black'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}