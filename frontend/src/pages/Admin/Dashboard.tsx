import { useEffect, useState } from 'react';
import { statsApi } from '../../api/stats';
import { SkeletonDashboard } from '../../components/Skeleton';
import type { StatsOverview } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailyView { date: string; count: number; }
interface TopArticle { id: number; title: string; slug: string; views: number; }

function Dashboard() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, dailyRes, topRes] = await Promise.all([
          statsApi.getOverview(),
          statsApi.getDailyViews(30),
          statsApi.getTopArticles(30, 5),
        ]);
        setStats(statsRes.data);
        setDailyViews(dailyRes.data);
        setTopArticles(topRes.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    return <SkeletonDashboard />;
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
          marginBottom: '2rem',
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

      <div className="dashboard-charts" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Daily Views Chart */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
            近 30 天访问趋势
          </h2>
          {dailyViews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              暂无访问数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyViews}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                  labelFormatter={(v) => `日期: ${v}`}
                  formatter={(value) => [`${value} 次`, '访问量']}
                />
                <Area type="monotone" dataKey="count" stroke="var(--color-primary)" fill="url(#colorViews)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Articles */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
            热门文章 TOP 5
          </h2>
          {topArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              暂无数据
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topArticles.map((article, index) => (
                <a
                  key={article.id}
                  href={`/article/${article.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: index === 0 ? 'var(--color-primary-subtle)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'background-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { if (index !== 0) e.currentTarget.style.backgroundColor = 'var(--color-bg)'; }}
                  onMouseLeave={(e) => { if (index !== 0) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? 'var(--color-primary)' : 'var(--color-border)',
                      color: index === 0 ? '#fff' : 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.title}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                    {article.views} 次
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-charts {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
