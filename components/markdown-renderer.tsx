'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Helper function to detect text direction based on character analysis
function detectTextDirection(text: string): 'rtl' | 'ltr' {
  let rtlCount = 0;
  let ltrCount = 0;

  // Unicode ranges for RTL scripts (Arabic, Hebrew, etc.)
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

  for (const char of text) {
    if (rtlRegex.test(char)) {
      rtlCount++;
    } else if (/[a-zA-Z]/.test(char)) {
      ltrCount++;
    }
  }

  // Return 'rtl' if RTL characters are in the majority, otherwise 'ltr'
  return rtlCount > ltrCount ? 'rtl' : 'ltr';
}

// Helper function to extract text content from React children
function extractTextFromChildren(children: any): string {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (children?.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  return '';
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Custom component renderers with smart direction detection
  const components: Components = {
    // Block-level elements
    p: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <p dir={dir} {...props}>{children}</p>;
    },
    h1: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <h1 dir={dir} {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <h2 dir={dir} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <h3 dir={dir} {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <h4 dir={dir} {...props}>{children}</h4>;
    },
    h5: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <h5 dir={dir} {...props}>{children}</h5>;
    },
    h6: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <h6 dir={dir} {...props}>{children}</h6>;
    },
    li: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <li dir={dir} {...props}>{children}</li>;
    },
    blockquote: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <blockquote dir={dir} {...props}>{children}</blockquote>;
    },
    td: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <td dir={dir} {...props}>{children}</td>;
    },
    th: ({ children, ...props }) => {
      const text = extractTextFromChildren(children);
      const dir = detectTextDirection(text);
      return <th dir={dir} {...props}>{children}</th>;
    },
    // Code elements always LTR
    code: ({ children, ...props }) => {
      return <code dir="ltr" {...props}>{children}</code>;
    },
    pre: ({ children, ...props }) => {
      return <pre dir="ltr" {...props}>{children}</pre>;
    },
  };

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
