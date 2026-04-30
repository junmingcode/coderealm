import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { articleApi } from '../api/article';
import { categoryApi } from '../api/category';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import { SkeletonList } from '../components/Skeleton';
import type { Article, PaginatedResponse, Category } from '../types';

function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const categoryNameRef = async () => {
      try {
        const res = await categoryApi.getList();
        const cat = res.data.find((c: Category) => c.slug === slug);
        setCategoryName(cat?.name || slug || '');
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    categoryNameRef();
  }, [slug]);

  useDocumentTitle(categoryName ? `分类: ${categoryName}` : '分类');

  useEffect(() => {
    const fetchArticles = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await articleApi.getList({ page, page_size: 10, category: slug });
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
      <div style={{ padding: '2rem 0' }}>
        <div style={{ width: '200px', height: '2rem', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--color-text)' }}>
        分类: {categoryName || slug}
      </h1>

      {data?.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          该分类下暂无文章
        </div>
      ) : (
        <>
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

export default CategoryPage;
