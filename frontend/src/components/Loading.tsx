function Loading() {
  return (
    <div style={{ padding: '4rem 0', textAlign: 'center' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '2px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem',
        }}
      />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>加载中...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Loading;
