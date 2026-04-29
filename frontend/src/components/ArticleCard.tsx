import { Link } from 'react-router-dom';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Link to={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {article.cover_image && (
          <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img
              src={article.cover_image}
              alt={article.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          </div>
        )}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          {article.title}
        </h2>
        {article.summary && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.6 }}>
            {article.summary}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
          {article.category && (
            <span style={{ padding: '0.15rem 0.5rem', backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-sm)' }}>
              {article.category.name}
            </span>
          )}
          <span>👁 {article.view_count}</span>
          <span>❤️ {article.like_count}</span>
          <span>💬 {article.comment_count}</span>
        </div>
        {article.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}

export default ArticleCard;
