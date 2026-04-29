import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} | 码境` : '码境';
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
