import { useDocumentTitle } from '../utils/useDocumentTitle';

function About() {
  useDocumentTitle('关于我');

  const skills = [
    'Python', 'FastAPI', 'React', 'TypeScript',
    'Node.js', 'Docker', 'MySQL', 'Redis',
    'Linux', 'Git', 'Nginx', 'Tailwind CSS',
  ];

  const timeline = [
    {
      year: '2024',
      title: '启动 码境 CodeRealm',
      desc: '基于 FastAPI + React 构建个人博客系统，记录技术探索的足迹。',
    },
    {
      year: '2023',
      title: '深入全栈开发',
      desc: '系统学习后端架构设计，从单体应用走向容器化部署。',
    },
    {
      year: '2022',
      title: '前端工程化实践',
      desc: '从 Vue 转向 React 生态，掌握 TypeScript、Vite、现代前端工具链。',
    },
    {
      year: '2021',
      title: '开启编程之旅',
      desc: '写下第一行代码，从此踏上持续学习的技术之路。',
    },
  ];

  return (
    <div style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--color-primary)',
            fontSize: '2.5rem',
            fontWeight: 700,
          }}
        >
          JM
        </div>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'var(--color-text)',
          }}
        >
          JM
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          热爱技术的开发者，专注于 Web 开发领域。在这个博客中分享关于前端、后端、数据库以及各种技术工具的文章。
        </p>
      </div>

      {/* Skills */}
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            color: 'var(--color-text)',
          }}
        >
          技术栈
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {skills.map((skill) => (
            <span
              key={skill}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            color: 'var(--color-text)',
          }}
        >
          历程
        </h2>
        <div style={{ position: 'relative' }}>
          {timeline.map((item, index) => (
            <div
              key={item.year}
              style={{
                display: 'flex',
                gap: '1.25rem',
                paddingBottom: index < timeline.length - 1 ? '1.5rem' : 0,
                position: 'relative',
              }}
            >
              {/* Timeline line */}
              {index < timeline.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '22px',
                    top: '28px',
                    bottom: 0,
                    width: '2px',
                    backgroundColor: 'var(--color-border)',
                  }}
                />
              )}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {item.year}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    marginBottom: '0.25rem',
                    fontSize: '0.9375rem',
                  }}
                >
                  {item.title}
                </div>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: 'var(--color-text)',
          }}
        >
          联系我
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            marginBottom: '1rem',
          }}
        >
          如果你对我的文章有任何想法或建议，欢迎通过以下方式联系我。
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="https://github.com/junmingcode"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary-light)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a
            href="https://gitee.com/junmingcode" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary-light)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            Gitee
          </a>
        </div>
      </div>
    </div>
  );
}

export default About;
