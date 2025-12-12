
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ClockIcon, ArrowRightIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

export interface Creation {
  id: string;
  name: string;
  html: string;
  originalImage?: string; // Base64 data URL
  timestamp: Date;
}

interface CreationHistoryProps {
  history: Creation[];
  onSelect: (creation: Creation) => void;
  mode: 'app' | 'davinci' | 'fusion';
}

export const CreationHistory: React.FC<CreationHistoryProps> = ({ history, onSelect, mode }) => {
  if (history.length === 0) return null;

  const isDavinci = mode === 'davinci';
  const isFusion = mode === 'fusion';

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center space-x-3 mb-3 px-2">
        <ClockIcon className={`w-4 h-4 ${isDavinci ? 'text-[var(--sepia)] icon-sketch' : isFusion ? 'text-[var(--fusion-gold)]' : 'text-zinc-500'}`} />
        <h2 className={`text-xs font-bold uppercase tracking-wider ${isDavinci ? 'text-[var(--ink)]' : isFusion ? 'text-[var(--fusion-gold)]' : 'text-zinc-500'}`}>
          Arquivo
        </h2>
        <div className={`h-px flex-1 ${isDavinci ? 'bg-[var(--sepia)]' : isFusion ? 'bg-[var(--fusion-gold)]/30' : 'bg-zinc-800'}`}></div>
      </div>
      
      {/* Horizontal Scroll Container for Compact Layout */}
      <div className="flex overflow-x-auto space-x-4 pb-2 px-2 scrollbar-hide">
        {history.map((item) => {
          const isPdf = item.originalImage?.startsWith('data:application/pdf');
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group flex-shrink-0 relative flex flex-col text-left w-44 h-28 rounded-lg transition-all duration-200 overflow-hidden border
                ${isDavinci 
                    ? 'bg-[var(--paper)] border-[var(--sepia)] shadow-[2px_2px_8px_var(--shadow)] hover:bg-[#e8e4dc] hover:scale-[1.02]' 
                    : isFusion
                        ? 'bg-[#1a1d26] border-[var(--fusion-gold)]/50 hover:border-[var(--fusion-gold)] hover:shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                        : 'bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-600'
                }
              `}
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-1.5 rounded transition-colors border
                      ${isDavinci
                        ? 'bg-[#f4f1ea] border-[var(--sepia)] group-hover:bg-[#dcd6ca]'
                        : isFusion
                            ? 'bg-black/50 border-[var(--fusion-gold)]/30 text-[var(--fusion-gold)]'
                            : 'bg-zinc-800 border-zinc-700/50 group-hover:bg-zinc-700'
                      }
                  `}>
                      {isPdf ? (
                          <DocumentIcon className={`w-4 h-4 ${isDavinci ? 'text-[var(--ink)] icon-sketch' : isFusion ? 'text-[var(--fusion-gold)]' : 'text-zinc-400'}`} />
                      ) : item.originalImage ? (
                          <PhotoIcon className={`w-4 h-4 ${isDavinci ? 'text-[var(--ink)] icon-sketch' : isFusion ? 'text-[var(--fusion-gold)]' : 'text-zinc-400'}`} />
                      ) : (
                          <DocumentIcon className={`w-4 h-4 ${isDavinci ? 'text-[var(--ink)] icon-sketch' : isFusion ? 'text-[var(--fusion-gold)]' : 'text-zinc-400'}`} />
                      )}
                  </div>
                  <span className={`text-[10px] font-mono group-hover:text-zinc-400 ${isDavinci ? 'text-[var(--ink)] opacity-70' : isFusion ? 'text-[var(--fusion-text)] opacity-60' : 'text-zinc-600'}`}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="mt-auto">
                  <h3 className={`text-sm font-medium truncate ${isDavinci ? 'text-[var(--ink)] font-serif italic' : isFusion ? 'text-[var(--fusion-text)]' : 'text-zinc-300 group-hover:text-white'}`}>
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className={`text-[10px] ${isDavinci ? 'text-[var(--accent-davinci)]' : isFusion ? 'text-[var(--fusion-gold)]' : 'text-blue-400'}`}>Restaurar</span>
                    <ArrowRightIcon className={`w-3 h-3 ${isDavinci ? 'text-[var(--accent-davinci)] icon-sketch' : isFusion ? 'text-[var(--fusion-gold)]' : 'text-blue-400'}`} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};