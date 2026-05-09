import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('复制失败，请手动复制链接: ' + shareUrl);
    }
  };

  const shareLinks = [
    {
      name: '微博',
      href: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.1 18.3c-3.9.4-7.2-1.4-7.5-3.9-.3-2.5 2.6-5 6.5-5.4 3.9-.4 7.2 1.4 7.5 3.9.3 2.6-2.6 5-6.5 5.4zM20.3 8.5c-.2-.7-.9-1.1-1.6-.9-.7.2-1.1.9-.9 1.6.5 1.6.1 3.3-1 4.5-1.1 1.2-2.8 1.7-4.4 1.4-.7-.1-1.4.3-1.6 1-.1.7.3 1.4 1 1.6 2.5.5 5.1-.3 6.8-2.2 1.7-1.9 2.3-4.5 1.7-6.7v-.3zM22 6.1c-.9-2.2-3-3.7-5.4-4-.8-.1-1.4.5-1.5 1.2-.1.8.5 1.4 1.2 1.5 1.5.2 2.8 1.2 3.4 2.6.6 1.4.5 3-.3 4.3-.4.7-.2 1.5.5 1.9.7.4 1.5.2 1.9-.5 1.2-1.9 1.3-4.3.4-6.5l-.2-.5z"/>
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="share-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`分享到${link.name}`}
          className="share-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            transition: 'all var(--transition-fast)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary)';
            e.currentTarget.style.borderColor = 'var(--color-primary-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          {link.icon}
        </a>
      ))}
      <button
        onClick={handleCopy}
        title="复制链接"
        className="share-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: copied ? 'var(--color-primary-subtle)' : 'var(--color-surface-hover)',
          color: copied ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        {copied ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
      <style>{`
        .share-buttons .share-btn:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default ShareButtons;
