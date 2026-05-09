import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { seriesApi, type SeriesItem } from '../api/series';
import { useDocumentTitle } from '../utils/useDocumentTitle';

function SeriesIndex() {
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentTitle('系列专栏');

  useEffect(() => {
    seriesApi.getList().then((res) => {
      setSeriesList(res.data);
    }).catch(() => setError('加载系列列表失败')).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-danger)' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
        系列专栏
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2.5rem', fontSize: '0.9375rem' }}>
        系统化的技术文章合集，帮助你深入理解某个主题
      </p>

      {seriesList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
          暂无系列专栏
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {seriesList.map((s) => (
            <Link
              key={s.id}
              to={`/series/${s.slug}`}
              style={{
                display: 'block',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {s.cover_image && (
                <img
                  src={s.cover_image}
                  alt={s.name}
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                  }}
                />
              )}
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                {s.name}
              </h2>
              {s.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                  {s.description}
                </p>
              )}
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                {s.article_count} 篇文章
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SeriesIndex;
