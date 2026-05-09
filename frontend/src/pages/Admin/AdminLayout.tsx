import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/auth';
import ThemeToggle from '../../components/ThemeToggle';

function AdminLayout() {
  const { isAuthenticated, initialized, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [initialized, isAuthenticated, navigate]);

  const navItems = [
    { path: '/admin', label: '仪表盘' },
    { path: '/admin/articles', label: '文章管理' },
    { path: '/admin/categories', label: '分类管理' },
    { path: '/admin/tags', label: '标签管理' },
    { path: '/admin/comments', label: '评论管理' },
    { path: '/admin/series', label: '系列管理' },
    { path: '/admin/users', label: '用户管理' },
    { path: '/admin/settings', label: '站点设置' },
  ];

  if (!initialized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 199,
            display: 'none',
          }}
        />
      )}

      <aside
        className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{
          width: '240px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 200,
          transition: 'transform 0.3s ease',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/"
            style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}
          >
            码境
          </Link>
          <ThemeToggle />
        </div>

        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.875rem 1.5rem',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-bg)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={async () => {
              try { await authApi.logout(); } catch (_) { /* ignore */ }
              logout();
              navigate('/admin/login');
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            退出登录
          </button>
        </div>
      </aside>

      <main
        className="admin-main"
        style={{
          marginLeft: '240px',
          flex: 1,
          padding: '2rem',
          backgroundColor: 'var(--color-bg)',
          minWidth: 0,
        }}
      >
        {/* Mobile header */}
        <div
          className="admin-mobile-header"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="打开导航菜单"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>管理后台</span>
        </div>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0 !important;
            padding: 1rem !important;
          }
          .admin-mobile-header {
            display: flex !important;
          }
          .admin-overlay {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;
