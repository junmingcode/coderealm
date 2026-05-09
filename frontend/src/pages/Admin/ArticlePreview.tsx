import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleApi } from '../../api/article';
import MarkdownRender from '../../components/MarkdownRender';
import type { Article } from '../../types';

function ArticlePreview() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const res = await articleApi.getById(parseInt(id));
        setArticle(res.data);
      } catch (err) {
        console.error('Failed to fetch article:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>加载中...</div>;
  }

  if (!article) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>文章未找到</p>
        <Link to="/admin/articles" style={{ color: 'var(--color-primary)' }}>返回文章列表</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid var(--color-warning)',
        color: 'var(--color-warning)',
        fontSize: '0.875rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>草稿预览 — 此文章尚未发布</span>
        <Link
          to={`/admin/articles/${id}/edit`}
          style={{ color: 'var(--color-primary)', fontWeight: 500 }}
        >
          返回编辑
        </Link>
      </div>

      <article style={{ maxWidth: '720px', margin: '0 auto' }}>
        {article.category && (
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            color: 'var(--color-primary)',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
          }}>
            {article.category.name}
          </span>
        )}
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
          {article.title}
        </h1>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
          <span>{article.reading_time} 分钟阅读</span>
        </div>
        {article.cover_image && (
          <img
            src={article.cover_image}
            alt={article.title}
            style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}
          />
        )}
        <MarkdownRender content={article.content} />
        {article.tags && article.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            {article.tags.map((tag) => (
              <span key={tag.id} style={{
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.8rem',
              }}>
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

export default ArticlePreview;
