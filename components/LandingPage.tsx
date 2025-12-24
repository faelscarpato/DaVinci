/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  SparklesIcon, 
  CodeBracketIcon, 
  PaintBrushIcon, 
  BoltIcon, 
  ArrowRightIcon, 
  PaperClipIcon, 
  XMarkIcon, 
  DocumentIcon, 
  PhotoIcon, 
  QuestionMarkCircleIcon, 
  LightBulbIcon, 
  KeyIcon 
} from '@heroicons/react/24/outline';
import { GEMINI_API_KEY_STORAGE } from '../services/gemini';

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
    // Verifica no LocalStorage se há uma API Key salva (nova ou de versão anterior)
    const savedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE) || localStorage.getItem('gemini_user_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      // Se a chave estava salva no identificador antigo, migra para o novo
      localStorage.setItem(GEMINI_API_KEY_STORAGE, savedKey);
    } else {
      setShowKeyInput(true); // Exibe o campo de entrada se nenhuma chave for encontrada
    }

    // Efeito de entrada imersiva (animação de landing page)
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
    localStorage.setItem(GEMINI_API_KEY_STORAGE, newKey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setShowKeyInput(true);
      alert("Por favor, insira sua chave API do Google AI Studio ou configure GEMINI_API_KEY no ambiente.");
      return;
    }
    if (prompt.trim() || selectedFile) {
      setShowModal(true);
    }
  };

  const handleModeSelect = (mode: 'app' | 'davinci' | 'fusion') => {
    if (!apiKey) {
      alert("API Key necessária. Use o campo abaixo ou configure GEMINI_API_KEY antes de gerar.");
      return;
    }
    // Pequeno atraso para animação do modal antes de iniciar
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
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.9'/%3E%3C/svg%3E")` }}
      ></div>
      
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
            Transforme ideias em aplicações web incríveis combinando arte e tecnologia.
          </p>
        </div>

        {/* Prompt Input Area */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
          <div className="flex items-center border-b border-[#a68f6a] py-2">
            <input
              className="appearance-none bg-transparent border-none w-full text-[#2b261e] mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="Descreva sua ideia ou arraste um arquivo..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="flex-shrink-0 bg-[#a68f6a] hover:bg-[#8b5a2b] text-sm text-white py-1 px-2 rounded"
              type="submit"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* File Attachment & Mode Selection */}
        <div className="mt-4 flex flex-col items-center space-y-2">
          {selectedFile ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#5c554b]">{selectedFile.name}</span>
              <button onClick={clearFile} className="text-[#5c554b] hover:text-[#2b261e]">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center space-x-2 cursor-pointer text-[#5c554b] hover:text-[#2b261e]">
              <PaperClipIcon className="w-5 h-5" />
              <span className="text-sm">Anexar arquivo (imagem ou .txt)</span>
              <input 
                type="file" 
                accept="image/*,text/plain" 
                className="hidden" 
                onChange={handleFileChange} 
                ref={fileInputRef}
              />
            </label>
          )}

          <div className="flex space-x-4 mt-2">
            <button 
              onClick={() => handleModeSelect('app')}
              className="flex flex-col items-center text-[#5c554b] hover:text-[#2b261e]"
            >
              <CodeBracketIcon className="w-6 h-6 mb-1" />
              <span className="text-xs">App</span>
            </button>
            <button 
              onClick={() => handleModeSelect('davinci')}
              className="flex flex-col items-center text-[#5c554b] hover:text-[#2b261e]"
            >
              <PaintBrushIcon className="w-6 h-6 mb-1" />
              <span className="text-xs">Da Vinci</span>
            </button>
            <button 
              onClick={() => handleModeSelect('fusion')}
              className="flex flex-col items-center text-[#5c554b] hover:text-[#2b261e]"
            >
              <BoltIcon className="w-6 h-6 mb-1" />
              <span className="text-xs">Fusion</span>
            </button>
          </div>
        </div>

        {/* API Key Input (shown only if needed) */}
        {showKeyInput && (
          <div className="mt-6 flex items-center space-x-2">
            <KeyIcon className="w-5 h-5 text-[#5c554b]" />
            <input
              type="text"
              placeholder="Insira sua Gemini API Key"
              value={apiKey}
              onChange={handleApiKeyChange}
              className="border border-[#a68f6a] px-2 py-1 text-sm text-[#2b261e] focus:outline-none"
            />
            <button 
              onClick={() => apiKey && setShowKeyInput(false)}
              className="text-sm text-[#5c554b] underline"
            >
              OK
            </button>
          </div>
        )}

      </div>

      {/* Modal de confirmação antes de gerar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
            <p className="mb-4 text-[#2b261e]">Deseja gerar a partir deste prompt {selectedFile ? "e arquivo anexado" : ""}?</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => {
                  setShowModal(false);
                  // A geração será iniciada no handleModeSelect após confirmação do modal
                }}
                className="bg-[#a68f6a] hover:bg-[#8b5a2b] text-white px-4 py-2 rounded"
              >
                Sim
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-[#2b261e] px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
            <button onClick={handleTutorialClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#2b261e]">Bem-vindo ao DaVinci Gênio!</h2>
            <p className="text-sm text-[#2b261e] mb-2">
              Este aplicativo utiliza a API Google Gemini para transformar suas ideias em aplicações web.
            </p>
            <p className="text-sm text-[#2b261e] mb-2">
              Insira uma breve descrição da sua ideia ou anexe uma imagem/texto, escolha um modo (App, Da Vinci ou Fusion) e veja a mágica acontecer.
            </p>
            <p className="text-sm text-[#2b261e] mb-2">
              Certifique-se de fornecer sua API Key do Gemini (obtenha no Google AI Studio) no campo apropriado.
            </p>
            <p className="text-sm text-[#2b261e]">
              Dica: você pode arrastar e soltar um arquivo de imagem ou texto na área de prompt para usá-lo como inspiração.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
