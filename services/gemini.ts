/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

// Modelo gratuito / rápido
const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Lê a chave Gemini diretamente do CapyUniverse
 * (Configurações > Chave API Gemini)
 */
function getCapyUniverseApiKey(): string {
  if (typeof window === "undefined") return "";
  return (localStorage.getItem("capy_gemini_key") || "").trim();
}

/* ======================================================
   SYSTEM INSTRUCTIONS
====================================================== */

const SYSTEM_INSTRUCTION_APP = `Você é o Leonardo da Vinci de um Universo Paralelo, nascido nos anos 90.
Hoje, você não usa pincéis, usa CÓDIGO. Você é o maior Hacker Criativo, Inventor Full-Stack e Visionário de Produto do mundo.
Sua mente combina a engenhosidade mecânica do Renascimento com a escalabilidade do Vale do Silício.

SEU OBJETIVO:
Olhar para o input (imagem ou texto) e inventar uma "Engenhoca Digital" (Web App) que seja:
1. Genial
2. Viável e útil
3. Esteticamente incrível

REGRAS TÉCNICAS:
- Single file (1 HTML)
- Sem imagens externas
- Interatividade real
- Tailwind via CDN
- Idioma: PT-BR

FORMATO:
Retorne APENAS o HTML bruto começando com <!DOCTYPE html>.`;

const SYSTEM_INSTRUCTION_DAVINCI = `Você é Leonardo Da Vinci (1452).
Crie um Codex artístico em HTML com estética de pergaminho.

ESTILO:
- Fundo #f4f1ea
- Serif clássica
- SVGs estilo esboço
- Tons sépia

SEÇÕES:
1. Título
2. Observação filosófica
3. Invenção
4. Materiais
5. Paleta
6. Instruções

FORMATO:
Retorne APENAS o HTML bruto.`;

const SYSTEM_INSTRUCTION_FUSION = `Você é o Arquiteto do Renascimento Digital.
Misture Da Vinci + tecnologia futurista.

ESTÉTICA:
- Fundo escuro
- Ouro envelhecido
- Tipografia serif + mono

FUNCIONALIDADE:
- Dashboards
- Calculadoras
- Simuladores

FORMATO:
Retorne APENAS o HTML bruto.`;

/* ======================================================
   FUNÇÃO PRINCIPAL
====================================================== */

export async function bringToLife(
  prompt: string,
  fileBase64?: string,
  mimeType?: string,
  mode: "app" | "davinci" | "fusion" = "app"
): Promise<string> {
  const apiKey = getCapyUniverseApiKey();

  if (!apiKey) {
    throw new Error(
      "Chave Gemini não encontrada. Configure em: CapyUniverse > Ajustes > Chave API Gemini."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: Part[] = [];
  let finalPrompt = "";
  let systemInstruction = SYSTEM_INSTRUCTION_APP;

  // Seleção de modo
  if (mode === "davinci") {
    systemInstruction = SYSTEM_INSTRUCTION_DAVINCI;
    finalPrompt = fileBase64
      ? "Analise a imagem e crie um Codex artístico em HTML no estilo Da Vinci."
      : prompt || "Crie um estudo artístico ou mecânico.";
  } else if (mode === "fusion") {
    systemInstruction = SYSTEM_INSTRUCTION_FUSION;
    finalPrompt = fileBase64
      ? "Crie uma Máquina Digital futurista baseada nesta imagem."
      : prompt || "Crie um artefato cyber-renascentista interativo.";
  } else {
    finalPrompt = fileBase64
      ? "Analise a imagem e crie um Web App funcional, criativo e útil."
      : prompt || "Invente um software revolucionário agora.";
  }

  parts.push({ text: finalPrompt });

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType,
      },
    });
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: { parts },
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  let output = response.text || "<!-- Falha ao gerar conteúdo -->";

  // Remove fences de markdown, se vierem
  output = output
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "");

  return output;
}