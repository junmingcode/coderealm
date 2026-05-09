import { useEffect, useState } from 'react';
import { authApi } from '../../api/auth';
import type { User } from '../../types';

function UserManage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', is_admin: false, avatar: '', bio: '' });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.getUsers();
      setUsers(res.data);
    } catch (err) {
      setError('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    authApi.me().then((res) => setCurrentUserId(res.data.id)).catch(() => {});
  }, []);

  const resetForm = () => {
    setForm({ username: '', email: '', password: '', is_admin: false, avatar: '', bio: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const data: any = { email: form.email, is_admin: form.is_admin, avatar: form.avatar || undefined, bio: form.bio || undefined };
        if (form.password) data.password = form.password;
        await authApi.updateUser(editId, data);
      } else {
        await authApi.register({ username: form.username, email: form.email, password: form.password });
      }
      resetForm();
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setForm({ username: user.username, email: user.email, password: '', is_admin: user.is_admin, avatar: user.avatar || '', bio: user.bio || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (id === currentUserId) { alert('不能删除当前登录用户'); return; }
    if (!confirm('确定删除该用户？')) return;
    try {
      await authApi.deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || '删除失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>用户管理</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
          }}
        >
          新增用户
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
          {!editId && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>用户名</label>
              <input
                value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>邮箱</label>
            <input
              type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>{editId ? '新密码（留空不修改）' : '密码'}</label>
            <input
              type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId}
              style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={form.is_admin} onChange={(e) => setForm({ ...form, is_admin: e.target.checked })} />
              管理员权限
            </label>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none',
                fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? '保存中...' : editId ? '保存' : '创建'}
            </button>
            <button
              type="button" onClick={resetForm}
              style={{
                padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)', color: 'var(--color-text)',
                border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
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
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>ID</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>用户名</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>邮箱</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>角色</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>注册时间</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>{user.id}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 500 }}>{user.username}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-sm)',
                      backgroundColor: user.is_admin ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                      color: user.is_admin ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: 500,
                    }}>
                      {user.is_admin ? '管理员' : '用户'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(user.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button onClick={() => handleEdit(user)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginRight: '0.75rem' }}>编辑</button>
                    <button onClick={() => handleDelete(user.id)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>删除</button>
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

export default UserManage;
