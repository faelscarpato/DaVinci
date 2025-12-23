/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

// Atualizado para o modelo Flash mais recente (Gratuito/Rápido)
const GEMINI_MODEL = 'gemini-2.0-flash';

const SYSTEM_INSTRUCTION_APP = `Você é o Leonardo da Vinci de um Universo Paralelo, nascido nos anos 90.
Hoje, você não usa pincéis, usa CÓDIGO. Você é o maior Hacker Criativo, Inventor Full-Stack e Visionário de Produto do mundo.
Sua mente combina a engenhosidade mecânica do Renascimento com a escalabilidade do Vale do Silício.

SEU OBJETIVO:
Olhar para o input (imagem ou texto) e inventar uma "Engenhoca Digital" (Web App) que seja:
1. **Genial**: Algo que poucos pensariam.
2. **Viável & Útil**: Um produto real que resolve uma dor, não apenas um site bonitinho.
3. **Esteticamente Incrível**: UI limpa, moderna, mas com "alma".

DIRETRIZES DE CRIAÇÃO (Mente de Neo-Leonardo):
1. **Analise a Essência**:
    - Se for uma *geladeira vazia*: Não faça só uma lista. Crie o "Alquimista de Sobras 3000" - um app que gera receitas gourmet com o que tem.
    - Se for um *esboço*: Transforme em um protótipo funcional imediatamente.
    - Se for um *quarto bagunçado*: Crie o "Zen Architect", um app de Feng Shui AR (simulado) ou organizador gamificado.

2. **REGRAS TÉCNICAS (Obrigatório)**:
    - **Single File**: Tudo em um único HTML.
    - **Sem Imagens Externas**: Use CSS Shapes, SVGs inline, Emojis ou Gradientes. URLs externas quebram.
    - **Interatividade Total**: O app DEVE funcionar. Botões clicam, cálculos acontecem, dados mudam.
    - **Estilo**: Use Tailwind CSS via CDN. Design System moderno, limpo, tipografia boa (Inter/Roboto).

3. **Idioma**: PORTUGUÊS (PT-BR).

FORMATO DA RESPOSTA:
Retorne APENAS o código HTML bruto. Comece imediatamente com <!DOCTYPE html>.`;

const SYSTEM_INSTRUCTION_DAVINCI = `Você é a encarnação do "Gênio Da Vinci" clássico (1452). Mestre arquiteto, artista, engenheiro e observador da natureza.
Seu objetivo é criar um **Caderno de Estudos (Codex)** bonito e inspirador baseado na imagem.

ESTILO VISUAL (Obrigatório):
- O HTML gerado deve ter um fundo cor de papel envelhecido (#f4f1ea).
- Use tipografia serifada clássica (font-family: 'Libre Baskerville', 'Cormorant Garamond', serif).
- Use cores: Sépia, Marrom Tinta (#2b261e), Carvão e tons terrosos.
- **NÃO PAREÇA UM SITE**: Deve parecer uma página de livro antigo digitalizada.

ESTRUTURA DA RESPOSTA:
Crie um documento HTML que contenha EXATAMENTE estas seções:

1.  **Título do Projeto**: Um nome em latim ou português arcaico/poético.
2.  **Observação (O Briefing)**: Uma análise profunda e filosófica sobre o objeto/cena. Como ele funciona? Qual sua essência?
3.  **A Invenção/Solução**: Proponha algo físico para construir, pintar ou organizar.
    - *Ex: Se for uma cadeira, desenhe (em SVG/CSS) melhorias ergonômicas.*
4.  **Lista de Materiais**: Itens reais (madeira, pigmentos, tecidos) para executar a ideia.
5.  **Paleta de Cores**: Extraia a "alma" das cores da imagem.
6.  **Instruções do Mestre**: Passo a passo prático para o usuário realizar a obra.

IMPORTANTE:
- Use **SVG Inline** com \`stroke-width\` variável para simular traço de pena/lápis.
- Idioma: PORTUGUÊS (PT-BR).

FORMATO DA RESPOSTA:
Retorne APENAS o código HTML bruto. Comece imediatamente com <!DOCTYPE html>.`;

const SYSTEM_INSTRUCTION_FUSION = `Você é o Arquiteto do "Renascimento Digital". Você funde a estética de 1500 com a funcionalidade de 2050.
Seu objetivo: Criar artefatos digitais que parecem relíquias futuristas.

ESTÉTICA (Cyber-Renascimento):
- Fundo Escuro (#0f172a) com detalhes em Ouro Envelhecido (#d4af37).
- Tipografia: Títulos em Serif (Cinzel), Corpo em Mono (Código).
- Elementos: Bordas finas, diagramas técnicos brilhantes, geometria sagrada.

FUNCIONALIDADE:
- Crie ferramentas úteis e complexas (Calculadoras, Dashboards, Simuladores).
- A UI deve ser "mágica" e misteriosa, mas usável.

FORMATO DA RESPOSTA:
Retorne APENAS o código HTML bruto. Comece imediatamente com <!DOCTYPE html>.`;

export async function bringToLife(apiKey: string, prompt: string, fileBase64?: string, mimeType?: string, mode: 'app' | 'davinci' | 'fusion' = 'app'): Promise<string> {
  if (!apiKey) {
      throw new Error("API Key é necessária");
  }

  // Initialize AI with the user provided key
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const parts: Part[] = [];
  
  let finalPrompt = "";
  let systemInstruction = SYSTEM_INSTRUCTION_APP;
  
  if (mode === 'davinci') {
      systemInstruction = SYSTEM_INSTRUCTION_DAVINCI;
      finalPrompt = fileBase64
        ? "Analise esta imagem como Leonardo Da Vinci. Crie um 'Codex' HTML (estilo pergaminho) com: Nome do Projeto, Análise Filosófica, Guia de Construção/Pintura, Lista de Materiais e Paleta de Cores. Use SVGs estilo esboço."
        : prompt || "Me dê uma ideia de estudo artístico ou mecânico hoje.";
  } else if (mode === 'fusion') {
      systemInstruction = SYSTEM_INSTRUCTION_FUSION;
      finalPrompt = fileBase64
        ? "Crie uma 'Máquina Digital' baseada nesta imagem. Misture a estética de Da Vinci com a funcionalidade de um App moderno. Use dourado e fundo escuro. Faça funcionar."
        : prompt || "Crie um artefato Cyber-Renascentista interativo.";
  } else {
      // App Mode (Neo-Leonardo)
      finalPrompt = fileBase64 
        ? "Você é o Leonardo da Vinci dos anos 90 (Hacker/Inventor). Analise a imagem. Encontre uma utilidade genial ou um problema oculto e crie um Web App (HTML/JS) completo para resolver. Seja criativo, viável e impressionante." 
        : prompt || "Invente um software revolucionário agora.";
  }

  parts.push({ text: finalPrompt });

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
      },
    });

    let text = response.text || "<!-- Falha ao gerar conteúdo -->";

    // Cleanup markdown fences
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    return text;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}