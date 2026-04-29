import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleApi } from '../api/article';
import { api } from '../api';
import MarkdownRender from '../components/MarkdownRender';
import CommentList from '../components/CommentList';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import type { Article, Comment } from '../types';

function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useDocumentTitle(article?.title || '文章详情');

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await articleApi.getBySlug(slug);
        setArticle(res.data);
        fetchComments(res.data.id);
      } catch (err) {
        console.error('Failed to fetch article:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const fetchComments = async (articleId: number) => {
    try {
      const res = await api.get(`/articles/${articleId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleLike = async () => {
    if (!article || liked) return;
    try {
      await api.post(`/articles/${article.id}/like`);
      setLiked(true);
      setArticle({ ...article, like_count: article.like_count + 1 });
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        加载中...
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>文章未找到</h2>
        <Link to="/" style={{ color: 'var(--color-primary)' }}>返回首页</Link>
      </div>
    );
  }

  return (
    <article style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      {article.cover_image && (
        <div style={{ marginBottom: '2rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <img src={article.cover_image} alt={article.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
        </div>
      )}

      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text)', lineHeight: 1.3 }}>
        {article.title}
      </h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
        {article.category && (
          <Link to={`/category/${article.category.slug}`} style={{ color: 'var(--color-primary)' }}>
            {article.category.name}
          </Link>
        )}
        <span>👁 {article.view_count}</span>
        <span>💬 {article.comment_count}</span>
        <button
          onClick={handleLike}
          style={{
            background: 'none',
            border: 'none',
            cursor: liked ? 'default' : 'pointer',
            color: liked ? 'var(--color-danger)' : 'var(--color-text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          {liked ? '❤️' : '🤍'} {article.like_count}
        </button>
      </div>

      {article.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/tag/${tag.slug}`}
              style={{
                fontSize: '0.85rem',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '3rem' }}>
        <MarkdownRender content={article.content} />
      </div>

      <CommentList
        articleId={article.id}
        comments={comments}
        onCommentAdded={() => fetchComments(article.id)}
      />
    </article>
  );
}

export default ArticleDetail;
