import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleApi } from '../api/article';
import { api } from '../api';
import MarkdownRender from '../components/MarkdownRender';
import CommentList from '../components/CommentList';
import TableOfContents from '../components/TableOfContents';
import { SkeletonArticle } from '../components/Skeleton';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import { useMetaDescription } from '../utils/useMetaDescription';
import type { Article, Comment } from '../types';

function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [neighbors, setNeighbors] = useState<{ previous: { slug: string; title: string } | null; next: { slug: string; title: string } | null }>({ previous: null, next: null });

  useDocumentTitle(article?.title || '文章详情');
  useMetaDescription(
    article?.summary || article?.content?.slice(0, 200).replace(/[#*`\n]/g, '') || ''
  );

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const [articleRes, neighborsRes] = await Promise.all([
          articleApi.getBySlug(slug),
          api.get(`/articles/${slug}/neighbors`),
        ]);
        setArticle(articleRes.data);
        setNeighbors(neighborsRes.data);
        fetchComments(articleRes.data.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    } catch {
      alert('复制失败');
    }
  };

  if (loading) {
    return <SkeletonArticle />;
  }

  if (!article) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <h2 style={{ color: 'var(--color-text)', marginBottom: '1rem', fontSize: '1.5rem' }}>文章未找到</h2>
        <Link to="/" style={{ color: 'var(--color-primary)', fontSize: '0.9375rem' }}>返回首页</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Article Header */}
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', marginBottom: '2.5rem' }}>
        {article.category && (
          <Link
            to={`/category/${article.category.slug}`}
            style={{
              display: 'inline-block',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--color-primary)',
              marginBottom: '1rem',
              padding: '0.25rem 0.75rem',
              backgroundColor: 'var(--color-primary-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {article.category.name}
          </Link>
        )}

        <h1
          style={{
            fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
            fontWeight: 700,
            marginBottom: '1.25rem',
            color: 'var(--color-text)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {article.title}
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span>{article.reading_time} 分钟阅读</span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {article.view_count}
          </span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {article.comment_count}
          </span>
        </div>
      </div>

      {/* Cover Image */}
      {article.cover_image && (
        <div
          style={{
            maxWidth: 'var(--content-max-width)',
            margin: '0 auto',
            marginBottom: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          <img
            src={article.cover_image}
            alt={article.title}
            style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Main Content + TOC Layout */}
      <div
        style={{
          display: 'flex',
          gap: '3rem',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Article Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '2rem' }}>
            <MarkdownRender content={article.content} />
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/tag/${tag.slug}`}
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.35rem 0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
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
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Actions Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              marginBottom: '2.5rem',
            }}
          >
            <button
              onClick={handleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: liked ? 'rgba(220, 38, 38, 0.1)' : 'var(--color-surface-hover)',
                color: liked ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                cursor: liked ? 'default' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all var(--transition-fast)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {liked ? '已点赞' : '点赞'} {article.like_count}
            </button>

            <button
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              分享
            </button>
          </div>

          {/* Author Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              marginBottom: '2.5rem',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                fontSize: '1.5rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              JM
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>JM</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                热爱技术的开发者，专注于 Web 开发领域。在这个博客中分享关于前端、后端、数据库以及各种技术工具的文章。
              </p>
            </div>
          </div>

          {/* Neighbor Navigation */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            <div>
              {neighbors.previous && (
                <Link
                  to={`/article/${neighbors.previous.slug}`}
                  style={{
                    display: 'block',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    上一篇
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem', lineHeight: 1.4 }}>{neighbors.previous.title}</div>
                </Link>
              )}
            </div>
            <div>
              {neighbors.next && (
                <Link
                  to={`/article/${neighbors.next.slug}`}
                  style={{
                    display: 'block',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'right',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                    下一篇
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem', lineHeight: 1.4 }}>{neighbors.next.title}</div>
                </Link>
              )}
            </div>
          </div>

          <CommentList
            articleId={article.id}
            comments={comments}
            onCommentAdded={() => fetchComments(article.id)}
          />
        </div>

        {/* TOC Sidebar - Hidden on mobile */}
        <div
          className="toc-sidebar"
          style={{
            width: '240px',
            flexShrink: 0,
          }}
        >
          <TableOfContents content={article.content} />
        </div>
      </div>

      {/* Mobile: hide TOC via CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .toc-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ArticleDetail;
