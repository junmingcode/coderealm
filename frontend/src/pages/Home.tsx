import { useEffect, useState } from 'react';
import { articleApi } from '../api/article';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import type { Article, PaginatedResponse } from '../types';

function Home() {
  useDocumentTitle('首页');
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await articleApi.getList({ page, page_size: 10 });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          最新文章
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>分享技术、思考与生活</p>
      </div>

      {data?.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
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
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Home;
