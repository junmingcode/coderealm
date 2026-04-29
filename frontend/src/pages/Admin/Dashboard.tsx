import { useEffect, useState } from 'react';
import { api } from '../../api';
import type { StatsOverview } from '../../types';

function Dashboard() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/overview');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: '总文章', value: stats?.total_articles || 0, color: 'var(--color-primary)' },
    { label: '已发布', value: stats?.published_articles || 0, color: 'var(--color-accent)' },
    { label: '草稿', value: stats?.draft_articles || 0, color: 'var(--color-warning)' },
    { label: '总评论', value: stats?.total_comments || 0, color: 'var(--color-primary)' },
    { label: '总点赞', value: stats?.total_likes || 0, color: 'var(--color-danger)' },
    { label: '总访问', value: stats?.total_views || 0, color: 'var(--color-accent)' },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
        加载中...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--color-text)' }}>
        仪表盘
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: card.color,
                marginBottom: '0.5rem',
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
