import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { seriesApi, type SeriesItem } from '../api/series';
import { useDocumentTitle } from '../utils/useDocumentTitle';

function SeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [series, setSeries] = useState<SeriesItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentTitle(series?.name || '系列专栏');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');
    seriesApi.getBySlug(slug)
      .then((res) => setSeries(res.data))
      .catch(() => setError('加载系列失败'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        加载中...
      </div>
    );
  }

  if (error || !series) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>{error || '系列未找到'}</h2>
        <Link to="/series" style={{ color: 'var(--color-primary)' }}>返回系列列表</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
      <Link
        to="/series"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
          fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        全部系列
      </Link>

      {series.cover_image && (
        <img
          src={series.cover_image}
          alt={series.name}
          style={{
            width: '100%',
            maxHeight: '300px',
            objectFit: 'cover',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
          }}
        />
      )}

      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        {series.name}
      </h1>
      {series.description && (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {series.description}
        </p>
      )}
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        共 {series.article_count} 篇文章
      </p>

      {!series.articles || series.articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
          该系列暂无文章
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {series.articles.map((article, index) => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {article.series_order ?? index + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  {article.title}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {article.published_at && (
                    <span>{new Date(article.published_at).toLocaleDateString('zh-CN')}</span>
                  )}
                  {article.reading_time && (
                    <span>{article.reading_time} 分钟阅读</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SeriesPage;
