'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TechStackInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function TechStackInput({ value, onChange, disabled }: TechStackInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().replace(/^,|,$/g, '');
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (index: number) => {
    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 focus-within:ring-1 focus-within:ring-cyan-500 focus-within:border-cyan-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {value.map((tag, index) => (
        <span
          key={index}
          className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-300"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-zinc-500 hover:text-zinc-300 focus:outline-none"
            >
              <X size={14} />
            </button>
          )}
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        disabled={disabled}
        placeholder={value.length === 0 ? "Ketik lalu tekan Enter (contoh: React, Node.js)" : ""}
        className="flex-1 min-w-[150px] bg-transparent text-sm text-zinc-50 outline-none placeholder:text-zinc-500"
      />
    </div>
  );
}
