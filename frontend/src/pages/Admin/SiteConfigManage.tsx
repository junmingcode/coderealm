import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { siteConfigApi } from '../../api/siteConfig';

function SiteConfigManage() {
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [aboutPage, setAboutPage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await siteConfigApi.getAll();
        const cfg = res.data;
        setAuthorName(cfg.author_name || '');
        setAuthorBio(cfg.author_bio || '');
        setAuthorAvatar(cfg.author_avatar || '');
        setAboutPage(cfg.about_page || '');
      } catch (err) {
        console.error('Failed to fetch site config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        siteConfigApi.update('author_name', authorName),
        siteConfigApi.update('author_bio', authorBio),
        siteConfigApi.update('author_avatar', authorAvatar),
        siteConfigApi.update('about_page', aboutPage),
      ]);
      alert('保存成功');
    } catch (err) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--color-text-secondary)' }}>加载中...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '2rem' }}>站点设置</h1>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>作者信息</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>作者名称</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>头像 URL</label>
            <input
              type="text"
              value={authorAvatar}
              onChange={(e) => setAuthorAvatar(e.target.value)}
              placeholder="留空则显示首字母头像"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>作者简介</label>
          <textarea
            value={authorBio}
            onChange={(e) => setAuthorBio(e.target.value)}
            rows={2}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', resize: 'vertical' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>关于页面内容</h3>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          支持 Markdown 格式。留空则使用默认关于页内容。
        </p>
        <div data-color-mode="light">
          <MDEditor
            value={aboutPage}
            onChange={(val) => setAboutPage(val || '')}
            height={400}
            textareaProps={{ placeholder: '请输入关于页面的 Markdown 内容...' }}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '0.75rem 2rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? '保存中...' : '保存设置'}
      </button>
    </div>
  );
}

export default SiteConfigManage;
