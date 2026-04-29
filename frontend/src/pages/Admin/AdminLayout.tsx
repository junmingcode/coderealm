import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import ThemeToggle from '../../components/ThemeToggle';

function AdminLayout() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const navItems = [
    { path: '/admin', label: '仪表盘' },
    { path: '/admin/articles', label: '文章管理' },
  ];

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: '240px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
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
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'block',
                padding: '0.875rem 1.5rem',
                color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                backgroundColor: location.pathname === item.path ? 'var(--color-bg)' : 'transparent',
                fontWeight: location.pathname === item.path ? 600 : 400,
                borderLeft: location.pathname === item.path ? '3px solid var(--color-primary)' : '3px solid transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => {
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
        style={{
          marginLeft: '240px',
          flex: 1,
          padding: '2rem',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
