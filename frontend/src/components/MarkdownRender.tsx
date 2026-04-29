import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import { useMemo } from 'react';

interface MarkdownRenderProps {
  content: string;
}

function MarkdownRender({ content }: MarkdownRenderProps) {
  const headingIds = useMemo(() => {
    const ids: string[] = [];
    const lines = content.split('\n');
    for (const line of lines) {
      if (/^#{1,3}\s+/.test(line)) {
        ids.push(`heading-${ids.length}`);
      }
    }
    return ids;
  }, [content]);

  let headingIndex = 0;

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
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
