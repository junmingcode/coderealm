function SkeletonPulse({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '1.25rem',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <SkeletonPulse style={{ width: '160px', height: '100px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
        <SkeletonPulse style={{ width: '70%', height: '1.25rem' }} />
        <SkeletonPulse style={{ width: '100%', height: '0.875rem' }} />
        <SkeletonPulse style={{ width: '60%', height: '0.875rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <SkeletonPulse style={{ width: '60px', height: '0.75rem' }} />
          <SkeletonPulse style={{ width: '60px', height: '0.75rem' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonArticle() {
  return (
    <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', padding: '2rem 0' }}>
      <SkeletonPulse style={{ width: '80px', height: '1.5rem', marginBottom: '1rem' }} />
      <SkeletonPulse style={{ width: '90%', height: '2.5rem', marginBottom: '1.25rem' }} />
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <SkeletonPulse style={{ width: '100px', height: '0.875rem' }} />
        <SkeletonPulse style={{ width: '80px', height: '0.875rem' }} />
        <SkeletonPulse style={{ width: '60px', height: '0.875rem' }} />
      </div>
      <SkeletonPulse style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <SkeletonPulse style={{ width: '100%', height: '1rem' }} />
        <SkeletonPulse style={{ width: '95%', height: '1rem' }} />
        <SkeletonPulse style={{ width: '100%', height: '1rem' }} />
        <SkeletonPulse style={{ width: '90%', height: '1rem' }} />
        <SkeletonPulse style={{ width: '100%', height: '1rem' }} />
        <SkeletonPulse style={{ width: '85%', height: '1rem' }} />
        <SkeletonPulse style={{ width: '100%', height: '1rem' }} />
        <SkeletonPulse style={{ width: '95%', height: '1rem' }} />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div>
      <SkeletonPulse style={{ width: '120px', height: '1.75rem', marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <SkeletonPulse style={{ width: '3rem', height: '2rem', marginBottom: '0.5rem' }} />
            <SkeletonPulse style={{ width: '4rem', height: '0.9rem' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <SkeletonPulse style={{ width: '120px', height: '1.75rem' }} />
        <SkeletonPulse style={{ width: '100px', height: '2.25rem', borderRadius: 'var(--radius-md)' }} />
      </div>
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPulse key={i} style={{ flex: 1, height: '0.875rem' }} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
            <SkeletonPulse style={{ flex: 2, height: '1rem' }} />
            <SkeletonPulse style={{ flex: 1, height: '1rem' }} />
            <SkeletonPulse style={{ flex: 1, height: '1rem' }} />
            <SkeletonPulse style={{ flex: 1, height: '1rem' }} />
            <SkeletonPulse style={{ flex: 1, height: '1rem' }} />
            <SkeletonPulse style={{ flex: 1.5, height: '1rem' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
