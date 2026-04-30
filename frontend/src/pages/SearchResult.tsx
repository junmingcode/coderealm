import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { articleApi } from '../api/article';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import { SkeletonList } from '../components/Skeleton';
import type { Article, PaginatedResponse } from '../types';

function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useDocumentTitle(query ? `搜索: ${query}` : '搜索');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await articleApi.search(query, { page, page_size: 10 });
        setData(res.data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, page]);

  if (loading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div style={{ width: '280px', height: '2rem', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--color-text)' }}>
        搜索结果: "{query}"
      </h1>

      {!query ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          请输入搜索关键词
        </div>
      ) : data?.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          未找到相关文章
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            共找到 {data?.total} 篇文章
          </p>
          <div className="card-stagger" style={{ display: 'grid', gap: '1.5rem' }}>
            {data?.items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {data && (
            <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

export default SearchResult;
