/**
 * Gemini fetch client (no SDK)
 * - Cloudflare Pages friendly
 * - Cleans API key aggressively
 * - Uses gemini-2.0-flash
 */

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

export const GEMINI_API_KEY_STORAGE = "capy_gemini_key";
export const LEGACY_API_KEY_STORAGE = "gemini_user_api_key";

/* =========================
   Utils
========================= */
function safeString(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return String(value);
  } catch {
    return "";
  }
}

/**
 * Remove sujeiras comuns:
 * - espaços, \n, \r, tabs
 * - aspas
 * - prefixos "Bearer " / "key="
 */
function cleanApiKey(raw: any): string {
  let k = safeString(raw);

  // tira aspas em volta
  k = k.replace(/^["']+|["']+$/g, "");

  // remove prefixos comuns
  k = k.replace(/^Bearer\s+/i, "");
  k = k.replace(/^key=/i, "");

  // remove whitespace interno/externo
  k = k.replace(/\s+/g, "").trim();

  return k;
}

/**
 * Validação básica: Gemini API keys geralmente começam com "AIza"
 * (não é garantia absoluta, mas pega 99% dos casos de chave errada/lixo)
 */
function looksLikeGoogleApiKey(key: string): boolean {
  if (!key) return false;
  if (!key.startsWith("AIza")) return false;
  // tamanho típico 30-50+, mas deixamos flexível
  if (key.length < 20) return false;
  return true;
}

/* =========================
   API Key resolver
========================= */
export function resolveGeminiApiKey(explicitKey?: any): string {
  const provided = cleanApiKey(explicitKey);
  if (provided) return provided;

  if (typeof window === "undefined") return "";

  const primary = cleanApiKey(localStorage.getItem(GEMINI_API_KEY_STORAGE));
  if (primary) return primary;

  const legacy = cleanApiKey(localStorage.getItem(LEGACY_API_KEY_STORAGE));
  if (legacy) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, legacy);
    return legacy;
  }

  return "";
}

/* =========================
   Error normalization (App.tsx usa isso)
========================= */
export function normalizeGeminiError(error: any): string {
  const msg = safeString(error?.message || error);

  if (!msg) return "Erro desconhecido";

  if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
    return "Chave Gemini inválida. Cole uma chave válida (começa com AIza...) e salve novamente.";
  }

  if (msg.includes("429")) {
    return "Limite de uso atingido (429). Aguarde alguns segundos e tente novamente.";
  }

  return msg;
}

/* =========================
   System prompts
========================= */
const SYSTEM_APP = `Você é o Leonardo da Vinci dos anos 90.
Crie um Web App funcional, criativo e útil.
Retorne APENAS HTML puro começando com <!DOCTYPE html>.`;

const SYSTEM_DAVINCI = `Você é Leonardo Da Vinci (1452).
Crie um Codex artístico em HTML estilo pergaminho.
Retorne APENAS HTML puro começando com <!DOCTYPE html>.`;

const SYSTEM_FUSION = `Você funde Renascimento com tecnologia futurista.
Crie ferramentas funcionais com estética mística.
Retorne APENAS HTML puro começando com <!DOCTYPE html>.`;

/* =========================
   Main
========================= */
export async function bringToLife(
  apiKeyInput: any,
  prompt: string,
  fileBase64?: string,
  mimeType?: string,
  mode: "app" | "davinci" | "fusion" = "app"
): Promise<string> {
  const apiKey = resolveGeminiApiKey(apiKeyInput);

  // valida antes de chamar API
  if (!apiKey) {
    throw new Error("Chave Gemini não encontrada. Vá em Config e salve sua chave.");
  }
  if (!looksLikeGoogleApiKey(apiKey)) {
    throw new Error(
      `Chave Gemini parece inválida. Verifique se você colou a chave correta (geralmente começa com "AIza").`
    );
  }

  let systemInstruction = SYSTEM_APP;
  if (mode === "davinci") systemInstruction = SYSTEM_DAVINCI;
  if (mode === "fusion") systemInstruction = SYSTEM_FUSION;

  const parts: any[] = [{ text: safeString(prompt) }];

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: { data: fileBase64, mimeType },
    });
  }

  const body = {
    contents: [{ parts }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: 0.7 },
  };

  const url = `${GEMINI_ENDPOINT}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    // joga um erro “bonito” que normalizeGeminiError entende
    throw new Error(`Erro na API ${response.status}: ${text}`);
  }

  const result = await response.json();

  let output =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "<!-- Nenhum conteúdo retornado -->";

  output = safeString(output)
    .replace(/^```html/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "");

  return output;
}
