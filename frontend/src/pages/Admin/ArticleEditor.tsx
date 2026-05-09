import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { articleApi } from '../../api/article';
import { uploadApi } from '../../api/upload';
import { seriesApi, type SeriesItem } from '../../api/series';
import { api } from '../../api';
import { useThemeStore } from '../../stores/themeStore';
import type { Category, Tag } from '../../types';

function ArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { isDark } = useThemeStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [seriesId, setSeriesId] = useState<number | ''>('');
  const [seriesOrder, setSeriesOrder] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Warn on browser tab close when dirty
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Mark dirty on any form change
  const markDirty = useCallback(() => setDirty(true), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes, seriesRes] = await Promise.all([
          api.get('/categories'),
          api.get('/tags'),
          seriesApi.getList(),
        ]);
        setCategories(catRes.data);
        setTags(tagRes.data);
        setSeriesList(seriesRes.data);
      } catch (err) {
        console.error('Failed to fetch categories/tags:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetchArticle = async () => {
      try {
        const res = await articleApi.getById(parseInt(id!, 10));
        const article = res.data;
        setTitle(article.title);
        setContent(article.content);
        setSummary(article.summary || '');
        setCoverImage(article.cover_image || '');
        setStatus(article.status as 'draft' | 'published');
        setCategoryId(article.category?.id || '');
        setSelectedTags(article.tags.map((t) => t.id));
        setSeriesId(article.series?.id || '');
        setSeriesOrder(article.series_order ?? '');
      } catch (err) {
        console.error('Failed to fetch article:', err);
      }
    };
    fetchArticle();
  }, [isEdit, id]);

  const handleImageUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadApi.image(file);
      const url = res.data.url;
      const markdown = `![${file.name}](${url})`;
      setContent((prev) => prev + '\n' + markdown + '\n');
    } catch (err) {
      alert('图片上传失败');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
      e.target.value = '';
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
        break;
      }
    }
  }, [handleImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        handleImageUpload(file);
        break;
      }
    }
  }, [handleImageUpload]);

  const imageUploadCommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': '上传图片', title: '上传图片' },
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    execute: () => {
      fileInputRef.current?.click();
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空');
      return;
    }

    setSaving(true);
    const data = {
      title,
      content,
      summary: summary || undefined,
      cover_image: coverImage || undefined,
      status,
      category_id: categoryId || undefined,
      tag_ids: selectedTags,
      series_id: seriesId || undefined,
      series_order: seriesOrder !== '' ? Number(seriesOrder) : undefined,
    };

    try {
      if (isEdit) {
        await articleApi.update(parseInt(id!, 10), data);
      } else {
        await articleApi.create(data);
      }
      navigate('/admin/articles');
    } catch (err: any) {
      alert(err.response?.data?.detail || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--color-text)' }}>
        {isEdit ? '编辑文章' : '新建文章'}
      </h1>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <form onSubmit={handleSubmit} onInput={markDirty}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '1rem',
            }}
          />
        </div>

        {seriesId && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>系列排序（数字越小越靠前）</label>
            <input
              type="number"
              value={seriesOrder}
              onChange={(e) => setSeriesOrder(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="留空自动排在末尾"
              style={{
                width: '200px',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '1rem',
              }}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>分类</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '1rem',
              }}
            >
              <option value="">无分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>所属系列</label>
            <select
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value ? parseInt(e.target.value) : '')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '1rem',
              }}
            >
              <option value="">无系列</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '1rem',
              }}
            >
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>封面图片 URL</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="或留空"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '1rem',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>标签</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags.map((tag) => (
              <label
                key={tag.id}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: selectedTags.includes(tag.id) ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedTags.includes(tag.id) ? '#fff' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag.id) ? prev.filter((t) => t !== tag.id) : [...prev, tag.id]
                    );
                  }}
                  style={{ display: 'none' }}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>摘要</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }} onPaste={handlePaste} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            内容 *{uploading && <span style={{ marginLeft: '0.75rem', color: 'var(--color-primary)', fontSize: '0.875rem' }}>图片上传中...</span>}
          </label>
          <div data-color-mode={isDark ? 'dark' : 'light'}>
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height={500}
              textareaProps={{
                placeholder: '请输入文章内容...支持粘贴/拖拽图片上传',
              }}
              extraCommands={[imageUploadCommand]}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
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
            {saving ? '保存中...' : '保存文章'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

export default ArticleEditor;
