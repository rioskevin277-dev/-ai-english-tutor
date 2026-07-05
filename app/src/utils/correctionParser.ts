// ──────────────────────────────────────────────────
// correctionParser.ts
// Parsea la respuesta markdown estructurada de la AI
// y extrae una estructura Correction para renderizar
// las correcciones de forma nativa en la UI.
// ──────────────────────────────────────────────────

import type { Correction, CorrectionError } from '../models/types';

export interface ParsedResponse {
  /** Texto restante después de extraer las secciones de corrección */
  text: string;
  /** Estructura de corrección parseada, o undefined si falló el parseo */
  correction?: Correction;
}

// ──────────────────────────────────────────────────
// Expresiones regulares para cada sección
// ──────────────────────────────────────────────────

// Secciones con emoji + **bold** header, separadas por saltos de línea
// Busca hasta el próximo header conocido o fin del string
const SECTION_CORRECTED = /✅\s*\*\*Corrected Version\*\*:\s*([\s\S]*?)(?=\n\s*(?:📖|💡|🎉)|$)/i;
const SECTION_ERRORS = /📖\s*\*\*What You Got Wrong\*\*:\s*([\s\S]*?)(?=\n\s*(?:💡|🎉)|$)/i;
const SECTION_ALTERNATIVES = /💡\s*\*\*Alternatives\*\*:\s*([\s\S]*?)(?=\n\s*🎉|$)/i;
const SECTION_KEEP_GOING = /🎉\s*\*\*Keep Going!\*\*:\s*([\s\S]*)$/i;

// ──────────────────────────────────────────────────
// Detección de tipo de error por palabras clave
// ──────────────────────────────────────────────────

function detectErrorType(text: string): CorrectionError['type'] {
  const lower = text.toLowerCase();

  if (
    /\b(?:grammar|verb\s*tense|plural|subject.verb|article|preposition|conjugation|concordancia|irregular|past\s*tense|present\s*tense|future\s*tense|conditional|gerund|infinitive|auxiliar)\b/.test(
      lower,
    )
  ) {
    return 'grammar';
  }

  if (
    /\b(?:spelling|misspell|typo|spell|ortograf|escritura|capitalization|mayúscula)\b/.test(
      lower,
    )
  ) {
    return 'spelling';
  }

  if (
    /\b(?:vocabulary|word\s*choice|meaning|synonym|antonym|more\s*natural|better\s*word|phrasal\s*verb|collocation|idiom|expresion|vocabulario|significado)\b/.test(
      lower,
    )
  ) {
    return 'vocabulary';
  }

  if (
    /\b(?:style|formal|informal|register|polite|rude|formality|tono|formalidad)\b/.test(
      lower,
    )
  ) {
    return 'style';
  }

  // Fallback: si menciona "error" sin especificar → grammar
  return 'grammar';
}

// ──────────────────────────────────────────────────
// Parseo de ítems con bullet points ( * o - )
// ──────────────────────────────────────────────────

function parseBulletItems(sectionText: string): string[] {
  const items: string[] = [];
  const bulletRegex = /^[-*]\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = bulletRegex.exec(sectionText)) !== null) {
    const item = match[1].trim();
    if (item) {
      items.push(item);
    }
  }

  return items;
}

// ──────────────────────────────────────────────────
// Parser principal
// ──────────────────────────────────────────────────

export function parseCorrection(fullText: string): ParsedResponse {
  // 1. Intentar extraer la sección "Corrected Version"
  //    Si no aparece, es que la AI no siguió el formato → fallback seguro
  const correctedMatch = fullText.match(SECTION_CORRECTED);

  if (!correctedMatch) {
    return { text: fullText };
  }

  const corrected = correctedMatch[1].trim();

  // 2. Extraer errores de "What You Got Wrong"
  const errorsMatch = fullText.match(SECTION_ERRORS);
  const errors: CorrectionError[] = [];

  if (errorsMatch) {
    const errorsSection = errorsMatch[1].trim();
    const bulletItems = parseBulletItems(errorsSection);

    for (const item of bulletItems) {
      // Limpiar formato bold ** ** que pueda tener
      const cleanItem = item.replace(/\*\*/g, '').trim();
      errors.push({
        type: detectErrorType(cleanItem),
        explanation: cleanItem,
        alternatives: [],
      });
    }

    // Si no hay bullets, tomar el texto completo como un único error
    if (errors.length === 0 && errorsSection.length > 0) {
      errors.push({
        type: detectErrorType(errorsSection),
        explanation: errorsSection.replace(/\*\*/g, '').trim(),
        alternatives: [],
      });
    }
  }

  // 3. Extraer alternativas de "Alternatives"
  const altMatch = fullText.match(SECTION_ALTERNATIVES);
  const allAlternatives: string[] = [];

  if (altMatch) {
    const altSection = altMatch[1].trim();
    const bulletItems = parseBulletItems(altSection);

    for (const item of bulletItems) {
      const clean = item.replace(/\*\*/g, '').trim();
      if (clean) {
        allAlternatives.push(clean);
      }
    }

    // Si no hay bullets, intentar líneas numéricas o separadas por saltos
    if (allAlternatives.length === 0) {
      const lines = altSection
        .split('\n')
        .map((l) => l.trim().replace(/^[\d]+[.)]\s*/, '').replace(/\*\*/g, '').trim())
        .filter((l) => l.length > 0);
      allAlternatives.push(...lines);
    }
  }

  // Distribuir alternativas: asignarlas al último error (es el más abarcativo)
  // Si solo hay un error, se le asignan todas
  // Si hay múltiples, se agregan al último como resumen
  if (allAlternatives.length > 0 && errors.length > 0) {
    errors[errors.length - 1].alternatives = allAlternatives;
  }

  // 4. Construir el texto restante:
  //    Remover las secciones ✅, 📖, 💡 pero mantener 🎉 y cualquier otro texto
  let remainingText = fullText
    .replace(SECTION_CORRECTED, '')
    .replace(SECTION_ERRORS, '')
    .replace(SECTION_ALTERNATIVES, '')
    .trim();

  // Si después de limpiar solo queda la sección 🎉 o está vacía,
  // al menos devolvemos algo significativo
  if (!remainingText) {
    // Si hay Keep Going, usarlo como texto
    const keepGoingMatch = fullText.match(SECTION_KEEP_GOING);
    remainingText = keepGoingMatch
      ? `🎉 **Keep Going!**: ${keepGoingMatch[1].trim()}`
      : fullText;
  }

  return {
    text: remainingText,
    correction: {
      corrected,
      errors,
    },
  };
}
