/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ======================================================
// CONFIG
// ======================================================

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

export const GEMINI_API_KEY_STORAGE = "capy_gemini_key";
const LEGACY_API_KEY_STORAGE = "gemini_user_api_key"; // compatibilidade com versões antigas

export type Mode = "app" | "davinci" | "fusion";

// ======================================================
// SYSTEM INSTRUCTIONS
// ======================================================

const SYSTEM_INSTRUCTION_APP = `Você é o Leonardo da Vinci de um Universo Paralelo, nascido nos anos 90.
Hoje, você não usa pincéis, usa CÓDIGO. Você é o maior Hacker Criativo, Inventor Full-Stack e Visionário de Produto do mundo.
Sua mente combina a engenhosidade mecânica do Renascimento com a escalabilidade do Vale do Silício.

SEU OBJETIVO:
Olhar para o input (imagem ou texto) e inventar uma "Engenhoca Digital" (Web App) que seja:
1. **Genial**: Algo que poucos pensariam.
2. **Viável & Útil**: Um produto real que resolve uma dor.
3. **Esteticamente Incrível**: UI moderna, mas com alma.

REGRAS TÉCNICAS (Obrigatório):
- Single File: tudo em um único HTML.
- Sem imagens externas.
- Interatividade total.
- Tailwind via CDN.
- Idioma: PT-BR.

FORMATO:
Retorne APENAS o HTML bruto começando com <!DOCTYPE html>.`;

const SYSTEM_INSTRUCTION_DAVINCI = `Você é a encarnação do "Gênio Da Vinci" clássico (1452).
Seu objetivo é criar um **Caderno de Estudos (Codex)** bonito e inspirador baseado na imagem.

ESTILO VISUAL (Obrigatório):
- Fundo cor de papel envelhecido (#f4f1ea).
- Tipografia serifada clássica.
- Cores: sépia, marrom tinta (#2b261e), carvão e tons terrosos.
- NÃO pareça um site: pareça uma página de livro antigo digitalizada.

SEÇÕES:
1) Título do Projeto
2) Observação (Briefing)
3) A Invenção/Solução
4) Lista de Materiais
5) Paleta de Cores
6) Instruções do Mestre

IMPORTANTE:
- Use SVG Inline com traço tipo pena/lápis.
- Idioma: PT-BR.

FORMATO:
Retorne APENAS o HTML bruto começando com <!DOCTYPE html>.`;

const SYSTEM_INSTRUCTION_FUSION = `Você é o Arquiteto do "Renascimento Digital". Você funde a estética de 1500 com a funcionalidade de 2050.
Seu objetivo: Criar artefatos digitais que parecem relíquias futuristas.

ESTÉTICA (Cyber-Renascimento):
- Fundo Escuro (#0f172a) com detalhes em Ouro Envelhecido (#d4af37).
- Tipografia: Títulos em Serif (Cinzel), Corpo em Mono.
- Elementos: Bordas finas, diagramas técnicos brilhantes, geometria sagrada.

FUNCIONALIDADE:
- Crie ferramentas úteis e complexas.
- UI mágica e misteriosa, mas usável.

FORMATO:
Retorne APENAS o HTML bruto começando com <!DOCTYPE html>.`;

// ======================================================
// PUBLIC FUNCTIONS (exportadas)
// ======================================================

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

  const legacy = (localStorage.getItem(LEGACY_API_KEY_STORAGE) || "").trim();
  if (legacy) {
    // migra para o padrão CapyUniverse
    localStorage.setItem(GEMINI_API_KEY_STORAGE, legacy);
    return legacy;
  }

  return "";
}

/**
 * Normaliza erros do Gemini para uma mensagem humana e curta.
 * (Mantém compatibilidade com App.tsx que importa isso)
 */
export function normalizeGeminiError(err: unknown): string {
  const msg =
    typeof err === "string"
      ? err
      : err instanceof Error
      ? err.message
      : JSON.stringify(err);

  const lower = msg.toLowerCase();

  // quota / rate limit
  if (lower.includes("429") || lower.includes("quota") || lower.includes("rate")) {
    return "Cota/limite do Gemini atingido (429). Verifique quota, billing e uso da sua chave.";
  }

  // auth / key inválida
  if (lower.includes("401") || lower.includes("403") || lower.includes("api key")) {
    return "Chave Gemini inválida ou sem permissão (401/403). Confira a chave salva no CapyUniverse.";
  }

  // rede
  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "Falha de rede ao chamar o Gemini. Verifique conexão e CORS.";
  }

  // fallback
  return "Erro ao chamar o Gemini. Veja o console para detalhes.";
}

export async function bringToLife(
  apiKey: string | undefined,
  prompt: string,
  fileBase64?: string,
  mimeType?: string,
  mode: Mode = "app"
): Promise<string> {
  const geminiApiKey = resolveGeminiApiKey(apiKey);

  if (!geminiApiKey) {
    throw new Error(
      "API Key é necessária. Cadastre no CapyUniverse (capy_gemini_key) ou forneça explicitamente."
    );
  }

  // Prompt final + system instruction por modo
  let systemInstruction = SYSTEM_INSTRUCTION_APP;
  let finalPrompt = "";

  if (mode === "davinci") {
    systemInstruction = SYSTEM_INSTRUCTION_DAVINCI;
    finalPrompt = fileBase64
      ? "Analise esta imagem como Leonardo Da Vinci. Crie um 'Codex' HTML estilo pergaminho com as seções pedidas."
      : prompt || "Crie um Codex artístico e mecânico em HTML.";
  } else if (mode === "fusion") {
    systemInstruction = SYSTEM_INSTRUCTION_FUSION;
    finalPrompt = fileBase64
      ? "Crie uma 'Máquina Digital' baseada nesta imagem. Misture estética renascentista com UI moderna. Faça funcionar."
      : prompt || "Crie um artefato cyber-renascentista interativo.";
  } else {
    systemInstruction = SYSTEM_INSTRUCTION_APP;
    finalPrompt = fileBase64
      ? "Você é o Leonardo da Vinci dos anos 90. Analise a imagem e crie um Web App completo em HTML/JS para resolver um problema útil."
      : prompt || "Invente um software revolucionário agora.";
  }

  // Monta parts (texto + opcional inlineData)
  const parts: any[] = [{ text: finalPrompt }];

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType,
      },
    });
  }

  // Chamada direta via fetch (sem SDK / sem AI Studio)
  const url = `${GEMINI_API_BASE}/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  // OBS: systemInstruction no v1beta aceita formato com parts
  const payload = {
    contents: [{ parts }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: 0.7 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await safeReadText(res);
    throw new Error(`Erro na API ${res.status}: ${text || res.statusText}`);
  }

  const result = await res.json();

  let out =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "<!-- Falha ao gerar conteúdo -->";

  // Cleanup de fences
  out = out.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");

  return out;
}

// ======================================================
// HELPERS
// ======================================================

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
