/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

// Modelo gratuito / rápido
const GEMINI_MODEL = "gemini-2.0-flash";

export const GEMINI_API_KEY_STORAGE = "capy_gemini_key";
const ALT_API_KEY_STORAGE = "gemini_user_api_key"; // compatibilidade com versão anterior do DaVinci

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

/**
 * Gera o conteúdo HTML de acordo com o prompt fornecido, podendo incluir 
 * imagem ou texto anexado, utilizando a API Gemini.
 */
export async function bringToLife(
  apiKeyInput: string | undefined,
  prompt: string,
  fileBase64?: string,
  mimeType?: string,
  mode: "app" | "davinci" | "fusion" = "app"
): Promise<string> {
  const apiKey = resolveGeminiApiKey(apiKeyInput);

  if (!apiKey) {
    throw new Error(
      "Chave Gemini não encontrada. Informe no app (campo de chave) ou defina a variável de ambiente GEMINI_API_KEY."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: Part[] = [];
  let finalPrompt = "";
  let systemInstruction = SYSTEM_INSTRUCTION_APP;

  // Seleção de modo (define instrução de sistema e prompt base conforme o contexto)
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
    // modo "app" (padrão)
    finalPrompt = fileBase64
      ? "Analise a imagem e crie um Web App funcional, criativo e útil."
      : prompt || "Invente um software revolucionário agora.";
  }

  // Adiciona o prompt principal como primeira parte do conteúdo
  parts.push({ text: finalPrompt });

  // Se houver arquivo de imagem ou outro tipo, adiciona como parte de dados embutidos (inlineData)
  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  // Chamada para a API Gemini para gerar o conteúdo
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

/**
 * Normaliza mensagens de erro da API para diferenciar chave inválida de cota esgotada.
 */
export function normalizeGeminiError(error: any): { message: string; isQuota: boolean } {
  const rawMessage = error?.error?.message || error?.message || "Erro desconhecido";
  const normalized = rawMessage.toLowerCase();
  const isQuota =
    normalized.includes("quota") ||
    normalized.includes("resource_exhausted") ||
    normalized.includes("429");

  if (isQuota) {
    const retryInfo = error?.error?.details?.find((d: any) => d?.retryDelay);
    const retry = retryInfo?.retryDelay 
      ? `Tente novamente após ${retryInfo.retryDelay}.` 
      : "Tente novamente em instantes.";

    return {
      isQuota: true,
      message:
        "⚠️ Cota do Gemini excedida. Ative faturamento ou use um projeto com limites disponíveis. " +
        "Veja https://ai.google.dev/gemini-api/docs/quotas. " +
        retry,
    };
  }

  return { isQuota: false, message: rawMessage };
}

/**
 * Resolve a chave de API do Gemini, usando a fornecida explicitamente ou buscando 
 * no localStorage e variáveis de ambiente, com compatibilidade legada.
 */
export function resolveGeminiApiKey(explicitKey?: string): string {
  const provided = (explicitKey || "").trim();
  if (provided) return provided;

  const storedKey = readBrowserKey(GEMINI_API_KEY_STORAGE);
  if (storedKey) return storedKey;

  // Fallback de compatibilidade (versão anterior armazenava em chave diferente)
  const altStoredKey = readBrowserKey(ALT_API_KEY_STORAGE);
  if (altStoredKey) return altStoredKey;

  if (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) {
    return (process.env.GEMINI_API_KEY || "").trim();
  }

  return "";
}

function readBrowserKey(keyName: string): string {
  if (typeof window === "undefined") return "";
  return (localStorage.getItem(keyName) || "").trim();
}
