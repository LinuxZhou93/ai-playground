/**
 * Prompt Loader - Loads prompts from precompiled TS data
 *
 * Supports:
 * - Loading prompts from templatesData.ts
 * - Snippet inclusion via {{snippet:name}} syntax
 * - Variable interpolation via {{variable}} syntax
 * - Caching for performance
 */

import type { PromptId, LoadedPrompt, SnippetId } from './types';
import { PROMPT_DATA } from './templatesData';
import { createLogger } from '@/lib/logger';
const log = createLogger('PromptLoader');

// Cache for loaded prompts and snippets
const promptCache = new Map<string, LoadedPrompt>();
const snippetCache = new Map<string, string>();

/**
 * Load a snippet by ID
 */
export function loadSnippet(snippetId: SnippetId): string {
  const cached = snippetCache.get(snippetId);
  if (cached) return cached;

  const content = PROMPT_DATA.snippets[snippetId as keyof typeof PROMPT_DATA.snippets];
  if (content === undefined) {
    log.warn(`Snippet not found: ${snippetId}`);
    return `{{snippet:${snippetId}}}`;
  }

  snippetCache.set(snippetId, content as string);
  return content as string;
}

/**
 * Process snippet includes in a template
 * Replaces {{snippet:name}} with actual snippet content
 */
function processSnippets(template: string): string {
  return template.replace(/\{\{snippet:(\w[\w-]*)\}\}/g, (_, snippetId) => {
    return loadSnippet(snippetId as SnippetId);
  });
}

/**
 * Load a prompt by ID
 */
export function loadPrompt(promptId: PromptId): LoadedPrompt | null {
  const cached = promptCache.get(promptId);
  if (cached) return cached;

  const templateData = PROMPT_DATA.templates[promptId as keyof typeof PROMPT_DATA.templates];

  if (!templateData || !templateData.system) {
    log.error(`Failed to load prompt ${promptId}: not found in templatesData`);
    return null;
  }

  try {
    let systemPrompt = templateData.system;
    systemPrompt = processSnippets(systemPrompt);

    let userPromptTemplate = templateData.user || '';
    if (userPromptTemplate) {
      userPromptTemplate = processSnippets(userPromptTemplate);
    }

    const loaded: LoadedPrompt = {
      id: promptId,
      systemPrompt,
      userPromptTemplate,
    };

    promptCache.set(promptId, loaded);
    return loaded;
  } catch (error) {
    log.error(`Failed to load prompt ${promptId}:`, error);
    return null;
  }
}

/**
 * Interpolate variables in a template
 * Replaces {{variable}} with values from the variables object
 */
export function interpolateVariables(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    if (value === undefined) return match;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  });
}

/**
 * Build a complete prompt with variables
 */
export function buildPrompt(
  promptId: PromptId,
  variables: Record<string, unknown>,
): { system: string; user: string } | null {
  const prompt = loadPrompt(promptId);
  if (!prompt) return null;

  return {
    system: interpolateVariables(prompt.systemPrompt, variables),
    user: interpolateVariables(prompt.userPromptTemplate, variables),
  };
}

/**
 * Clear all caches (useful for development/testing)
 */
export function clearPromptCache(): void {
  promptCache.clear();
  snippetCache.clear();
}
