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
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 shadow-sm hover:border-green-500 transition-all outline-none"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[200] w-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in duration-150">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
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