import { useEffect, useState } from 'react';
import { commentApi } from '../../api/comment';

interface CommentItem {
  id: number;
  article_id: number;
  article_title: string;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  parent_id: number | null;
  created_at: string;
}

interface CommentPageData {
  items: CommentItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'spam', label: '垃圾' },
];

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-accent)', label: '已通过' },
  pending: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', label: '待审核' },
  spam: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', label: '垃圾' },
};

function CommentManage() {
  const [data, setData] = useState<CommentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await commentApi.getAdminList({ page, page_size: 20, status: statusFilter });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [page, statusFilter]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await commentApi.updateStatus(id, newStatus);
      setData((prev) => prev ? {
        ...prev,
        items: prev.items.map((c) => c.id === id ? { ...c, status: newStatus } : c),
      } : null);
    } catch (err: any) {
      alert(err.response?.data?.detail || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该评论吗？')) return;
    try {
      await commentApi.remove(id);
      setData((prev) => prev ? {
        ...prev,
        items: prev.items.filter((c) => c.id !== id),
        total: prev.total - 1,
      } : null);
    } catch (err: any) {
      alert(err.response?.data?.detail || '删除失败');
    }
  };

  const truncate = (text: string, max: number) => {
    const clean = text.replace(/<[^>]*>/g, '');
    return clean.length > max ? clean.slice(0, max) + '...' : clean;
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1.5rem' }}>评论管理</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: statusFilter === tab.key ? 'var(--color-primary)' : 'var(--color-surface)',
              color: statusFilter === tab.key ? '#fff' : 'var(--color-text)',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-text-secondary)' }}>加载中...</div>
      ) : data && data.items.length > 0 ? (
        <>
          <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>内容</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>评论者</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>文章</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>状态</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>日期</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((comment) => {
                  const sc = STATUS_COLORS[comment.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={comment.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text)', maxWidth: '300px' }}>{truncate(comment.content, 80)}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{comment.author_name}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comment.article_title}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 500, backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{new Date(comment.created_at).toLocaleDateString('zh-CN')}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {comment.status !== 'approved' && (
                          <button onClick={() => handleStatusChange(comment.id, 'approved')} style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.75rem', border: 'none', cursor: 'pointer', marginRight: '0.375rem' }}>通过</button>
                        )}
                        {comment.status !== 'spam' && (
                          <button onClick={() => handleStatusChange(comment.id, 'spam')} style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-warning)', color: '#fff', fontSize: '0.75rem', border: 'none', cursor: 'pointer', marginRight: '0.375rem' }}>垃圾</button>
                        )}
                        <button onClick={() => handleDelete(comment.id)} style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-danger)', color: '#fff', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>删除</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.total_pages > 1 && (
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
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>暂无评论</div>
      )}
    </div>
  );
}

export default CommentManage;
