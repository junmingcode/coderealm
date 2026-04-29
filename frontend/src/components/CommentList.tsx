import { useState } from 'react';
import { api } from '../api';
import type { Comment } from '../types';

interface CommentListProps {
  articleId: number;
  comments: Comment[];
  onCommentAdded: () => void;
}

function CommentList({ articleId, comments, onCommentAdded }: CommentListProps) {
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/articles/${articleId}/comments`, {
        author_name: authorName,
        author_email: authorEmail,
        content,
        parent_id: replyTo,
      });
      setContent('');
      setReplyTo(null);
      onCommentAdded();
    } catch (err) {
      alert('评论提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      style={{
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        marginBottom: '1rem',
        marginLeft: isReply ? '2rem' : 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{comment.author_name}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {new Date(comment.created_at).toLocaleString('zh-CN')}
        </span>
      </div>
      <p style={{ color: 'var(--color-text)', marginBottom: '0.75rem' }}>{comment.content}</p>
      {!isReply && (
        <button
          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {replyTo === comment.id ? '取消回复' : '回复'}
        </button>
      )}
      {replyTo === comment.id && (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的回复..."
            required
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              resize: 'vertical',
              marginBottom: '0.5rem',
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? '提交中...' : '提交回复'}
          </button>
        </form>
      )}
      {comment.replies?.map((reply) => renderComment(reply, true))}
    </div>
  );

  return (
    <div style={{ marginTop: '3rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
        评论 ({comments.length})
      </h3>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="昵称 *"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
            }}
          />
          <input
            type="email"
            placeholder="邮箱 *"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            required
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <textarea
          placeholder="写下你的评论..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            resize: 'vertical',
            marginBottom: '1rem',
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            fontWeight: 500,
          }}
        >
          {submitting ? '提交中...' : '发表评论'}
        </button>
      </form>

      {comments.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
          暂无评论，来发表第一条评论吧！
        </p>
      ) : (
        comments.map((comment) => renderComment(comment))
      )}
    </div>
  );
}

export default CommentList;
