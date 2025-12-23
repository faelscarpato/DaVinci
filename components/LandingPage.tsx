/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, CodeBracketIcon, PaintBrushIcon, BoltIcon, ArrowRightIcon, PaperClipIcon, XMarkIcon, DocumentIcon, PhotoIcon, QuestionMarkCircleIcon, LightBulbIcon, KeyIcon } from '@heroicons/react/24/outline';

interface LandingPageProps {
  onStart: (prompt: string, mode: 'app' | 'davinci' | 'fusion', file: File | undefined, apiKey: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(0); 
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check local storage for API Key
    const savedKey = localStorage.getItem('gemini_user_api_key');
    if (savedKey) {
        setApiKey(savedKey);
    } else {
        setShowKeyInput(true); // Show input if no key found
    }

    // Immersive Entrance
    const timer1 = setTimeout(() => setLoading(false), 2000); 
    const timer2 = setTimeout(() => setStage(1), 4000); 
    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
    };
  }, []);

  const handleTutorialClose = () => {
      setShowTutorial(false);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newKey = e.target.value;
      setApiKey(newKey);
      localStorage.setItem('gemini_user_api_key', newKey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
        setShowKeyInput(true);
        alert("Por favor, insira sua chave API do Google AI Studio.");
        return;
    }
    if (prompt.trim() || selectedFile) {
      setShowModal(true);
    }
  };

  const handleModeSelect = (mode: 'app' | 'davinci' | 'fusion') => {
      if (!apiKey) {
          alert("API Key necessária.");
          return;
      }
      setTimeout(() => {
          onStart(prompt, mode, selectedFile || undefined, apiKey);
      }, 300);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const clearFile = () => {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
      return (
          <div className="fixed inset-0 bg-[#f4f1ea] flex items-center justify-center z-50">
               {/* Sketch Loading Animation */}
               <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <path 
                    d="M50 10 L90 90 L10 90 Z" 
                    fill="none" 
                    stroke="#2b261e" 
                    strokeWidth="1" 
                    strokeDasharray="300" 
                    strokeDashoffset="300"
                    className="animate-[sketch-draw_2s_ease-out_forwards]" 
                  />
                  <circle 
                    cx="50" cy="55" r="25"
                    fill="none" 
                    stroke="#a68f6a" 
                    strokeWidth="1"
                    strokeDasharray="200" 
                    strokeDashoffset="200"
                    className="animate-[sketch-draw_2s_ease-out_forwards_0.5s]" 
                  />
               </svg>
          </div>
      );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-[#f4f1ea] text-[#2b261e] overflow-hidden flex flex-col font-sans selection:bg-[#a68f6a] selection:text-white">
      
      {/* Renaissance Texture Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.9'/%3E%3C/svg%3E")`}}></div>
      
      {/* Decorative Classical Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] border border-[#2b261e] rounded-full"></div>
          <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] border border-[#a68f6a] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] border border-[#2b261e] rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 relative z-10 transition-all duration-5000 ${stage === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Header */}
        <div className="mb-8 text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#a68f6a] bg-[#f4f1ea] text-xs tracking-[0.2em] uppercase text-[#2b261e] mb-4 shadow-sm">
              <SparklesIcon className="w-3 h-3" />
              <span>Ideias do Léo Da Vinci</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#2b261e] font-serif">
              DaVinci <span className="italic text-[#8b5a2b]">Genio</span>
           </h1>
           <p className="text-lg text-[#5c554b] max-w-xl mx-auto font-serif leading-relaxed italic">
              "Onde a precisão da engenharia encontra a beleza da arte."
           </p>
        </div>

        {/* Input Field Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group flex flex-col gap-4">
           <div className="relative flex flex-col bg-[#fcfbf9] border border-[#a68f6a] rounded-xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(139,90,43,0.15)]">
              
              <div className="flex items-center">
                  <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Descreva sua ideia, invenção ou sonho..." 
                    className="w-full bg-transparent border-none outline-none text-lg px-6 py-4 text-[#2b261e] placeholder-[#a68f6a]/60 font-serif"
                    autoFocus
                  />
                  
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-[#a68f6a] hover:text-[#2b261e] transition-colors rounded-lg hover:bg-[#efece5]"
                    title="Anexar Arquivo"
                  >
                      <PaperClipIcon className="w-6 h-6" />
                  </button>
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*,application/pdf,text/plain"
                      onChange={handleFileChange}
                  />

                  <button 
                    type="submit"
                    disabled={!prompt.trim() && !selectedFile}
                    className="p-3 bg-[#2b261e] text-[#f4f1ea] rounded-lg hover:bg-[#8b5a2b] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 ml-2 shadow-md"
                  >
                      <ArrowRightIcon className="w-6 h-6" />
                  </button>
              </div>

              {selectedFile && (
                  <div className="mx-4 mb-2 mt-1 flex items-center gap-2 text-xs text-[#8b5a2b] bg-[#8b5a2b]/10 px-3 py-2 rounded-md w-fit border border-[#8b5a2b]/20 animate-fade-in">
                      {selectedFile.type.includes('image') ? <PhotoIcon className="w-4 h-4"/> : <DocumentIcon className="w-4 h-4"/>}
                      <span className="truncate max-w-[200px] font-serif italic">{selectedFile.name}</span>
                      <button type="button" onClick={clearFile} className="hover:text-[#2b261e] ml-2"><XMarkIcon className="w-4 h-4"/></button>
                  </div>
              )}
           </div>

           {/* API Key Input Section - Discrete but accessible */}
           <div className="w-full flex justify-center items-center">
                <div className={`transition-all duration-300 flex items-center justify-center gap-2 ${showKeyInput ? 'opacity-100 max-h-16' : 'opacity-60 max-h-8 hover:opacity-100'}`}>
                    <button type="button" onClick={() => setShowKeyInput(!showKeyInput)} className="p-2 text-[#a68f6a] hover:text-[#8b5a2b]" title="Configurar Chave API">
                        <KeyIcon className="w-4 h-4" />
                    </button>
                    {showKeyInput && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={handleApiKeyChange}
                                placeholder="Cole sua API Key do Google AI Studio"
                                className="bg-[#fcfbf9]/50 border border-[#a68f6a]/40 rounded-full px-4 py-1 text-xs text-[#2b261e] placeholder-[#a68f6a]/60 focus:border-[#8b5a2b] outline-none w-64"
                            />
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#8b5a2b] hover:underline whitespace-nowrap">
                                Obter grátis
                            </a>
                        </div>
                    )}
                </div>
           </div>
           
           <div className="mt-2 flex justify-center gap-4 text-xs text-[#a68f6a] font-serif italic">
               <button type="button" onClick={() => setPrompt("Desenho de uma máquina voadora")} className="hover:text-[#2b261e] hover:underline transition">"Máquina Voadora"</button>
               <span className="opacity-50">•</span>
               <button type="button" onClick={() => setPrompt("Um app para organizar meu ateliê")} className="hover:text-[#2b261e] hover:underline transition">"Organizador de Ateliê"</button>
               <span className="opacity-50">•</span>
               <button type="button" onClick={() => setPrompt("Relógio solar digital")} className="hover:text-[#2b261e] hover:underline transition">"Relógio Solar"</button>
           </div>
        </form>

      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs text-[#5c554b] font-serif uppercase tracking-widest relative z-10 flex items-center justify-center gap-4 border-t border-[#a68f6a]/20 mx-10">
          <span>GenioDaVinci • Suas ideias feitas pelo Léo</span>
          <button onClick={() => setShowTutorial(true)} className="flex items-center gap-1 text-[#8b5a2b] hover:text-[#2b261e] transition">
              <QuestionMarkCircleIcon className="w-4 h-4" /> Guia
          </button>
      </div>

      {/* -----------------------------------------------------------------------
          TUTORIAL MODAL
          ----------------------------------------------------------------------- */}
      {showTutorial && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={handleTutorialClose}></div>
              
              <div className="relative bg-white rounded-xl max-w-3xl w-full shadow-2xl animate-fade-in-up overflow-hidden flex flex-col md:flex-row">
                  <button onClick={handleTutorialClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10">
                      <XMarkIcon className="w-6 h-6" />
                  </button>

                  {/* Left Side: Visual/Context */}
                  <div className="w-full md:w-1/3 bg-[#f8f9fa] p-8 border-r border-gray-100 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-[#2b261e] text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                          <LightBulbIcon className="w-8 h-8" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Como Funciona</h2>
                      <p className="text-sm text-gray-500 leading-relaxed">
                          Siga os passos para transformar sua visão em realidade digital ou artística.
                      </p>
                  </div>

                  {/* Right Side: Steps */}
                  <div className="w-full md:w-2/3 p-8">
                      <div className="space-y-6">
                          
                          <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                              <div>
                                  <h3 className="text-base font-semibold text-gray-900">Configure sua Chave</h3>
                                  <p className="text-sm text-gray-600 mt-1">Insira sua API Key do Google AI Studio (Gratuito) no campo da chave abaixo do input.</p>
                              </div>
                          </div>

                          <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">2</div>
                              <div>
                                  <h3 className="text-base font-semibold text-gray-900">Defina sua Ideia</h3>
                                  <p className="text-sm text-gray-600 mt-1">Digite seu conceito ou anexe um arquivo (imagem, PDF, TXT) como base.</p>
                              </div>
                          </div>

                          <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm">3</div>
                              <div>
                                  <h3 className="text-base font-semibold text-gray-900">Escolha o Modo</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                      Selecione <span className="font-medium text-amber-800">Da Vinci</span>, 
                                      <span className="font-medium text-blue-800"> Leo.js</span> ou 
                                      <span className="font-medium text-purple-800"> Fusão</span>.
                                  </p>
                              </div>
                          </div>

                      </div>

                      <button 
                        onClick={handleTutorialClose}
                        className="mt-6 w-full py-3 bg-[#2b261e] text-white font-medium rounded-lg hover:bg-black transition-all shadow-md hover:shadow-lg"
                      >
                          Entendi, vamos começar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* -----------------------------------------------------------------------
          THE TRIPTYCH MODAL (METAMORPHOSIS CARDS)
          ----------------------------------------------------------------------- */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-[#0f1115]/90 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}></div>
              
              <div className="relative w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up overflow-y-auto max-h-[90vh] md:overflow-visible p-4">
                  
                  {/* CARD 1: LEO.JS (METAMORPHOSIS: DA VINCI -> CYBERPUNK) */}
                  <button 
                    onClick={() => handleModeSelect('app')} 
                    className="group relative h-[450px] rounded-2xl overflow-hidden text-left shrink-0 transition-all duration-700 border border-[#a68f6a] bg-[#f4f1ea] hover:bg-black hover:border-[var(--neon-blue)] hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] hover:-translate-y-2"
                  >
                      {/* Default State (Da Vinci) */}
                      <div className="absolute inset-0 p-8 flex flex-col transition-opacity duration-500 group-hover:opacity-0">
                          <div className="w-12 h-12 bg-[#a68f6a]/20 rounded-xl flex items-center justify-center mb-6 border border-[#a68f6a]">
                              <CodeBracketIcon className="w-6 h-6 text-[#8b5a2b]" />
                          </div>
                          <h3 className="text-2xl font-bold text-[#2b261e] mb-2 font-serif">Leo.js</h3>
                          <div className="h-0.5 w-12 bg-[#8b5a2b] mb-4"></div>
                          <p className="text-[#5c554b] text-sm leading-relaxed font-serif italic">
                              "Se eu tivesse nascido nesta era, o código seria meu pincel."
                          </p>
                      </div>

                      {/* Hover State (Cyberpunk) */}
                      <div className="absolute inset-0 p-8 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 bg-black/90">
                           {/* Glitch Overlay */}
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                          
                          <div className="relative z-20">
                              <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 border border-[var(--neon-blue)] shadow-[0_0_15px_var(--neon-blue)]">
                                  <CodeBracketIcon className="w-6 h-6 text-[var(--neon-blue)]" />
                              </div>
                              <h3 className="text-3xl font-bold text-[var(--neon-blue)] mb-2 font-cyber hover-glitch tracking-tighter">
                                  LEO.JS_V2.0
                              </h3>
                              <div className="h-0.5 w-full bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-blue)] mb-4"></div>
                              <p className="text-gray-300 text-sm leading-relaxed mb-auto font-mono">
                                  <span className="text-[var(--neon-green)]">{`>`}</span> Hacker Criativo.<br/>
                                  <span className="text-[var(--neon-green)]">{`>`}</span> Startups Unicórnio.<br/>
                                  <span className="text-[var(--neon-green)]">{`>`}</span> Soluções Radicais.
                              </p>
                              <div className="mt-8 p-2 border border-[var(--neon-blue)]/30 bg-blue-900/10 rounded text-[10px] text-[var(--neon-blue)] font-mono animate-pulse">
                                  SYSTEM: READY_TO_CODE
                              </div>
                          </div>
                      </div>
                  </button>

                  {/* CARD 2: CLASSIC DA VINCI (SKETCH ANIMATION) */}
                  <button 
                    onClick={() => handleModeSelect('davinci')} 
                    className="group relative h-[450px] bg-[#f4f1ea] border border-[#a68f6a] rounded-2xl overflow-hidden hover:shadow-[0_0_40px_rgba(166,143,106,0.5)] transition-all duration-500 hover:-translate-y-2 text-left shrink-0"
                  >
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-"></div>
                       
                       {/* Animated Sketch Background on Hover */}
                       <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700">
                           <svg viewBox="0 0 200 200" className="w-full h-full">
                               <circle cx="100" cy="100" r="80" fill="none" stroke="#2b261e" strokeWidth="0.5" className="group-hover:animate-sketch-draw" strokeDasharray="600" strokeDashoffset="600" />
                               <path d="M100 20 L100 180 M20 100 L180 100" stroke="#2b261e" strokeWidth="0.5" className="group-hover:animate-sketch-draw" strokeDasharray="400" strokeDashoffset="400" />
                               <rect x="60" y="60" width="80" height="80" fill="none" stroke="#2b261e" strokeWidth="0.5" transform="rotate(45 100 100)" className="group-hover:animate-sketch-draw" strokeDasharray="400" strokeDashoffset="400" />
                           </svg>
                       </div>

                       <div className="relative p-8 h-full flex flex-col">
                          <div className="w-12 h-12 bg-[#a68f6a]/20 rounded-xl flex items-center justify-center mb-6 border border-[#a68f6a] group-hover:border-[#2b261e] transition-colors">
                              <PaintBrushIcon className="w-6 h-6 text-[#8b5a2b] group-hover:text-[#2b261e]" />
                          </div>
                          <h3 className="text-2xl font-bold text-[#2b261e] mb-2 font-serif group-hover:italic">Mestre Da Vinci</h3>
                          <div className="h-0.5 w-12 bg-[#8b5a2b] mb-4 group-hover:w-24 transition-all duration-500"></div>
                          <p className="text-[#5c554b] text-sm leading-relaxed mb-auto font-serif">
                              Para artistas, engenheiros e sonhadores. Receba um Codex completo com estudos anatômicos, mecânicos e filosóficos.
                          </p>
                          <span className="text-xs font-serif italic text-[#8b5a2b] mt-4 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                              "Simplicidade é o último grau de sofisticação."
                          </span>
                       </div>
                  </button>

                  {/* CARD 3: FUSION (GOLD & DARK) */}
                  <button 
                    onClick={() => handleModeSelect('fusion')} 
                    className="group relative h-[450px] bg-[#1a1d26] border border-[#c5a059]/30 rounded-2xl overflow-hidden hover:border-[#c5a059] transition-all duration-500 hover:-translate-y-2 text-left shrink-0"
                  >
                       <div className="absolute inset-0 bg-gradient-to-b from-[#c5a059]/5 to-black/90"></div>
                       
                       {/* Rotating Ring Effect */}
                       <div className="absolute -right-20 -bottom-20 w-64 h-64 border border-[#c5a059]/20 rounded-full group-hover:border-[#c5a059]/60 transition-colors duration-500 group-hover:animate-spin-slow"></div>

                       <div className="relative p-8 h-full flex flex-col">
                          <div className="w-12 h-12 bg-[#c5a059]/10 rounded-xl flex items-center justify-center mb-6 border border-[#c5a059]/40 group-hover:border-[#c5a059] group-hover:shadow-[0_0_15px_#c5a059] transition-all">
                              <BoltIcon className="w-6 h-6 text-[#c5a059]" />
                          </div>
                          <h3 className="text-2xl font-bold text-[#e2e8f0] mb-2 font-serif">Fusão Cósmica</h3>
                          <div className="h-0.5 w-12 bg-[#c5a059] mb-4 group-hover:w-full transition-all duration-700 bg-gradient-to-r from-[#c5a059] to-transparent"></div>
                          <p className="text-gray-400 text-sm leading-relaxed mb-auto font-light">
                              O passado encontra o futuro. Artefatos digitais com a beleza do renascimento e a funcionalidade da era espacial.
                          </p>
                          <div className="mt-4 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition">
                              <div className="h-1 w-1 bg-[#c5a059] rounded-full"></div>
                              <span className="text-xs font-serif text-[#c5a059] tracking-widest uppercase">Renascimento Digital</span>
                          </div>
                       </div>
                  </button>

              </div>
          </div>
      )}

    </div>
  );
};