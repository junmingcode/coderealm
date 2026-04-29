import { Link } from 'react-router-dom';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        transition: 'transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <Link to={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {article.cover_image && (
          <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <img
              src={article.cover_image}
              alt={article.title}
              style={{
                width: '100%',
                height: '220px',
                objectFit: 'cover',
                transition: 'transform var(--transition-slow)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
              }}
            />
          </div>
        )}
        <div style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              flexWrap: 'wrap',
            }}
          >
            <span>{formatDate(article.created_at)}</span>
            {article.category && (
              <>
                <span style={{ color: 'var(--color-border)' }}>|</span>
                <span style={{ color: 'var(--color-primary)' }}>{article.category.name}</span>
              </>
            )}
            <span style={{ color: 'var(--color-border)' }}>|</span>
            <span>{article.reading_time} 分钟阅读</span>
          </div>

          <h2
            style={{
              fontSize: '1.375rem',
              fontWeight: 600,
              marginBottom: '0.625rem',
              color: 'var(--color-text)',
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
          >
            {article.title}
          </h2>

          {article.summary && (
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                marginBottom: '1rem',
                lineHeight: 1.65,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {article.summary}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {article.view_count}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {article.like_count}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              {article.comment_count}
            </span>
          </div>

          {article.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.625rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface-hover)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

export default ArticleCard;
