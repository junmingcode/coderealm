import { useEffect, useState } from 'react';
import { tagApi } from '../../api/tag';
import type { Tag } from '../../types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w一-龥-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

function TagManage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await tagApi.getList();
      setTags(res.data);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTags(); }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (tag: Tag) => {
    setEditing(tag);
    setName(tag.name);
    setSlug(tag.slug);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await tagApi.update(editing.id, { name, slug: slug || undefined });
      } else {
        await tagApi.create({ name, slug: slug || undefined });
      }
      resetForm();
      fetchTags();
    } catch (err: any) {
      alert(err.response?.data?.detail || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该标签吗？')) return;
    try {
      await tagApi.remove(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || '删除失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>标签管理</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + 新建标签
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>{editing ? '编辑标签' : '新建标签'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>名称 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (!editing) setSlug(slugify(e.target.value)); }}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="自动生成"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={saving} style={{ padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {saving ? '保存中...' : '保存'}
            </button>
            <button type="button" onClick={resetForm} style={{ padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
              取消
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: 'var(--color-text-secondary)' }}>加载中...</div>
      ) : (
        <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>名称</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Slug</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>文章数</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--color-text)' }}>{tag.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{tag.slug}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{tag.article_count}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(tag)} style={{ padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '0.8rem', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}>编辑</button>
                    <button onClick={() => handleDelete(tag.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-danger)', color: '#fff', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TagManage;
