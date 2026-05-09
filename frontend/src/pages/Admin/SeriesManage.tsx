import { useEffect, useState } from 'react';
import { seriesApi, type SeriesItem } from '../../api/series';

function SeriesManage() {
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', cover_image: '' });

  const fetchSeries = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await seriesApi.getList();
      setSeriesList(res.data);
    } catch (err) {
      setError('加载系列列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSeries(); }, []);

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', cover_image: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name: form.name, slug: form.slug || undefined, description: form.description || undefined, cover_image: form.cover_image || undefined };
      if (editId) {
        await seriesApi.update(editId, data);
      } else {
        await seriesApi.create(data);
      }
      resetForm();
      fetchSeries();
    } catch (err: any) {
      alert(err.response?.data?.detail || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: SeriesItem) => {
    setEditId(item.id);
    setForm({ name: item.name, slug: item.slug, description: item.description || '', cover_image: item.cover_image || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该系列？系列下的文章不会被删除。')) return;
    try {
      await seriesApi.remove(id);
      fetchSeries();
    } catch (err: any) {
      alert(err.response?.data?.detail || '删除失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>系列管理</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
          }}
        >
          新建系列
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.5rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)', marginBottom: '1.5rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>名称 *</label>
            <input
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>Slug（留空自动生成）</label>
            <input
              value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>描述</label>
            <textarea
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', resize: 'vertical' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>封面图片 URL</label>
            <input
              value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
              style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={saving} style={{ padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: saving ? 0.7 : 1 }}>
              {saving ? '保存中...' : editId ? '保存' : '创建'}
            </button>
            <button type="button" onClick={resetForm} style={{ padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.875rem' }}>
              取消
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: 'var(--color-text-secondary)', padding: '2rem', textAlign: 'center' }}>加载中...</div>
      ) : error ? (
        <div style={{ color: 'var(--color-danger)', padding: '2rem', textAlign: 'center' }}>{error}</div>
      ) : (
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface)' }}>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>名称</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>Slug</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>文章数</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>创建时间</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {seriesList.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>暂无系列</td></tr>
              )}
              {seriesList.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{item.slug}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>{item.article_count}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(item.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button onClick={() => handleEdit(item)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginRight: '0.75rem' }}>编辑</button>
                    <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>删除</button>
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

export default SeriesManage;
