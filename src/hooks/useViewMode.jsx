import { useState } from 'react';

export function useViewMode(storageKey) {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(storageKey) || 'table';
  });

  const toggleViewMode = () => {
    const newMode = viewMode === 'table' ? 'cards' : 'table';
    setViewMode(newMode);
    localStorage.setItem(storageKey, newMode);
  };

  return { viewMode, toggleViewMode };
}
