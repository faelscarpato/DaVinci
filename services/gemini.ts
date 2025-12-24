/**
 * SPDX-License-Identifier: Apache-2.0
 */

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

export const GEMINI_API_KEY_STORAGE = "capy_gemini_key";
export const LEGACY_API_KEY_STORAGE = "gemini_user_api_key";

/* =====================================================
   Utils seguros (NUNCA chamam trim em não-string)
===================================================== */

function safeString(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return String(value);
  } catch {
    return "";
  }
}

/* =====================================================
   API KEY
===================================================== */

export function resolveGeminiApiKey(explicitKey?: any): string {
  const provided = safeString(explicitKey).trim();
  if (provided) return provided;

  if (typeof window === "undefined") return "";

  const primary = safeString(
    localStorage.getItem(GEMINI_API_KEY_STORAGE)
  ).trim();

  if (primary) return primary;

  const legacy = safeString(
    localStorage.getItem(LEGACY_API_KEY_STORAGE)
  ).trim();

  if (legacy) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, legacy);
    return legacy;
  }

  return "";
}

/* =====================================================
   ERROR NORMALIZATION (usado pelo App.tsx)
===================================================== */

export function normalizeGeminiError(error: any): string {
  if (!error) return "Erro desconhecido";

  if (typeof error === "string") return error;

  if (error.message) {
    if (error.message.includes("429")) {
      return "Limite de uso da IA atingido. Tente novamente em alguns segundos.";
    }
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Erro inesperado ao comunicar com a IA.";
  }
}

/* =====================================================
   SYSTEM PROMPTS
===================================================== */

const SYSTEM_APP = `Você é o Leonardo da Vinci dos anos 90.
Crie um Web App funcional, criativo e útil.
Retorne APENAS HTML puro começando com <!DOCTYPE html>.`;

const SYSTEM_DAVINCI = `Você é Leonardo Da Vinci (1452).
Crie um Codex artístico em HTML estilo pergaminho.
Retorne APENAS HTML puro começando com <!DOCTYPE html>.`;

const SYSTEM_FUSION = `Você funde Renascimento com tecnologia futurista.
Crie ferramentas funcionais com estética mística.
Retorne APENAS HTML puro começando com <!DOCTYPE html>.`;

/* =====================================================
   MAIN FUNCTION
===================================================== */

export async function bringToLife(
  apiKeyInput: any,
  prompt: string,
  fileBase64?: string,
  mimeType?: string,
  mode: "app" | "davinci" | "fusion" = "app"
): Promise<string> {
  const apiKey = resolveGeminiApiKey(apiKeyInput);

  if (!apiKey) {
    throw new Error("Chave Gemini não encontrada.");
  }

  let systemInstruction = SYSTEM_APP;

  if (mode === "davinci") systemInstruction = SYSTEM_DAVINCI;
  if (mode === "fusion") systemInstruction = SYSTEM_FUSION;

  const parts: any[] = [{ text: safeString(prompt) }];

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType,
      },
    });
  }

  const body = {
    contents: [{ parts }],
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: 0.7,
    },
  };

  const response = await fetch(
    `${GEMINI_ENDPOINT}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro na API ${response.status}: ${text}`);
  }

  const result = await response.json();

  let output =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "<!-- Nenhum conteúdo retornado -->";

  // limpa fences
  output = safeString(output)
    .replace(/^```html/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "");

  return output;
}
