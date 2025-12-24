/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { LivePreview } from './components/LivePreview';
import { CreationHistory, Creation } from './components/CreationHistory';
import { LandingPage } from './components/LandingPage';
import { bringToLife, resolveGeminiApiKey } from './services/gemini';
import { saveCreation, getHistory } from './services/storage';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

// Embedded examples to prevent CORS issues
const DEFAULT_EXAMPLES: Creation[] = [
  {
    id: 'example-1',
    name: 'Calculadora Neon',
    timestamp: new Date(),
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculadora Neon</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
        body { font-family: 'Orbitron', sans-serif; background-color: #050505; }
        .neon-text { text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00; }
        .neon-box { box-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00, inset 0 0 5px #00ff00; }
        .btn { transition: all 0.1s; }
        .btn:active { transform: scale(0.95); }
    </style>
</head>
<body class="h-screen flex items-center justify-center text-green-500 overflow-hidden">
    <div class="p-8 border-2 border-green-500 rounded-2xl neon-box bg-black/90 scale-90 sm:scale-100">
        <div id="display" class="w-full h-16 mb-6 text-right text-3xl flex items-center justify-end px-4 border border-green-500/50 rounded bg-green-900/10 neon-text">0</div>
        <div class="grid grid-cols-4 gap-4">
            <button onclick="clearDisplay()" class="col-span-1 p-4 border border-green-500 rounded hover:bg-green-500/20 btn text-red-400">C</button>
            <button onclick="append('/')" class="p-4 border border-green-500 rounded hover:bg-green-500/20 btn">/</button>
            <button onclick="append('*')" class="p-4 border border-green-500 rounded hover:bg-green-500/20 btn">*</button>
            <button onclick="backspace()" class="p-4 border border-green-500 rounded hover:bg-green-500/20 btn">←</button>
            
            <button onclick="append('7')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">7</button>
            <button onclick="append('8')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">8</button>
            <button onclick="append('9')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">9</button>
            <button onclick="append('-')" class="p-4 border border-green-500 rounded hover:bg-green-500/20 btn">-</button>
            
            <button onclick="append('4')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">4</button>
            <button onclick="append('5')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">5</button>
            <button onclick="append('6')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">6</button>
            <button onclick="append('+')" class="p-4 border border-green-500 rounded hover:bg-green-500/20 btn">+</button>
            
            <button onclick="append('1')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">1</button>
            <button onclick="append('2')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">2</button>
            <button onclick="append('3')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">3</button>
            <button onclick="calculate()" class="row-span-2 p-4 border border-green-500 rounded hover:bg-green-500/20 btn neon-box flex items-center justify-center">=</button>
            
            <button onclick="append('0')" class="col-span-2 p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">0</button>
            <button onclick="append('.')" class="p-4 border border-green-500/50 rounded hover:bg-green-500/10 btn">.</button>
        </div>
    </div>
    <script>
        let current = '';
        const display = document.getElementById('display');
        function append(val) { current += val; update(); }
        function clearDisplay() { current = ''; update(); }
        function backspace() { current = current.slice(0, -1); update(); }
        function calculate() { try { current = eval(current).toString(); update(); } catch { current = 'Error'; update(); setTimeout(clearDisplay, 1000); } }
        function update() { display.innerText = current || '0'; }
    </script>
</body>
</html>`
  },
  {
    id: 'example-2',
    name: 'Estudo de Mecanismos',
    timestamp: new Date(Date.now() - 86400000), // Yesterday
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Estudo de Mecanismos</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        body { 
            background-color: #f4f1ea; 
            color: #2b261e; 
            font-family: 'Libre Baskerville', serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh;
            margin: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.2'/%3E%3C/svg%3E");
        }
        .codex-page {
            border: 1px solid #a68f6a;
            padding: 40px;
            max-width: 600px;
            box-shadow: 5px 5px 15px rgba(0,0,0,0.1);
            position: relative;
        }
        h1 { font-style: italic; border-bottom: 2px solid #2b261e; display: inline-block; padding-bottom: 10px; }
        .sketch-container {
            margin: 30px 0;
            display: flex;
            justify-content: center;
        }
        svg { overflow: visible; }
        .gear { transform-origin: center; animation: spin 10s linear infinite; }
        .gear-reverse { transform-origin: center; animation: spin-rev 10s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes spin-rev { 100% { transform: rotate(-360deg); } }
        p { line-height: 1.6; text-align: justify; }
    </style>
</head>
<body>
    <div class="codex-page">
        <h1>Machina Dentata</h1>
        <p>Observando a natureza do movimento contínuo, concebi este arranjo de rodas dentadas. Assim como o cosmo gira em harmonia, estas engrenagens transferem força com precisão matemática.</p>
        
        <div class="sketch-container">
            <svg width="200" height="200" viewBox="0 0 200 200">
                <!-- Gear 1 -->
                <g class="gear" transform="translate(60,100)">
                    <circle cx="0" cy="0" r="40" fill="none" stroke="#2b261e" stroke-width="2" />
                    <path d="M0 -50 L10 -40 L-10 -40 Z" fill="#2b261e" />
                    <path d="M0 50 L10 40 L-10 40 Z" fill="#2b261e" />
                    <path d="M50 0 L40 10 L40 -10 Z" fill="#2b261e" />
                    <path d="M-50 0 L-40 10 L-40 -10 Z" fill="#2b261e" />
                    <circle cx="0" cy="0" r="10" fill="#2b261e" />
                </g>
                <!-- Gear 2 -->
                <g class="gear-reverse" transform="translate(140,100)">
                    <circle cx="0" cy="0" r="40" fill="none" stroke="#2b261e" stroke-width="2" />
                     <path d="M0 -50 L10 -40 L-10 -40 Z" fill="#2b261e" />
                    <path d="M0 50 L10 40 L-10 40 Z" fill="#2b261e" />
                    <path d="M50 0 L40 10 L40 -10 Z" fill="#2b261e" />
                    <path d="M-50 0 L-40 10 L-40 -10 Z" fill="#2b261e" />
                    <circle cx="0" cy="0" r="10" fill="#2b261e" />
                </g>
            </svg>
        </div>
        
        <p><strong>Materiais:</strong> Madeira de carvalho para a resistência, eixos de bronze polido e óleo de linhaça para lubrificação.</p>
    </div>
</body>
</html>`
  }
];

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false); // Controls Landing vs Workspace
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Creation[]>([]);
  const [mode, setMode] = useState<'app' | 'davinci' | 'fusion'>('app');
  const [apiKey, setApiKey] = useState<string>('');
  const importInputRef = useRef<HTMLInputElement>(null);

  // Apply Da Vinci/Fusion styling class to body
  useEffect(() => {
    // Reset classes
    document.body.classList.remove('davinci-mode', 'fusion-mode');

    if (mode === 'davinci') {
      document.body.classList.add('davinci-mode');
    } else if (mode === 'fusion') {
      document.body.classList.add('fusion-mode');
    }
  }, [mode]);

  // Load history from IndexedDB (with fallback migration from localStorage)
  useEffect(() => {
    const initHistory = async () => {
      try {
        // 1. Try to load from IndexedDB
        let loadedHistory = await getHistory();

        // 2. Migration Check: If IDB is empty, check localStorage
        if (loadedHistory.length === 0) {
            const localSaved = localStorage.getItem('gemini_app_history');
            if (localSaved) {
                try {
                    const parsed = JSON.parse(localSaved);
                    console.log("Migrating history from localStorage to IndexedDB...");
                    // Migrate each item
                    for (const item of parsed) {
                        const creation = {
                            ...item,
                            timestamp: new Date(item.timestamp)
                        };
                        await saveCreation(creation);
                    }
                    // Reload from DB to confirm
                    loadedHistory = await getHistory();
                    // Clear localStorage to free up space
                    localStorage.removeItem('gemini_app_history');
                } catch (e) {
                    console.error("Migration failed", e);
                }
            }
        }

        // 3. If still empty (new user), load default examples locally
        if (loadedHistory.length === 0) {
            console.log("Loading default examples...");
            // Save defaults to DB
            for (const example of DEFAULT_EXAMPLES) {
                await saveCreation(example);
            }
            loadedHistory = DEFAULT_EXAMPLES;
        }

        setHistory(loadedHistory);
      } catch (e) {
        console.error("Failed to initialize history", e);
      }
    };

    initHistory();
  }, []);

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };
  
  // Helper to read text file
  const fileToText = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsText(file);
          reader.onload = () => {
              if (typeof reader.result === 'string') {
                  resolve(reader.result);
              } else {
                  reject(new Error("Failed to read text file"));
              }
          }
          reader.onerror = (error) => reject(error);
      });
  };

  const handleGenerate = async (promptText: string, file?: File, selectedMode: 'app' | 'davinci' | 'fusion' = 'app') => {
    const effectiveKey = resolveGeminiApiKey(apiKey);
    if (!effectiveKey) {
        alert("Erro: nenhuma API Key do Gemini encontrada. Informe pelo campo de chave ou defina a variável de ambiente GEMINI_API_KEY.");
        return;
    }
    
    setIsGenerating(true);
    setActiveCreation(null);

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;
      let augmentedPrompt = promptText;

      if (file) {
          if (file.type === 'text/plain') {
              const textContent = await fileToText(file);
              augmentedPrompt = `${promptText}\n\n[CONTEÚDO DO ARQUIVO ANEXO]:\n${textContent}`;
          } else {
             imageBase64 = await fileToBase64(file);
             mimeType = file.type.toLowerCase();
          }
      }

      // Pass API Key to the service function
      const html = await bringToLife(effectiveKey, augmentedPrompt, imageBase64, mimeType, selectedMode);
      
      if (html) {
        const defaultName = selectedMode === 'davinci' 
            ? 'Projeto Da Vinci' 
            : selectedMode === 'fusion' 
                ? 'Artefato Híbrido' 
                : 'Novo App';

        const newCreation: Creation = {
          id: crypto.randomUUID(),
          name: file ? file.name : defaultName,
          html: html,
          originalImage: imageBase64 && mimeType ? `data:${mimeType};base64,${imageBase64}` : undefined,
          timestamp: new Date(),
        };
        
        // Save to DB immediately
        await saveCreation(newCreation);

        setActiveCreation(newCreation);
        setHistory(prev => [newCreation, ...prev]);
      }

    } catch (error: any) {
      console.error("Failed to generate:", error);
      
      // Specifically handle 429 Quota Exceeded errors
      if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
          alert("⚠️ Cota da API Excedida (Erro 429).\n\nVocê está usando a versão gratuita do Gemini, que tem limites por minuto/dia.\n\nAguarde alguns instantes e tente novamente, ou verifique o uso no painel do Google AI Studio.");
      } else {
          alert("Algo deu errado ao dar vida ao seu arquivo. Verifique se sua API Key é válida e tem permissões.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setActiveCreation(null);
    setIsGenerating(false);
  };

  const handleSelectCreation = (creation: Creation) => {
    setActiveCreation(creation);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const json = event.target?.result as string;
            const parsed = JSON.parse(json);
            
            // Basic validation
            if (parsed.html && parsed.name) {
                const importedCreation: Creation = {
                    ...parsed,
                    timestamp: new Date(parsed.timestamp || Date.now()),
                    id: parsed.id || crypto.randomUUID()
                };
                
                // Save to DB
                await saveCreation(importedCreation);

                // Add to history if not already there (by ID check)
                setHistory(prev => {
                    const exists = prev.some(c => c.id === importedCreation.id);
                    return exists ? prev : [importedCreation, ...prev];
                });

                // Set as active immediately
                setActiveCreation(importedCreation);
            } else {
                alert("Formato de arquivo inválido.");
            }
        } catch (err) {
            console.error("Import error", err);
            alert("Falha ao importar criação.");
        }
        // Reset input
        if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // --- LANDING PAGE TRANSITION ---
  const handleLandingStart = (prompt: string, selectedMode: 'app' | 'davinci' | 'fusion', file?: File, key?: string) => {
      setMode(selectedMode);
      setHasStarted(true);
      const effectiveKey = resolveGeminiApiKey(key);
      setApiKey(effectiveKey);

      // Trigger immediate generation if prompt or file is present
      if (prompt || file) {
          setTimeout(() => {
             // Defer execution to allow state updates
             generateWithKey(prompt, file, selectedMode, effectiveKey);
          }, 100);
      }
  };

  // Specialized generator for the first run to avoid state race conditions
  const generateWithKey = async (prompt: string, file: File | undefined, mode: 'app' | 'davinci' | 'fusion', key: string) => {
      const effectiveKey = resolveGeminiApiKey(key);
      if (!effectiveKey) {
          alert("Erro: nenhuma API Key do Gemini encontrada. Informe pelo campo de chave ou defina a variável de ambiente GEMINI_API_KEY.");
          return;
      }

      setIsGenerating(true);
      setActiveCreation(null);
      try {
          let imageBase64: string | undefined;
          let mimeType: string | undefined;
          let augmentedPrompt = prompt;

          if (file) {
            if (file.type === 'text/plain') {
                const textContent = await fileToText(file);
                augmentedPrompt = `${prompt}\n\n[CONTEÚDO DO ARQUIVO ANEXO]:\n${textContent}`;
            } else {
                imageBase64 = await fileToBase64(file);
                mimeType = file.type.toLowerCase();
            }
          }

          const html = await bringToLife(effectiveKey, augmentedPrompt, imageBase64, mimeType, mode);
          
          if (html) {
             const defaultName = mode === 'davinci' ? 'Projeto Da Vinci' : (mode === 'fusion' ? 'Artefato Híbrido' : 'Novo App');
             const newCreation: Creation = {
                id: crypto.randomUUID(),
                name: file ? file.name : defaultName,
                html: html,
                originalImage: imageBase64 && mimeType ? `data:${mimeType};base64,${imageBase64}` : undefined,
                timestamp: new Date(),
             };
             
             await saveCreation(newCreation);

             setActiveCreation(newCreation);
             setHistory(prev => [newCreation, ...prev]);
          }
      } catch (e: any) {
          console.error(e);
          if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
            alert("⚠️ Cota da API Excedida (Erro 429).\n\nAguarde alguns instantes e tente novamente.");
          } else {
            alert("Erro na geração inicial. Verifique sua chave.");
          }
      } finally {
          setIsGenerating(false);
      }
  }

  if (!hasStarted) {
      return <LandingPage onStart={handleLandingStart} />;
  }

  // --- WORKSPACE ---
  const isFocused = !!activeCreation || isGenerating;
  const isDavinci = mode === 'davinci';
  const isFusion = mode === 'fusion';

  return (
    <div className={`h-[100dvh] bg-zinc-950 bg-dot-grid overflow-y-auto overflow-x-hidden relative flex flex col animate-fade-in ${isDavinci ? 'text-[var(--ink)]' : isFusion ? 'text-[var(--fusion-text)]' : 'text-zinc-50 selection:bg-blue-500/30'}`}>
      
      {/* Centered Content Container */}
      <div 
        className={`
          min-h-full flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 
          transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)
          ${isFocused 
            ? 'opacity-0 scale-95 blur-sm pointer-events-none h-[100dvh] overflow-hidden' 
            : 'opacity-100 scale-100 blur-0'
          }
        `}
      >
        {/* Main Vertical Centering Wrapper */}
        <div className="flex-1 flex flex-col justify-center items-center w-full py-12 md:py-20">
          
          {/* 1. Hero Section */}
          <div className="w-full mb-8 md:mb-16">
              <Hero mode={mode} />
          </div>

          {/* 2. Input Section */}
          <div className="w-full flex justify-center mb-8">
              <InputArea 
                  onGenerate={(p, f, m) => handleGenerate(p, f, m)} 
                  isGenerating={isGenerating} 
                  disabled={isFocused} 
                  mode={mode}
                  setMode={setMode}
              />
          </div>

        </div>
        
        {/* 3. History Section & Footer - Stays at bottom */}
        <div className="flex-shrink-0 pb-6 w-full mt-auto flex flex-col items-center gap-6">
            <div className="w-full px-2 md:px-0">
                <CreationHistory history={history} onSelect={handleSelectCreation} mode={mode} />
            </div>
            
            <a 
              href="https://instagram.com/rafaelscarpato" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-xs font-mono transition-colors pb-2 ${isDavinci ? 'text-[var(--ink)] hover:text-[var(--accent-davinci)]' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              Remixado por @rafaelscarpato
            </a>
        </div>
      </div>

      {/* Live Preview - Always mounted for smooth transition */}
      <LivePreview
        creation={activeCreation}
        isLoading={isGenerating}
        isFocused={isFocused}
        onReset={handleReset}
        mode={mode}
      />

      {/* Subtle Import Button (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
            onClick={handleImportClick}
            className={`flex items-center space-x-2 p-2 transition-colors opacity-60 hover:opacity-100 ${isDavinci ? 'text-[var(--ink)] hover:text-[var(--accent-davinci)]' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Import Artifact"
        >
            <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">Importar artefato anterior</span>
            <ArrowUpTrayIcon className="w-5 h-5" />
        </button>
        <input 
            type="file" 
            ref={importInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            className="hidden" 
        />
      </div>
    </div>
  );
};

export default App;
