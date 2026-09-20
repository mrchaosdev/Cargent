import { Logger } from '../core/logger.js';
import { RegisteredTool, ToolResult } from './types.js';

export function createSearchTool(): RegisteredTool {
  return {
    definition: {
      name: 'web_search',
      description: 'Search the web. Returns search results and snippets.',
      parameters: {
        query: { type: 'string', description: 'Search query', required: true },
      },
    },
    execute: async (args) => {
      const logger = Logger.getInstance();
      try {
        const query = String(args.query);
        logger.info(`Web search: ${query}`);
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
        const html = await res.text();
        const results = extractSnippets(html).slice(0, 5);
        return { success: true, output: results.join('\n\n') };
      } catch (err) {
        return { success: false, output: '', error: String(err) };
      }
    },
  };
}

function extractSnippets(html: string): string[] {
  const snippets: string[] = [];
  const regex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>.*?<td[^>]*class="result__snippet"[^>]*>(.*?)<\/td>/gs;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const clean = match[3].replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    snippets.push(clean);
  }
  if (snippets.length === 0) {
    const linkRegex = /<a[^>]*href="(https?:\/\/[^"]*)"[^>]*>(.*?)<\/a>/gs;
    while ((match = linkRegex.exec(html)) !== null && snippets.length < 10) {
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      if (text.length > 10) snippets.push(text);
    }
  }
  return snippets;
}
