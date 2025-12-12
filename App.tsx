
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
import { bringToLife } from './services/gemini';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false); // Controls Landing vs Workspace
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Creation[]>([]);
  const [mode, setMode] = useState<'app' | 'davinci' | 'fusion'>('app');
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

  // Load history from local storage or fetch examples on mount
  useEffect(() => {
    const initHistory = async () => {
      const saved = localStorage.getItem('gemini_app_history');
      let loadedHistory: Creation[] = [];

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          loadedHistory = parsed.map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp)
          }));
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }

      if (loadedHistory.length > 0) {
        setHistory(loadedHistory);
      } else {
        // If no history (new user or cleared), load examples
        try {
           const exampleUrls = [
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/vibecode-blog.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/cassette.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/chess.json'
           ];

           const examples = await Promise.all(exampleUrls.map(async (url) => {
               const res = await fetch(url);
               if (!res.ok) return null;
               const data = await res.json();
               return {
                   ...data,
                   timestamp: new Date(data.timestamp || Date.now()),
                   id: data.id || crypto.randomUUID()
               };
           }));
           
           const validExamples = examples.filter((e): e is Creation => e !== null);
           setHistory(validExamples);
        } catch (e) {
            console.error("Failed to load examples", e);
        }
      }
    };

    initHistory();
  }, []);

  // Save history when it changes with Safe Fallback for Quota Exceeded
  useEffect(() => {
    if (history.length > 0) {
        const KEY = 'gemini_app_history';
        try {
            localStorage.setItem(KEY, JSON.stringify(history));
        } catch (e: any) {
            // Check for quota exceeded error names across browsers
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn("Local storage full, attempting to save without image data...", e);
                
                // Fallback: If quota exceeded, save history BUT strip the heavy 'originalImage' from items
                // We prioritize saving the generated code over the source image.
                try {
                    const historyWithoutImages = history.map(item => ({
                        ...item,
                        originalImage: undefined // Remove heavy base64
                    }));
                    localStorage.setItem(KEY, JSON.stringify(historyWithoutImages));
                    console.log("History saved (without images) to save space.");
                } catch (retryError) {
                    console.error("Critical: Could not save history even without images.", retryError);
                }
            } else {
                console.error("Unknown Storage Error:", e);
            }
        }
    }
  }, [history]);

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
  }

  const handleGenerate = async (promptText: string, file?: File, selectedMode: 'app' | 'davinci' | 'fusion' = 'app') => {
    setIsGenerating(true);
    // Clear active creation to show loading state
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

      const html = await bringToLife(augmentedPrompt, imageBase64, mimeType, selectedMode);
      
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
          // Store the full data URL for easy display, unless it was a text file
          originalImage: imageBase64 && mimeType ? `data:${mimeType};base64,${imageBase64}` : undefined,
          timestamp: new Date(),
        };
        setActiveCreation(newCreation);
        setHistory(prev => [newCreation, ...prev]);
      }

    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Algo deu errado ao dar vida ao seu arquivo. Por favor, tente novamente.");
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
    reader.onload = (event) => {
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
  const handleLandingStart = (prompt: string, selectedMode: 'app' | 'davinci' | 'fusion', file?: File) => {
      setMode(selectedMode);
      setHasStarted(true);
      // Trigger immediate generation if prompt or file is present
      if (prompt || file) {
          handleGenerate(prompt, file, selectedMode);
      }
  };

  if (!hasStarted) {
      return <LandingPage onStart={handleLandingStart} />;
  }

  // --- WORKSPACE ---
  const isFocused = !!activeCreation || isGenerating;
  const isDavinci = mode === 'davinci';
  const isFusion = mode === 'fusion';

  return (
    <div className={`h-[100dvh] bg-zinc-950 bg-dot-grid overflow-y-auto overflow-x-hidden relative flex flex-col animate-fade-in ${isDavinci ? 'text-[var(--ink)]' : isFusion ? 'text-[var(--fusion-text)]' : 'text-zinc-50 selection:bg-blue-500/30'}`}>
      
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
                  onGenerate={handleGenerate} 
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
