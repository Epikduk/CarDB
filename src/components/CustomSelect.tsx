import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export function CustomSelect({ options, value, onChange, placeholder, className, disabled }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideButton = containerRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);

      if (!clickedInsideButton && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateCoords();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-[11px] font-bold text-slate-800 shadow-sm transition-all outline-none
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-green-500'}`}
      >
        <span className="truncate">{value || placeholder}</span>
        {!disabled && <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white border border-slate-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in duration-150"
          style={{
            top: coords.top + 4,
            left: coords.left,
            width: coords.width,
          }}
        >
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {options.map((option: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
        </div>,
        document.body
      )}
    </div>
  );
}