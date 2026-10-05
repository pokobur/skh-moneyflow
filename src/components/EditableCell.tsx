'use client';

import React, { useState, useEffect, useRef } from 'react';

interface EditableCellProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  isNegativeAllowed?: boolean;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  isDiff?: boolean; // 前月比等のプラスマイナス表示
  readOnly?: boolean;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  className = '',
  isNegativeAllowed = true,
  onNavigate,
  isDiff = false,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(value === 0 ? '' : String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(value === 0 ? '' : String(value));
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const cleaned = editValue.replace(/,/g, '').trim();
    if (cleaned === '' || cleaned === '-') {
      onChange(0);
      setEditValue('');
    } else {
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed)) {
        onChange(parsed);
      } else {
        setEditValue(value === 0 ? '' : String(value));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
      onNavigate?.('down');
    } else if (e.key === 'Tab') {
      if (e.shiftKey) {
        onNavigate?.('left');
      } else {
        onNavigate?.('right');
      }
    } else if (e.key === 'ArrowUp') {
      onNavigate?.('up');
    } else if (e.key === 'ArrowDown') {
      onNavigate?.('down');
    }
  };

  const formatDisplay = (num: number) => {
    if (num === 0) return '0';
    if (isDiff) {
      return (num > 0 ? '+' : '') + num.toLocaleString();
    }
    return num.toLocaleString();
  };

  if (readOnly) {
    const isZero = value === 0;
    const isNegative = value < 0;
    const isPositive = isDiff && value > 0;
    return (
      <div
        className={`px-2 py-1 text-right tabular-nums text-xs select-none ${
          isZero ? 'text-gray-400 font-normal' : ''
        } ${isNegative ? 'text-rose-600 font-semibold' : ''} ${
          isPositive ? 'text-emerald-600 font-semibold' : ''
        } ${className}`}
      >
        {formatDisplay(value)}
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        setIsEditing(true);
        setTimeout(() => inputRef.current?.select(), 10);
      }}
      className={`relative group cursor-text min-h-[30px] flex items-center justify-end px-2 py-1 tabular-nums text-xs transition-colors hover:bg-sky-50/60 ${className}`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full h-full text-right outline-none bg-white border border-sky-400 rounded px-1 text-xs shadow-sm font-medium text-slate-800"
        />
      ) : (
        <span
          className={`${
            value === 0
              ? 'text-gray-400 font-light'
              : value < 0
              ? 'text-rose-600 font-semibold'
              : 'text-slate-800 font-medium'
          }`}
        >
          {value === 0 ? '0' : formatDisplay(value)}
        </span>
      )}
    </div>
  );
};
