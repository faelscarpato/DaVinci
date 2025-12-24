/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Modelo e endpoint direto (fetch)
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

export const GEMINI_API_KEY_STORAGE = "capy_gemini_key";
const ALT_API_KEY_STORAGE = "gemini_user_api_key"; // compatibilidade com versões antigas

type Mode = "app" | "davinci" | "fusion";

/* ======================================================
   SYSTEM INSTRUCTIONS
====================================================== */

const SYSTEM_INSTRUCTION_APP = `Você é o Leonardo da Vinci de um Universo Paralelo, nascido nos anos 90.
Hoje, você não usa pincéis, usa CÓDIGO. Você é o maior Hacker Criativo, Inventor Full-Stack e Visionário de Produto do mundo.
Sua mente combina a engenhosidade mecânica do Renascimento com a escalabilidade do Vale do Silício.

SEU OBJETIVO:
Olhar para o input (imagem ou texto) e inventar uma "Engenhoca Digital" (Web App) que seja:
1. **Genial**
2. **Viável & Útil**
3. **Esteticamente Incrível**

REGRAS TÉCNICAS (Obrigatório):
- Single File (1 HTML)
- Sem imagens externas
- Interatividade total
- Tailwind via CDN
- Idioma: PT-BR

FORMATO:
Retorne APENAS o HTML bruto começando com <!DOCTYPE html>.`;

const SYSTEM_INSTRUCTION_DAVINCI = `Você é Leonardo Da Vinci (1452).
Crie um Codex artístico em HTML com estética de pergaminho.

ESTILO (Obrigatório):
- Fundo #f4f1ea
- Tipografia serif clássica
- Tons sépia
- SVG inline estilo esboço (traço de pena)

SEÇÕES:
1) Título
2) Observação filosófica
3) Invenção/Solução
4) Materiais
5) Paleta
6) Instruções

FORMATO:
Retorne APENAS o HTML bruto começando com <!DOCTYPE html>.`;

const SYSTEM_INSTRUCTION_FUSION = `Você é o Arquiteto do Renascimento Digital.
Misture a estética de 1500 com a funcionalidade de 2050.

ESTÉTICA:
- Fundo escuro
- Ouro envelhecido
- Tipografia serif + mono

FUNCIONALIDADE:
- Ferramentas úteis (dashboards, calculadoras, simuladores)
- UI misteriosa, mas usável

FORMATO:
Retorne APENAS o HTML bruto começando com <!DOCTYPE html>.`;

/* ======================================================
   PUBLIC API
====================================================== */

export async function bringToLife(
  apiKeyInput: string | undefined,
  prompt: string,
  fileBase64?: string,
  mimeType?: string,
  mode: Mode = "app"
): Promise<string> {
  const geminiApiKey = resolveGeminiApiKey(apiKeyInput);

  if (!geminiApiKey) {
    throw new Error(
      "Chave Gemini não encontrada. Cadastre no CapyUniverse (capy_gemini_key) ou forneça explicitamente."
    );
  }

  // 1) Seleciona instruction + prompt final
  let systemInstruction = SYSTEM_INSTRUCTION_APP;
  let finalPrompt = "";

  if (mode === "davinci") {
    systemInstruction = SYSTEM_INSTRUCTION_DAVINCI;
    finalPrompt = fileBase64
      ? "Analise esta imagem como Leonardo Da Vinci e gere um Codex HTML estilo pergaminho com as seções pedidas."
      : prompt || "Crie um Codex artístico e mecânico em HTML.";
  } else if (mode === "fusion") {
    systemInstruction = SYSTEM_INSTRUCTION_FUSION;
    finalPrompt = fileBase64
      ? "Crie uma Máquina Digital baseada nesta imagem, misturando estética renascentista com UI futurista. Faça funcionar."
      : prompt || "Crie um artefato cyber-renascentista interativo em HTML.";
  } else {
    systemInstruction = SYSTEM_INSTRUCTION_APP;
    finalPrompt = fileBase64
      ? "Analise a imagem. Encontre um problema oculto e crie um Web App completo em HTML/JS para resolver."
      : prompt || "Invente um software revolucionário agora.";
  }

  // 2) Monta parts (prompt + optional inlineData)
  const parts: any[] = [{ text: finalPrompt }];

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType,
      },
    });
  }

  // 3) Faz a chamada direta via fetch (sem SDK)
  const url = `${GEMINI_API_BASE}/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  const body = {
    contents: [{ parts }],
    // systemInstruction no v1beta vai em "systemInstruction" dentro de "generationConfig"? não.
    // O formato mais compatível (e padrão do v1beta) é enviar "systemInstruction" em "system_instruction"
    // mas ele varia; o que costuma funcionar bem é enviar como "systemInstruction" no top-level.
    // Se sua conta/endpoint ignorar, ainda funciona via prompt.
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.7,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // 4) Tratamento de erro limpo
  if (!res.ok) {
    const errText = await safeReadText(res);
    const msg = `Erro na API: ${res.status} ${res.statusText}${
      errText ? ` | ${errText}` : ""
    }`;
    throw new Error(msg);
  }

  const result = await res.json();

  // 5) Extrai texto com fallback
  let text: string =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "<!-- Falha ao gerar conteúdo -->";

  // Limpa fences (caso venha em markdown)
  text = text
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "");

  return text;
}

/**
 * Resolve chave do Gemini usando:
 * - explicitKey (se vier)
 * - localStorage('capy_gemini_key')
 * - fallback localStorage('gemini_user_api_key') e migra
 */
export function resolveGeminiApiKey(explicitKey?: string): string {
  const provided = (explicitKey || "").trim();
  if (provided) return provided;

  if (typeof window === "undefined") return "";

  const primary = (localStorage.getItem(GEMINI_API_KEY_STORAGE) || "").trim();
  if (primary) return primary;

  const legacy = (localStorage.getItem(ALT_API_KEY_STORAGE) || "").trim();
  if (legacy) {
    // migra para o padrão CapyUniverse
    localStorage.setItem(GEMINI_API_KEY_STORAGE, legacy);
    return legacy;
  }

  return "";
}

/* ======================================================
   HELPERS
====================================================== */

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
