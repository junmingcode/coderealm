import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: '2rem 1.5rem',
        marginTop: '4rem',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} 码境 CodeRealm. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            首页
          </Link>
          <Link to="/about" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            关于
          </Link>
          <Link to="/categories" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            分类
          </Link>
          <Link to="/tags" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            标签
          </Link>
          <Link to="/series" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            系列
          </Link>
          <a
            href="/api/rss"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
