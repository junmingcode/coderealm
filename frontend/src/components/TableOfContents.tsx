import { useEffect, useState, useRef } from 'react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2]
        .replace(/[#*_`~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
      const id = `heading-${headings.length}`;
      headings.push({ level, text, id });
    }
  }
  return headings;
}

function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [content, headings]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 'calc(var(--header-height) + 2rem)',
        maxHeight: 'calc(100vh - var(--header-height) - 4rem)',
        overflowY: 'auto',
        paddingRight: '0.5rem',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-muted)',
          marginBottom: '0.75rem',
          paddingLeft: '0.75rem',
        }}
      >
        目录
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => handleClick(heading.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.4rem 0.75rem',
                paddingLeft: `${0.75 + (heading.level - 1) * 0.75}rem`,
                fontSize: heading.level === 1 ? '0.875rem' : '0.8125rem',
                fontWeight: activeId === heading.id ? 600 : 400,
                color:
                  activeId === heading.id
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                backgroundColor:
                  activeId === heading.id
                    ? 'var(--color-primary-subtle)'
                    : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                lineHeight: 1.5,
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              onMouseEnter={(e) => {
                if (activeId !== heading.id) {
                  e.currentTarget.style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeId !== heading.id) {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
