
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useEffect } from 'react';
import { ArrowUpTrayIcon, CpuChipIcon, PaintBrushIcon, CodeBracketIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File, mode?: 'app' | 'davinci' | 'fusion') => void;
  isGenerating: boolean;
  disabled?: boolean;
  mode: 'app' | 'davinci' | 'fusion';
  setMode: (mode: 'app' | 'davinci' | 'fusion') => void;
}

const CyclingText = ({ mode }: { mode: 'app' | 'davinci' | 'fusion' }) => {
    const appWords = [
        "uma startup unicórnio",
        "uma engenhoca digital",
        "um SaaS revolucionário",
        "uma solução genial",
        "um app de produtividade"
    ];
    
    const davinciWords = [
        "uma ideia de pintura",
        "um móvel para construir",
        "um quarto para organizar",
        "uma escultura",
        "uma invenção mecânica"
    ];

    const fusionWords = [
        "uma máquina impossível",
        "um códice interativo",
        "uma arte funcional",
        "um mecanismo digital",
        "uma visão do futuro-passado"
    ];

    const words = mode === 'davinci' ? davinciWords : (mode === 'fusion' ? fusionWords : appWords);
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        setIndex(0);
    }, [mode]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); 
            setTimeout(() => {
                setIndex(prev => (prev + 1) % words.length);
                setFade(true); 
            }, 500); 
        }, 3000); 
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className={`inline-block whitespace-nowrap transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'} ${mode === 'davinci' ? 'text-[var(--ink)] border-[var(--sepia)]' : (mode === 'fusion' ? 'text-[var(--fusion-gold)] border-[var(--fusion-gold)]' : 'text-white border-blue-500/50')} font-medium pb-1 border-b-2`}>
            {words[index]}
        </span>
    );
};

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false, mode, setMode }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type === 'text/plain') {
      onGenerate("", file, mode);
    } else {
      alert("Por favor, envie uma Imagem, PDF ou arquivo de Texto (.txt).");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating, mode]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const isDavinci = mode === 'davinci';
  const isFusion = mode === 'fusion';

  return (
    <div className="w-full max-w-4xl mx-auto perspective-1000 flex flex-col items-center gap-6">
      
      {/* Mode Switcher - Responsive: Stacked on mobile, Row on Desktop */}
      <div className={`flex flex-col sm:flex-row w-full sm:w-auto sm:flex-wrap justify-center p-1 sm:rounded-full rounded-xl border transition-all duration-500 gap-2 sm:gap-0 ${isDavinci ? 'bg-[#e8e4dc] border-[var(--sepia)]' : (isFusion ? 'bg-[#1e1e24] border-[var(--fusion-gold)]' : 'bg-zinc-900/50 border-zinc-800')}`}>
          <button
            onClick={() => setMode('app')}
            className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${!isDavinci && !isFusion ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            <CodeBracketIcon className="w-4 h-4" />
            <span>Leo.js (Moderno)</span>
          </button>
          
          <button
            onClick={() => setMode('davinci')}
            className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isDavinci ? 'bg-[var(--accent-davinci)] text-[#f4f1ea] shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <PaintBrushIcon className="w-4 h-4" />
            <span>Gênio Da Vinci</span>
          </button>

          <button
            onClick={() => setMode('fusion')}
            className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${isFusion ? 'bg-gradient-to-r from-slate-900 to-slate-800 border border-[var(--fusion-gold)] text-[var(--fusion-gold)] shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <BoltIcon className="w-4 h-4" />
            <span>Fusão Única</span>
          </button>
      </div>

      <div 
        className={`relative w-full group transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}
      >
        <label
          className={`
            relative flex flex-col items-center justify-center
            h-56 sm:h-64 md:h-[22rem]
            rounded-xl border border-dashed
            cursor-pointer overflow-hidden
            transition-all duration-500
            ${isDavinci 
                ? 'davinci-card bg-[#f4f1ea]/50 border-[var(--sepia)] hover:bg-[#f4f1ea]/80' 
                : isFusion
                    ? 'bg-[#0f1218]/80 border-[var(--fusion-gold)] hover:bg-[#0f1218]/90 shadow-[0_0_15px_rgba(197,160,89,0.1)]'
                    : 'bg-zinc-900/30 backdrop-blur-sm border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40'
            }
            ${isDragging 
              ? isDavinci ? 'border-[var(--accent-davinci)] shadow-xl' : (isFusion ? 'border-white shadow-[0_0_30px_rgba(197,160,89,0.3)]' : 'border-blue-500 bg-zinc-900/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]')
              : ''
            }
            ${isGenerating ? 'pointer-events-none' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
            {/* Technical Grid Background */}
            <div className={`absolute inset-0 opacity-[0.05] pointer-events-none transition-colors duration-500 ${isDavinci ? 'bg-[var(--ink)]' : (isFusion ? 'bg-[var(--fusion-gold)]' : 'bg-white')}`}
                 style={{backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px'}}>
            </div>
            
            {/* Corner Brackets */}
            <div className={`absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 transition-colors duration-300 ${isDragging ? (isDavinci ? 'border-[var(--accent-davinci)]' : 'border-blue-500') : (isDavinci ? 'border-[var(--sepia)]' : (isFusion ? 'border-[var(--fusion-gold)]' : 'border-zinc-600'))}`}></div>
            <div className={`absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 transition-colors duration-300 ${isDragging ? (isDavinci ? 'border-[var(--accent-davinci)]' : 'border-blue-500') : (isDavinci ? 'border-[var(--sepia)]' : (isFusion ? 'border-[var(--fusion-gold)]' : 'border-zinc-600'))}`}></div>
            <div className={`absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 transition-colors duration-300 ${isDragging ? (isDavinci ? 'border-[var(--accent-davinci)]' : 'border-blue-500') : (isDavinci ? 'border-[var(--sepia)]' : (isFusion ? 'border-[var(--fusion-gold)]' : 'border-zinc-600'))}`}></div>
            <div className={`absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 transition-colors duration-300 ${isDragging ? (isDavinci ? 'border-[var(--accent-davinci)]' : 'border-blue-500') : (isDavinci ? 'border-[var(--sepia)]' : (isFusion ? 'border-[var(--fusion-gold)]' : 'border-zinc-600'))}`}></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6 md:space-y-8 p-6 md:p-8 w-full">
                <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:-translate-y-1'}`}>
                    <div className={`absolute inset-0 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-500 ${isGenerating ? 'animate-pulse' : ''} ${isDavinci ? 'bg-[#e8e4dc] border border-[var(--sepia)]' : (isFusion ? 'bg-[#1a1d26] border border-[var(--fusion-gold)]' : 'bg-zinc-800 border border-zinc-700')}`}>
                        {isGenerating ? (
                            <CpuChipIcon className={`w-8 h-8 md:w-10 md:h-10 animate-spin-slow ${isDavinci ? 'text-[var(--accent-davinci)] icon-sketch' : (isFusion ? 'text-[var(--fusion-gold)]' : 'text-blue-400')}`} />
                        ) : (
                            isDavinci ? (
                                <SparklesIcon className={`w-8 h-8 md:w-10 md:h-10 transition-all duration-300 icon-sketch ${isDragging ? '-translate-y-1 text-[var(--accent-davinci)]' : 'text-[var(--sepia)]'}`} />
                            ) : isFusion ? (
                                <BoltIcon className={`w-8 h-8 md:w-10 md:h-10 transition-all duration-300 ${isDragging ? '-translate-y-1 text-white' : 'text-[var(--fusion-gold)]'}`} />
                            ) : (
                                <ArrowUpTrayIcon className={`w-8 h-8 md:w-10 md:h-10 text-zinc-300 transition-all duration-300 ${isDragging ? '-translate-y-1 text-blue-400' : ''}`} />
                            )
                        )}
                    </div>
                </div>

                <div className="space-y-2 md:space-y-4 w-full max-w-3xl">
                    <h3 className={`flex flex-col items-center justify-center text-xl sm:text-2xl md:text-4xl leading-none font-bold tracking-tighter gap-3 transition-colors duration-500 ${isDavinci ? 'text-[var(--ink)]' : 'text-zinc-100'}`}>
                        <span>Inventar </span>
                        <div className="h-8 sm:h-10 md:h-14 flex items-center justify-center w-full">
                           <CyclingText mode={mode} />
                        </div>
                    </h3>
                    <p className={`text-xs sm:text-base md:text-lg font-light tracking-wide transition-colors duration-500 ${isDavinci ? 'text-[var(--ink)] opacity-70' : (isFusion ? 'text-[var(--fusion-text)] opacity-80' : 'text-zinc-500')}`}>
                        <span className="hidden md:inline">Arraste & Solte</span>
                        <span className="md:hidden">Toque</span> para enviar
                        {mode === 'davinci' && <span className="block text-[var(--accent-davinci)] mt-2 text-sm font-medium">Modo Da Vinci: Receba guias, paletas e briefings artísticos.</span>}
                        {mode === 'fusion' && <span className="block text-[var(--fusion-gold)] mt-2 text-sm font-medium">Modo Fusão: Onde Leonardo encontra a Tecnologia.</span>}
                    </p>
                </div>
            </div>

            <input
                type="file"
                accept="image/*,application/pdf,text/plain"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
            />
        </label>
      </div>
    </div>
  );
};
