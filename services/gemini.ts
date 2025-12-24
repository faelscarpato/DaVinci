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

type GenerationMode = "app" | "davinci" | "fusion";

type BringToLifeParams =
  | [apiKey: string, prompt: string, fileBase64?: string, mimeType?: string, mode?: GenerationMode]
  | [
      params: {
        apiKey?: string;
        prompt: string;
        fileBase64?: string;
        mimeType?: string;
        mode?: GenerationMode;
      },
    ];

const isLikelyApiKey = (value: string | undefined) =>
  !!value && /^AIza[0-9A-Za-z\-_]{30,}$/.test(value.trim());

const normalizeArgs = (...args: BringToLifeParams) => {
  if (typeof args[0] === "string") {
    const [apiKey, prompt, fileBase64, mimeType, mode] = args as [
      string,
      string,
      string | undefined,
      string | undefined,
      GenerationMode | undefined
    ];

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      throw new Error(
        "O segundo argumento deve ser o prompt de texto (string não vazia)."
      );
    }

    return {
      apiKey,
      prompt,
      fileBase64,
      mimeType,
      mode: mode ?? "app",
    };
  }

  const [{ apiKey, prompt, fileBase64, mimeType, mode }] = args;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("O prompt deve ser uma string não vazia.");
  }

  return {
    apiKey,
    prompt,
    fileBase64,
    mimeType,
    mode: mode ?? "app",
  };
};

/* ======================================================
   FUNÇÃO PRINCIPAL
====================================================== */

export async function bringToLife(
  ...args: BringToLifeParams
): Promise<string> {
  const {
    apiKey: providedKey,
    prompt: rawPrompt,
    fileBase64,
    mimeType,
    mode,
  } = normalizeArgs(...args);

  const apiKey = (providedKey || getCapyUniverseApiKey()).trim();

  if (!apiKey) {
    throw new Error(
      "Chave Gemini não encontrada. Configure em: CapyUniverse > Ajustes > Chave API Gemini."
    );
  }

  if (isLikelyApiKey(rawPrompt)) {
    throw new Error(
      "Prompt inválido: parece que a chave API foi usada no lugar do prompt."
    );
  }

  if ((fileBase64 && !mimeType) || (!fileBase64 && mimeType)) {
    throw new Error(
      "Arquivo inválido: forneça fileBase64 e mimeType juntos ou nenhum dos dois."
    );
  }

  if (fileBase64 && typeof fileBase64 !== "string") {
    throw new Error("fileBase64 deve ser uma string base64.");
  }

  if (mimeType && typeof mimeType !== "string") {
    throw new Error("mimeType deve ser uma string MIME válida.");
  }

  const prompt = rawPrompt.trim();

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
