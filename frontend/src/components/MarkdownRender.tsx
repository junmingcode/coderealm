import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import { useMemo } from 'react';

interface MarkdownRenderProps {
  content: string;
}

function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  return /^<(p|div|span|h[1-6]|pre|code|ul|ol|li|table|tr|td|th|img|a|br|blockquote|section|article)/i.test(trimmed);
}

function extractHeadingsFromContent(content: string): string[] {
  const ids: string[] = [];
  if (isHtmlContent(content)) {
    const matches = content.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi);
    if (matches) {
      for (const match of matches) {
        if (/^<h[1-3]/i.test(match)) {
          ids.push(`heading-${ids.length}`);
        }
      }
    }
  } else {
    const lines = content.split('\n');
    for (const line of lines) {
      if (/^#{1,3}\s+/.test(line)) {
        ids.push(`heading-${ids.length}`);
      }
    }
  }
  return ids;
}

function MarkdownRender({ content }: MarkdownRenderProps) {
  const headingIds = useMemo(() => extractHeadingsFromContent(content), [content]);
  const isHtml = useMemo(() => isHtmlContent(content), [content]);

  let headingIndex = 0;

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={isHtml ? [] : [remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }}
              loading="lazy"
            />
          ),
          h1: ({ children }) => {
            const id = headingIds[headingIndex++];
            return (
              <h1 id={id}>
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = headingIds[headingIndex++];
            return (
              <h2 id={id}>
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = headingIds[headingIndex++];
            return (
              <h3 id={id}>
                {children}
              </h3>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRender;
