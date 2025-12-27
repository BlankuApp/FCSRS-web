'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import markdownItBidi from 'markdown-it-bidi';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Create markdown-it instance with bidi support
const md = new MarkdownIt({
  html: false,
  breaks: true,        // Convert single newlines to <br>
  linkify: true,       // Auto-convert URLs to links
  typographer: true,   // Enable smart quotes and other typographic replacements
}).use(markdownItBidi);

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Memoize the rendered HTML to avoid unnecessary re-renders
  const renderedHtml = useMemo(() => {
    return md.render(content);
  }, [content]);

  return (
    <div 
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
