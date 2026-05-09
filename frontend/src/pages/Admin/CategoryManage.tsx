import { useEffect, useState } from 'react';
import { categoryApi } from '../../api/category';
import type { Category } from '../../types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w一-龥-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

function CategoryManage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getList();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await categoryApi.update(editing.id, { name, slug: slug || undefined, description: description || undefined });
      } else {
        await categoryApi.create({ name, slug: slug || undefined, description: description || undefined });
      }
      resetForm();
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.detail || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该分类吗？')) return;
    try {
      await categoryApi.remove(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || '删除失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>分类管理</h1>
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
          + 新建分类
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>{editing ? '编辑分类' : '新建分类'}</h3>
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
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', resize: 'vertical' }}
            />
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
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>描述</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>文章数</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--color-text)' }}>{cat.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{cat.slug}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{cat.description || '-'}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{cat.article_count}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(cat)} style={{ padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '0.8rem', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}>编辑</button>
                    <button onClick={() => handleDelete(cat.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-danger)', color: '#fff', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>删除</button>
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

export default CategoryManage;
