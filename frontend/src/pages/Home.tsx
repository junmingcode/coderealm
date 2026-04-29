import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleApi } from '../api/article';
import { categoryApi } from '../api/category';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import type { Article, Category, PaginatedResponse } from '../types';

function Home() {
  useDocumentTitle('首页');
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          articleApi.getList({ page, page_size: 10 }),
          categoryApi.getList(),
        ]);
        setData(articlesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '4rem 0 3rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '1rem',
              color: 'var(--color-text)',
              letterSpacing: '-0.03em',
            }}
          >
            码境 CodeRealm
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            记录技术探索的足迹，分享编程与思考的点滴
          </p>

          {/* Category Quick Links */}
          {categories.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {categories
                .filter((cat) => cat.article_count > 0)
                .sort((a, b) => b.article_count - a.article_count)
                .slice(0, 8)
                .map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-subtle)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    {cat.name}
                    <span
                      style={{
                        marginLeft: '0.375rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {cat.article_count}
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Articles Section */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            最新文章
          </h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            共 {data?.total || 0} 篇
          </span>
        </div>

        {data?.items.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem',
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--color-border)',
            }}
          >
            暂无文章
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {data?.items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {data && (
              <div style={{ marginTop: '2.5rem' }}>
                <Pagination
                  page={data.page}
                  totalPages={data.total_pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
