import { useEffect } from 'react';

export function useMetaDescription(description: string) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const originalContent = meta?.getAttribute('content') || '';

    if (meta && description) {
      meta.setAttribute('content', description);
    }

    return () => {
      if (meta) {
        meta.setAttribute('content', originalContent);
      }
    };
  }, [description]);
}
