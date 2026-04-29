import { useDocumentTitle } from '../utils/useDocumentTitle';

function About() {
  useDocumentTitle('关于我');
  return (
    <div style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--color-text)' }}>
        关于我
      </h1>
      <div
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p style={{ color: 'var(--color-text)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          欢迎来到我的个人博客！这里是我记录技术学习、分享开发经验、以及思考生活的地方。
        </p>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          我是一名热爱技术的开发者，专注于 Web 开发领域。在这个博客中，你会看到关于前端、后端、数据库、
          以及各种技术工具的文章。我相信持续学习和分享是成长的最佳方式。
        </p>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          如果你对我的文章有任何想法或建议，欢迎在文章下方留言，我会认真阅读每一条评论。
        </p>
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>
            联系方式
          </h3>
          <ul style={{ color: 'var(--color-text-secondary)', lineHeight: 2 }}>
            <li>GitHub: github.com/yourusername</li>
            <li>Email: your.email@example.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;
