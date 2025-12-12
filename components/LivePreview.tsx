
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from 'react';
import { ArrowDownTrayIcon, PlusIcon, ViewColumnsIcon, DocumentIcon, CodeBracketIcon, XMarkIcon, DocumentArrowDownIcon, PhotoIcon, CodeBracketSquareIcon } from '@heroicons/react/24/outline';
import { Creation } from './CreationHistory';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
  mode: 'app' | 'davinci' | 'fusion';
}

// Add type definition for the global pdfjsLib and html2pdf
declare global {
  interface Window {
    pdfjsLib: any;
    html2pdf: any;
  }
}

// --- CUSTOM IMMERSIVE LOADERS ---

// 1. Leo.js Mode: "System Boot" Terminal
const LoadingTerminal = () => {
    const [lines, setLines] = useState<string[]>([]);
    const [percent, setPercent] = useState(0);

    const bootSequence = [
        "INICIALIZANDO_NEO_CORTEX...",
        "CARREGANDO_MÓDULO: CREATIVITY_V2.0",
        "OTIMIZANDO_CAMINHOS_NEURAIS...",
        "ACESSANDO_UNIVERSO_PARALELO...",
        "COMPILANDO_RECURSOS...",
        "RENDERIZANDO_COMPONENTES_DA_UI...",
        "APLICANDO_HEURÍSTICAS_DE_UX...",
        "SISTEMA_PRONTO."

];
    

    useEffect(() => {
        // Percentage counter
        const interval = setInterval(() => {
            setPercent(prev => {
                if (prev >= 99) return 99;
                return prev + Math.floor(Math.random() * 3);
            });
        }, 150);

        // Text log scroller
        let lineIndex = 0;
        const textInterval = setInterval(() => {
            if (lineIndex < bootSequence.length) {
                setLines(prev => [...prev.slice(-4), bootSequence[lineIndex]]);
                lineIndex++;
            }
        }, 800);

        return () => {
            clearInterval(interval);
            clearInterval(textInterval);
        };
    }, []);

    const progressBar = "[" + "#".repeat(Math.floor(percent / 5)).padEnd(20, ".") + "]";

    return (
        <div className="font-mono text-xs sm:text-sm text-blue-500 w-full max-w-md p-6 bg-black/90 rounded-lg border border-blue-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <div className="flex justify-between border-b border-blue-500/30 pb-2 mb-4">
                <span>LEO.JS TERMINAL</span>
                <span className="animate-pulse">● LIVE</span>
            </div>
            
            <div className="space-y-1 mb-6 h-24 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                {lines.map((line, i) => (
                    <div key={i} className="opacity-80">
                        <span className="text-blue-700 mr-2">{`>`}</span>
                        {line}
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-brue-400">
                    <span>IDEALIZANDO...</span>
                    <span>{percent}%</span>
                </div>
                <div className="w-full whitespace-pre font-bold text-blue-500 tracking-tighter overflow-hidden">
                    {progressBar}
                </div>
            </div>
        </div>
    );
};

// 2. Da Vinci Mode: "Vitruvian Sketch"
const LoadingVitruvian = () => {
    return (
        <div className="flex flex-col items-center justify-center relative">
            <div className="relative w-64 h-64">
                <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_60s_linear_infinite]">
                    {/* Golden Ratio Spiral Effect */}
                    <path 
                        d="M100,100 m0,-80 a80,80 0 1,1 0,160 a80,80 0 1,1 0,-160"
                        fill="none"
                        stroke="var(--sepia)"
                        strokeWidth="0.5"
                        strokeDasharray="4 4"
                        opacity="0.5"
                    />
                    <rect x="40" y="40" width="120" height="120" stroke="var(--ink)" strokeWidth="0.5" fill="none" opacity="0.3" />
                    <circle cx="100" cy="100" r="60" stroke="var(--ink)" strokeWidth="0.5" fill="none" opacity="0.4" />
                    
                    {/* Animated Drawing Lines */}
                    <g className="animate-sketch">
                         {/* Gear 1 */}
                        <path 
                            d="M100,60 L100,40 M140,100 L160,100 M100,140 L100,160 M60,100 L40,100" 
                            stroke="var(--ink)" 
                            strokeWidth="1" 
                        />
                         <circle cx="100" cy="100" r="30" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeDasharray="200" strokeDashoffset="200" className="animate-[drawStroke_4s_ease-in-out_infinite_alternate]" />
                         <path d="M100,100 L130,130" stroke="var(--ink)" strokeWidth="1" />
                    </g>
                </svg>

                {/* Central Pulsing Ink Blot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--ink)] rounded-full opacity-20 animate-ping"></div>
            </div>

            <style>{`
                @keyframes drawStroke {
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
            
            <div className="mt-4 text-center">
                <h3 className="font-serif text-[var(--ink)] text-xl italic">"Studiando la forma..."</h3>
                <p className="text-[var(--sepia)] text-xs font-serif mt-1 tracking-widest uppercase">Formam studens</p>
            </div>
        </div>
    );
};

// 3. Fusion Mode: "Quantum Artifact"
const LoadingFusion = () => {
    return (
        <div className="flex flex-col items-center justify-center">
             <div className="relative w-40 h-40 perspective-1000">
                {/* 3D Rotating Rings */}
                <div className="absolute inset-0 border-2 border-[var(--fusion-gold)] rounded-full opacity-60 animate-[spin_4s_linear_infinite]" style={{transform: 'rotateX(60deg)'}}></div>
                <div className="absolute inset-0 border-2 border-[var(--fusion-gold)] rounded-full opacity-60 animate-[spin_6s_linear_infinite_reverse]" style={{transform: 'rotateY(60deg)'}}></div>
                <div className="absolute inset-0 border border-blue-500 rounded-full opacity-40 animate-[spin_10s_linear_infinite]"></div>

                {/* Core Energy */}
                <div className="absolute inset-10 bg-gradient-to-r from-[var(--fusion-gold)] to-blue-600 rounded-full blur-xl opacity-40 animate-pulse"></div>
                
                {/* Central Geometric Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center rotate-45">
                    <div className="w-8 h-8 bg-[var(--fusion-gold)]/80 animate-ping"></div>
                </div>
             </div>
             
             <div className="mt-8 flex flex-col items-center gap-1">
                 <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[var(--fusion-gold)] to-transparent"></div>
                 <div className="text-[var(--fusion-gold)] font-serif tracking-[0.3em] text-xs uppercase text-shadow-glow">
                     Materializando
                 </div>
             </div>
             
             <style>{`
                .perspective-1000 { perspective: 1000px; }
                .text-shadow-glow { text-shadow: 0 0 10px rgba(197,160,89, 0.5); }
             `}</style>
        </div>
    );
}


const PdfRenderer = ({ dataUrl }: { dataUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPdf = async () => {
      if (!window.pdfjsLib) {
        setError("Biblioteca PDF não inicializada");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Load the document
        const loadingTask = window.pdfjsLib.getDocument(dataUrl);
        const pdf = await loadingTask.promise;
        
        // Get the first page
        const page = await pdf.getPage(1);
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        
        // Calculate scale to make it look good (High DPI)
        const viewport = page.getViewport({ scale: 2.0 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error("Error rendering PDF:", err);
        setError("Não foi possível renderizar o PDF.");
        setLoading(false);
      }
    };

    renderPdf();
  }, [dataUrl]);

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-6 text-center">
            <DocumentIcon className="w-12 h-12 mb-3 opacity-50 text-red-400" />
            <p className="text-sm mb-2 text-red-400/80">{error}</p>
        </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        )}
        <canvas 
            ref={canvasRef} 
            className={`max-w-full max-h-full object-contain shadow-xl border border-zinc-800/50 rounded transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
    </div>
  );
};

export const LivePreview: React.FC<LivePreviewProps> = ({ creation, isLoading, isFocused, onReset, mode }) => {
    const [showSplitView, setShowSplitView] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isDownloadingImage, setIsDownloadingImage] = useState(false);

    // Default to Split View only on Desktop (width >= 768px)
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (creation?.originalImage && !isMobile) {
            setShowSplitView(true);
        } else {
            setShowSplitView(false);
        }
    }, [creation]);

    const handleExportJSON = () => {
        if (!creation) return;
        const dataStr = JSON.stringify(creation, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_artifact.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadHTML = () => {
        if (!creation || !creation.html) return;
        const blob = new Blob([creation.html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const createPrintContainer = (htmlString: string) => {
        let content = htmlString;
        
        // Extract content inside body if it exists
        const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
            content = bodyMatch[1];
        } else {
            // Fallback cleanup if no body tag found
             content = content.replace(/<!DOCTYPE html>/i, '')
                              .replace(/<html[^>]*>/i, '')
                              .replace(/<\/html>/i, '')
                              .replace(/<head>[\s\S]*<\/head>/i, '')
                              .replace(/<body[^>]*>/i, '')
                              .replace(/<\/body>/i, '');
        }
        
        // Extract all styles (including multiple style tags)
        const styleMatches = htmlString.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
        const styles = styleMatches.join('\n');
        
        // Extract all external links (CSS) like Tailwind CDN
        const linkMatches = htmlString.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
        const links = linkMatches.join('\n');

        const container = document.createElement('div');
        // Use absolute positioning off-screen to ensure visibility for the renderer
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        // Explicitly set width to A4 size to ensure consistency regardless of device width
        container.style.width = '210mm'; 
        
        // Explicitly force background color on the container for the screenshot
        container.style.backgroundColor = mode === 'davinci' ? '#f4f1ea' : (mode === 'fusion' ? '#0f1218' : '#ffffff');
        container.style.color = mode === 'davinci' ? '#2b261e' : (mode === 'fusion' ? '#e2e8f0' : '#000000');
        
        container.style.padding = '20px';
        
        // Inject Google Fonts Link explicitly + Playfair Display
        // Also inject fallback variables in a style tag
        const fontInjection = `
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:wght@400;600&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
            <style>
                :root {
                    --paper: #f4f1ea;
                    --ink: #2b261e;
                    --sepia: #a68f6a;
                    --shadow: rgba(30,27,22,.15);
                    --accent-davinci: #8b5a2b;
                    --fusion-bg: #0f1218;
                    --fusion-gold: #c5a059;
                    --fusion-text: #e2e8f0;
                }
                .davinci-mode {
                    font-family: 'Libre Baskerville', serif;
                    background-color: #f4f1ea;
                }
                .davinci-mode h1, .davinci-mode h2, .davinci-mode h3 {
                    font-family: 'Cinzel', serif;
                }
                .fusion-mode {
                    font-family: 'Cinzel', serif;
                }
            </style>
        `;

        // Add specific class for fonts/styling hooks and inject fonts
        if (mode === 'davinci') {
            container.classList.add('davinci-mode');
        } else if (mode === 'fusion') {
            container.classList.add('fusion-mode');
        }

        // Order: Fonts -> External Links (Tailwind) -> Internal Styles -> Content
        container.innerHTML = fontInjection + links + styles + content;
        
        return container;
    }

    const handleDownloadImage = async () => {
        if (!creation || !creation.html || !window.html2pdf) return;
        setIsDownloadingImage(true);

        const container = createPrintContainer(creation.html);
        document.body.appendChild(container);

        // Reset scroll to prevent crop issues
        window.scrollTo(0, 0);

        // DELAY: Increased to 2s to ensure fonts from Google Fonts load completely
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            await window.html2pdf().from(container).set({
                filename: `${creation.name.replace(/[^a-z0-9]/gi, '_')}.jpg`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    backgroundColor: mode === 'davinci' ? '#f4f1ea' : (mode === 'fusion' ? '#0f1218' : '#ffffff'),
                    logging: false
                }
            }).outputImg('img').then((img: any) => {
                 if (img && img.src) {
                    const a = document.createElement('a');
                    a.href = img.src;
                    a.download = `${creation.name.replace(/[^a-z0-9]/gi, '_')}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                 } else {
                     throw new Error("Generated image source is empty");
                 }
            });
        } catch (err) {
            console.error("Image generation failed:", err);
            alert("Erro ao gerar imagem. Tente novamente.");
        } finally {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
            setIsDownloadingImage(false);
        }
    }

    const handleDownloadPDF = async () => {
        if (!creation || !creation.html || !window.html2pdf) return;
        
        setIsDownloadingPdf(true);

        const container = createPrintContainer(creation.html);
        document.body.appendChild(container);

        // Reset scroll
        window.scrollTo(0, 0);

        // DELAY: Increased to 2s to ensure fonts load before PDF capture
        await new Promise(resolve => setTimeout(resolve, 2000));

        const opt = {
            margin:       10, // mm
            filename:     `${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true,
                backgroundColor: mode === 'davinci' ? '#f4f1ea' : (mode === 'fusion' ? '#0f1218' : '#ffffff'),
                logging: false,
                // Ensure desktop layout even on mobile
                windowWidth: 1024 
            }, 
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await window.html2pdf().set(opt).from(container).save();
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Erro ao gerar PDF.");
        } finally {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
            setIsDownloadingPdf(false);
        }
    };

    const isDavinci = mode === 'davinci';
    const isFusion = mode === 'fusion';

  return (
    <div
      className={`
        fixed z-40 flex flex-col
        rounded-lg overflow-hidden border shadow-2xl
        transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
        ${isFocused
          ? 'inset-0 sm:inset-2 md:inset-4 opacity-100 scale-100'
          : 'top-1/2 left-1/2 w-[90%] h-[60%] -translate-x-1/2 -translate-y-1/2 opacity-0 scale-95 pointer-events-none'
        }
        ${isDavinci 
            ? 'border-[var(--sepia)] bg-[#f4f1ea]' 
            : isFusion
                ? 'border-[var(--fusion-gold)] bg-[#0f1218]'
                : 'border-zinc-800 bg-[#0E0E10]'
        }
      `}
    >
      {/* Minimal Technical Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b shrink-0 overflow-x-auto scrollbar-hide
        ${isDavinci 
            ? 'bg-[#e8e4dc] border-[var(--sepia)] text-[var(--ink)]' 
            : isFusion
                ? 'bg-[#1a1d26] border-[var(--fusion-gold)] text-[var(--fusion-gold)]'
                : 'bg-[#121214] border-zinc-800 text-zinc-500'
        }
      `}>
        {/* Left: Controls */}
        <div className="flex items-center space-x-3 w-auto md:w-32 mr-4">
           <div className="flex space-x-2 group/controls">
                <button 
                  onClick={onReset}
                  className={`w-3 h-3 rounded-full transition-colors flex items-center justify-center focus:outline-none ${isDavinci ? 'bg-[var(--ink)]' : 'bg-zinc-700'} group-hover/controls:bg-red-500 hover:!bg-red-600`}
                  title="Fechar Preview"
                >
                  <XMarkIcon className="w-2 h-2 text-black opacity-0 group-hover/controls:opacity-100" />
                </button>
                <div className={`w-3 h-3 rounded-full transition-colors ${isDavinci ? 'bg-[var(--sepia)]' : 'bg-zinc-700'} group-hover/controls:bg-yellow-500`}></div>
                <div className={`w-3 h-3 rounded-full transition-colors ${isDavinci ? 'bg-[var(--accent-davinci)]' : 'bg-zinc-700'} group-hover/controls:bg-green-500`}></div>
           </div>
        </div>
        
        {/* Center: Title */}
        <div className={`flex items-center space-x-2 whitespace-nowrap ${isDavinci ? 'text-[var(--ink)]' : isFusion ? 'text-[var(--fusion-gold)]' : 'text-zinc-500'}`}>
            <CodeBracketIcon className={`w-3 h-3 ${isDavinci ? 'icon-sketch' : ''}`} />
            <span className="text-[11px] font-mono uppercase tracking-wider hidden sm:inline">
                {isLoading ? 'PROCESSANDO...' : creation ? creation.name : 'MODO PREVIEW'}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider sm:hidden">
                {isLoading ? '...' : creation ? 'Artefato' : 'Preview'}
            </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end space-x-1 w-auto md:w-auto ml-auto">
            {!isLoading && creation && (
                <>
                    {/* Da Vinci Actions */}
                    {isDavinci && (
                        <>
                         <button 
                            onClick={handleDownloadPDF}
                            title="Baixar Codex Da Vinci (.pdf) pronto para impressão"
                            disabled={isDownloadingPdf}
                            className={`p-1.5 rounded-md transition-all flex items-center gap-1
                                ${isDownloadingPdf ? 'opacity-50 cursor-not-allowed' : ''}
                                hover:bg-[var(--sepia)]/20 text-[var(--ink)]
                            `}
                        >
                            {isDownloadingPdf ? (
                                <div className="w-4 h-4 border-2 border-[var(--ink)] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <DocumentArrowDownIcon className="w-4 h-4 icon-sketch" />
                            )}
                        </button>
                        
                        <button 
                            onClick={handleDownloadImage}
                            title="Baixar visualização do projeto (.jpg)"
                            disabled={isDownloadingImage}
                            className={`p-1.5 rounded-md transition-all flex items-center gap-1
                                ${isDownloadingImage ? 'opacity-50 cursor-not-allowed' : ''}
                                hover:bg-[var(--sepia)]/20 text-[var(--ink)]
                            `}
                        >
                             {isDownloadingImage ? (
                                <div className="w-4 h-4 border-2 border-[var(--ink)] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <PhotoIcon className="w-4 h-4 icon-sketch" />
                            )}
                        </button>

                         <button 
                            onClick={handleDownloadHTML}
                            title="Baixar código-fonte completo (.html)"
                            className={`p-1.5 rounded-md transition-all flex items-center gap-1
                                hover:bg-[var(--sepia)]/20 text-[var(--ink)]
                            `}
                        >
                            <CodeBracketSquareIcon className="w-4 h-4 icon-sketch" />
                        </button>
                        </>
                    )}

                    {/* Standard/Fusion Actions */}
                    {!isDavinci && (
                        <button 
                            onClick={handleDownloadHTML}
                            title="Baixar arquivo HTML funcional"
                            className={`p-1.5 rounded-md transition-all 
                                ${isFusion
                                    ? 'hover:bg-[var(--fusion-gold)]/20 text-[var(--fusion-gold)]'
                                    : 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                }
                            `}
                        >
                            <CodeBracketSquareIcon className={`w-4 h-4`} />
                        </button>
                    )}

                    {creation.originalImage && (
                         <button 
                            onClick={() => setShowSplitView(!showSplitView)}
                            title={showSplitView ? "Ver Resultado em Tela Cheia" : "Comparar com a Imagem Original"}
                            className={`p-1.5 rounded-md transition-all hidden md:block
                                ${isDavinci 
                                    ? 'hover:bg-[var(--sepia)]/20 text-[var(--ink)]' 
                                    : isFusion
                                        ? 'hover:bg-[var(--fusion-gold)]/20 text-[var(--fusion-gold)]'
                                        : 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                }
                                ${showSplitView ? (isDavinci ? 'bg-[var(--sepia)]/20' : isFusion ? 'bg-[var(--fusion-gold)]/20' : 'bg-zinc-800 text-zinc-100') : ''}
                            `}
                        >
                            <ViewColumnsIcon className={`w-4 h-4 ${isDavinci ? 'icon-sketch' : ''}`} />
                        </button>
                    )}

                    <button 
                        onClick={handleExportJSON}
                        title="Exportar dados do projeto (.json)"
                        className={`transition-colors p-1.5 rounded-md hidden sm:block
                            ${isDavinci 
                                ? 'text-[var(--ink)] hover:bg-[var(--sepia)]/20' 
                                : isFusion
                                    ? 'text-[var(--fusion-gold)] hover:bg-[var(--fusion-gold)]/20'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                            }
                        `}
                    >
                        <ArrowDownTrayIcon className={`w-4 h-4 ${isDavinci ? 'icon-sketch' : ''}`} />
                    </button>

                    <button 
                        onClick={onReset}
                        title="Começar uma nova criação"
                        className={`ml-2 flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-md transition-colors whitespace-nowrap
                            ${isDavinci 
                                ? 'bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--sepia)]' 
                                : isFusion
                                    ? 'bg-[var(--fusion-gold)] text-black hover:bg-white'
                                    : 'bg-white text-black hover:bg-zinc-200'
                            }
                        `}
                    >
                        <PlusIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">Novo</span>
                    </button>
                </>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`relative w-full flex-1 flex flex-col md:flex-row overflow-hidden ${isDavinci ? 'bg-[#f4f1ea]' : isFusion ? 'bg-[#0f1218]' : 'bg-[#09090b]'}`}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full z-50">
             {/* MODE SPECIFIC LOADERS */}
             <div className="w-full max-w-md flex flex-col items-center justify-center">
                
                {mode === 'app' && <LoadingTerminal />}
                
                {mode === 'davinci' && <LoadingVitruvian />}

                {mode === 'fusion' && <LoadingFusion />}

             </div>
          </div>
        ) : creation?.html ? (
          <>
            {/* Split View: Left Panel (Original Image) */}
            {showSplitView && creation.originalImage && (
                <div className={`w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r relative flex flex-col shrink-0
                    ${isDavinci 
                        ? 'bg-[#e8e4dc] border-[var(--sepia)]' 
                        : isFusion
                            ? 'bg-[#151820] border-[var(--fusion-gold)]'
                            : 'bg-[#0c0c0e] border-zinc-800'
                    }
                `}>
                    <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur text-zinc-400 text-[10px] font-mono uppercase px-2 py-1 rounded border border-zinc-800">
                        Fonte Original
                    </div>
                    <div className="w-full h-full p-6 flex items-center justify-center overflow-hidden">
                        {creation.originalImage.startsWith('data:application/pdf') ? (
                            <PdfRenderer dataUrl={creation.originalImage} />
                        ) : (
                            <img 
                                src={creation.originalImage} 
                                alt="Input Original" 
                                className={`max-w-full max-h-full object-contain shadow-xl rounded 
                                    ${isDavinci 
                                        ? 'border border-[var(--sepia)] opacity-90' 
                                        : isFusion
                                            ? 'border border-[var(--fusion-gold)]'
                                            : 'border border-zinc-800/50'
                                    }
                                `}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* App Preview Panel */}
            <div className={`relative bg-white transition-all duration-500 overflow-hidden ${showSplitView && creation.originalImage ? 'w-full md:w-1/2 h-1/2 md:h-full' : 'w-full h-[80vh] md:h-full'}`}>
                 <iframe
                    title="Gemini Live Preview"
                    srcDoc={creation.html}
                    className="w-full h-full"
                    sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
