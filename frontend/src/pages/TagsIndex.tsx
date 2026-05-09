import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tagApi } from '../api/tag';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import type { Tag } from '../types';

function TagsIndex() {
  useDocumentTitle('全部标签');
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tagApi.getList().then((res) => {
      setTags(res.data.filter((t) => t.article_count > 0).sort((a, b) => b.article_count - a.article_count));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '2rem' }}>
        全部标签
        <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-secondary)', marginLeft: '0.75rem' }}>
          共 {tags.length} 个标签
        </span>
      </h1>
      {tags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/tag/${tag.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                textDecoration: 'none',
                fontSize: '0.9375rem',
                color: 'var(--color-text)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              #{tag.name}
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{tag.article_count}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>暂无标签</div>
      )}
    </div>
  );
}

export default TagsIndex;
