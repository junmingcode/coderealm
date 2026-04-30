import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleApi } from '../../api/article';
import { SkeletonTable } from '../../components/Skeleton';
import type { Article, PaginatedResponse } from '../../types';

function ArticleList() {
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await articleApi.getList({ page, page_size: 15 });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      await articleApi.delete(id);
      setData((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((a) => a.id !== id), total: prev.total - 1 }
          : null
      );
    } catch (err) {
      alert('删除失败');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
          文章管理
        </h1>
        <Link
          to="/admin/articles/new"
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 500,
          }}
        >
          + 新建文章
        </Link>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : (
        <>
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              backgroundColor: 'var(--color-surface)',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>标题</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>状态</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>分类</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>浏览</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>日期</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((article) => (
                  <tr key={article.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      <Link
                        to={`/article/${article.slug}`}
                        target="_blank"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          backgroundColor: article.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: article.status === 'published' ? 'var(--color-accent)' : 'var(--color-warning)',
                        }}
                      >
                        {article.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                      {article.category?.name || '-'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                      {article.view_count}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(article.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link
                        to={`/admin/articles/${article.id}/edit`}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-primary)',
                          color: '#fff',
                          fontSize: '0.8rem',
                          marginRight: '0.5rem',
                        }}
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-danger)',
                          color: '#fff',
                          fontSize: '0.8rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.total_pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: page === p ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: page === p ? '#fff' : 'var(--color-text)',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ArticleList;
