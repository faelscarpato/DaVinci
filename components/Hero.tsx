/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, memo } from 'react';
import { DocumentTextIcon, CalculatorIcon, PuzzlePieceIcon, ClipboardDocumentCheckIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { CursorArrowRaysIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/solid';

// Memoized component to prevent unnecessary re-renders and improve performance
const DrawingTransformation = memo(({ 
  initialIcon: InitialIcon, 
  finalIcon: FinalIcon, 
  label,
  delay, 
  x, 
  y,
  rotation = 0,
  mode
}: { 
  initialIcon: React.ElementType, 
  finalIcon: React.ElementType, 
  label: string,
  delay: number,
  x: string,
  y: string,
  rotation?: number,
  mode: 'app' | 'davinci' | 'fusion'
}) => {
  const [stage, setStage] = useState(0); // 0: Hidden, 1: Drawing, 2: Alive

  useEffect(() => {
    const cycle = () => {
      setStage(0);
      setTimeout(() => setStage(1), 500); // Start drawing
      setTimeout(() => setStage(2), 3500); // Come alive
    };

    // Initial delay
    const startTimeout = setTimeout(() => {
      cycle();
      // Repeat cycle
      const interval = setInterval(cycle, 9000);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  const isDavinci = mode === 'davinci';
  const isFusion = mode === 'fusion';

  return (
    <div 
      className="absolute transition-all duration-1000 ease-in-out z-0 pointer-events-none"
      style={{ top: y, left: x, transform: `rotate(${rotation}deg)` }}
    >
      <div className={`relative w-20 h-28 md:w-28 md:h-40 rounded-lg backdrop-blur-md transition-all duration-1000 
          ${stage === 2 
            ? isDavinci 
                ? 'bg-[#f4f1ea] border-[var(--sepia)] shadow-xl scale-110 -translate-y-4 shadow-[0_4px_12px_rgba(166,143,106,0.3)]' 
                : isFusion
                    ? 'bg-[#0f1218]/90 border-[var(--fusion-gold)] shadow-[0_0_15px_rgba(197,160,89,0.2)] scale-110 -translate-y-4'
                    : 'bg-zinc-800/40 border-zinc-500/50 shadow-xl scale-110 -translate-y-4' 
            : isDavinci
                ? 'bg-[#e8e4dc]/20 border-[var(--sepia)]/50 scale-100 border border-dashed'
                : isFusion
                    ? 'bg-[#0f1218]/50 border-[var(--fusion-gold)]/30 scale-100 border border-dashed'
                    : 'bg-zinc-900/10 border-zinc-800 scale-100 border border-dashed'
          }`}>
        
        {/* Label tag */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 border text-[8px] md:text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm transition-all duration-500 
            ${stage === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            ${isDavinci ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] font-serif' : (isFusion ? 'bg-[var(--fusion-gold)] text-black border-[var(--fusion-gold)]' : 'bg-zinc-100 text-zinc-900 border-zinc-200')}
        `}>
            {label}
        </div>

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          
          {/* Stage 1: Wireframe Drawing Effect */}
          <div className={`absolute transition-all duration-1000 ${stage === 1 ? 'opacity-100' : 'opacity-0'}`}>
             <InitialIcon className={`w-8 h-8 md:w-12 md:h-12 stroke-1 ${isDavinci ? 'text-[var(--sepia)] icon-sketch' : (isFusion ? 'text-[var(--fusion-gold)]/50' : 'text-zinc-500')}`} />
             {/* Technical corner markers */}
             <div className="absolute top-0 left-0 w-2 h-2 border-l border-t opacity-50" style={{borderColor: isDavinci ? 'var(--sepia)' : (isFusion ? 'var(--fusion-gold)' : '#71717a')}}></div>
             <div className="absolute top-0 right-0 w-2 h-2 border-r border-t opacity-50" style={{borderColor: isDavinci ? 'var(--sepia)' : (isFusion ? 'var(--fusion-gold)' : '#71717a')}}></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b opacity-50" style={{borderColor: isDavinci ? 'var(--sepia)' : (isFusion ? 'var(--fusion-gold)' : '#71717a')}}></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b opacity-50" style={{borderColor: isDavinci ? 'var(--sepia)' : (isFusion ? 'var(--fusion-gold)' : '#71717a')}}></div>
          </div>

          {/* Stage 2: Alive/Interactive */}
          <div className={`absolute transition-all duration-700 flex flex-col items-center ${stage === 2 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-75 blur-sm'}`}>
             <FinalIcon className={`w-10 h-10 md:w-14 md:h-14 ${isDavinci ? 'text-[var(--accent-davinci)] icon-sketch' : (isFusion ? 'text-[var(--fusion-gold)] drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]' : 'text-blue-500')}`} />
             {stage === 2 && !isDavinci && (
               <div className={`mt-3 flex items-center gap-2 px-2 py-1 rounded-full border ${isFusion ? 'bg-black/80 border-[var(--fusion-gold)]/50' : 'bg-zinc-900/80 border-zinc-700/50'}`}>
                 <div className={`w-1 h-1 rounded-full ${isFusion ? 'bg-[var(--fusion-gold)]' : 'bg-green-500'}`}></div>
                 <div className={`w-8 h-0.5 rounded-full overflow-hidden ${isFusion ? 'bg-zinc-800' : 'bg-zinc-700'}`}>
                    <div className={`h-full w-2/3 animate-[pulse_1s_infinite] ${isFusion ? 'bg-[var(--fusion-gold)]' : 'bg-blue-500'}`}></div>
                 </div>
               </div>
             )}
             {stage === 2 && isDavinci && (
                <div className="mt-3 w-8 h-0.5 bg-[var(--sepia)] rounded-full"></div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
});

export const Hero: React.FC<{mode: 'app' | 'davinci' | 'fusion'}> = ({ mode }) => {
  const isDavinci = mode === 'davinci';
  const isFusion = mode === 'fusion';
  
  return (
    <>
      {/* Background Transformation Elements - Fixed to Viewport */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="hidden lg:block">
            <DrawingTransformation 
            initialIcon={ClipboardDocumentCheckIcon} 
            finalIcon={SparklesIcon} 
            label={isDavinci ? "ESTUDO" : isFusion ? "ALGORITMO" : "PROTÓTIPO"}
            delay={0} 
            x="4%" 
            y="8%"
            rotation={-3} 
            mode={mode}
            />
        </div>

        <div className="hidden md:block">
            <DrawingTransformation 
            initialIcon={PuzzlePieceIcon} 
            finalIcon={CursorArrowRaysIcon} 
            label={isDavinci ? "MECANISMO" : isFusion ? "SISTEMA" : "LÓGICA"}
            delay={3000} 
            x="88%" 
            y="75%"
            rotation={2} 
            mode={mode}
            />
        </div>

        <div className="hidden lg:block">
            <DrawingTransformation 
            initialIcon={NewspaperIcon} 
            finalIcon={ChartBarIcon} 
            label={isDavinci ? "DADOS" : "METRICS"}
            delay={6000} 
            x="88%" 
            y="12%"
            rotation={1} 
            mode={mode}
            />
        </div>

        <div className="hidden md:block">
            <DrawingTransformation 
            initialIcon={DocumentTextIcon} 
            finalIcon={CalculatorIcon} 
            label={isDavinci ? "CÓDICE" : isFusion ? "ARTEFATO" : "APP"}
            delay={4500} 
            x="5%" 
            y="72%"
            rotation={-2} 
            mode={mode}
            />
        </div>
      </div>

      {/* Hero Text Content */}
      <div className="text-center relative z-10 max-w-6xl mx-auto px-4 pt-8">
        <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 leading-[1.1] transition-colors duration-500 ${isDavinci ? 'text-[var(--ink)]' : 'text-white'}`}>
          {isDavinci ? (
              <span>Estudos & Criações<br/><span className="davinci-title italic font-light text-[var(--accent-davinci)]">de Leonardo</span></span>
          ) : isFusion ? (
              <span>Renascimento <br/><span className="text-[var(--fusion-gold)] drop-shadow-md">Digital</span></span>
          ) : (
             <span>Da Vinci <br/><span className="text-blue-500 underline decoration-4 underline-offset-8">Versão 2.0</span></span>
          )}
        </h1>
        <p className={`text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-light transition-colors duration-500 ${isDavinci ? 'text-[var(--ink)] opacity-80' : isFusion ? 'text-[var(--fusion-text)] opacity-80' : 'text-zinc-400'}`}>
          {isDavinci 
            ? "O Gênio vê arte e função em tudo. Envie um esboço, um objeto quebrado ou um quarto desarrumado e receba um guia técnico e artístico."
            : isFusion 
                ? "Uma fusão única onde a engenharia do passado encontra a tecnologia do futuro. Crie artefatos que são, ao mesmo tempo, belos e funcionais."
                : "Imagine se Leonardo da Vinci nascesse nos anos 90 e fosse um Hacker. Ele não pintaria telas, ele criaria Apps que resolvem problemas reais."
          }
        </p>
      </div>
    </>
  );
};