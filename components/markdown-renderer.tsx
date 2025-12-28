'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// RTL Unicode ranges:
// - Arabic: \u0600-\u06FF
// - Arabic Supplement: \u0750-\u077F
// - Arabic Extended-A: \u08A0-\u08FF
// - Hebrew: \u0590-\u05FF
// - Syriac: \u0700-\u074F
// - Thaana: \u0780-\u07BF
// - N'Ko: \u07C0-\u07FF
const RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u08A0-\u08FF]/g;
const LTR_REGEX = /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/g;

// Block-level elements that should have direction applied
const BLOCK_ELEMENTS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'TH', 'TD', 'DT', 'DD'];

/**
 * Detects text direction based on RTL vs LTR character count.
 * Returns 'rtl' if RTL characters outnumber LTR characters, otherwise 'ltr'.
 */
function detectDirection(text: string): 'rtl' | 'ltr' {
  const rtlChars = text.match(RTL_REGEX);
  const ltrChars = text.match(LTR_REGEX);
  
  const rtlCount = rtlChars ? rtlChars.length : 0;
  const ltrCount = ltrChars ? ltrChars.length : 0;
  
  return rtlCount > ltrCount ? 'rtl' : 'ltr';
}

/**
 * Applies direction attribute to each block-level element in the HTML.
 */
function applyDirectionToElements(html: string): string {
  if (typeof window === 'undefined') {
    // SSR fallback: return html as-is (direction will be applied on client hydration)
    return html;
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstChild as HTMLElement;
  
  // Apply direction to each block-level element based on its text content
  const applyDir = (element: Element) => {
    if (BLOCK_ELEMENTS.includes(element.tagName)) {
      const textContent = element.textContent || '';
      const dir = detectDirection(textContent);
      element.setAttribute('dir', dir);
    }
    
    // Recursively process child elements
    Array.from(element.children).forEach(applyDir);
  };
  
  Array.from(container.children).forEach(applyDir);
  
  return container.innerHTML;
}

// Create markdown-it instance
const md = new MarkdownIt({
  html: false,
  breaks: true,        // Convert single newlines to <br>
  linkify: true,       // Auto-convert URLs to links
  typographer: true,   // Enable smart quotes and other typographic replacements
});

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Memoize the rendered HTML with direction applied to each element
  const renderedHtml = useMemo(() => {
    const html = md.render(content);
    return applyDirectionToElements(html);
  }, [content]);

  return (
    <div 
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
