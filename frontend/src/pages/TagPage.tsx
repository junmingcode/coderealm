import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { articleApi } from '../api/article';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import type { Article, PaginatedResponse } from '../types';

function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useDocumentTitle(slug ? `标签: ${slug}` : '标签');

  useEffect(() => {
    const fetchArticles = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await articleApi.getList({ page, page_size: 10, tag: slug });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [slug, page]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--color-text)' }}>
        标签: #{slug}
      </h1>

      {data?.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          该标签下暂无文章
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
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

export default TagPage;
