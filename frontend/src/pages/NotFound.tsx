import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../utils/useDocumentTitle';

function NotFound() {
  useDocumentTitle('页面未找到');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          fontSize: '6rem',
          fontWeight: 800,
          color: 'var(--color-primary)',
          lineHeight: 1,
          marginBottom: '1rem',
          letterSpacing: '-0.05em',
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: '0.75rem',
        }}
      >
        页面未找到
      </h1>
      <p
        style={{
          fontSize: '1rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '2rem',
          maxWidth: '400px',
        }}
      >
        你访问的页面不存在或已被移除。
      </p>
      <Link
        to="/"
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        返回首页
      </Link>
    </div>
  );
}

export default NotFound;
