import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi } from '../api/category';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import type { Category } from '../types';

function CategoriesIndex() {
  useDocumentTitle('全部分类');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getList().then((res) => {
      setCategories(res.data.filter((c) => c.article_count > 0).sort((a, b) => b.article_count - a.article_count));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '2rem' }}>
        全部分类
        <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-secondary)', marginLeft: '0.75rem' }}>
          共 {categories.length} 个分类
        </span>
      </h1>
      {categories.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              style={{
                display: 'block',
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text)' }}>{cat.name}</h3>
                <span style={{ padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 500 }}>
                  {cat.article_count} 篇
                </span>
              </div>
              {cat.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{cat.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>暂无分类</div>
      )}
    </div>
  );
}

export default CategoriesIndex;
