import { useState, useEffect } from 'react';

/**
 * Custom hook for managing data lists with search, sort, and localStorage persistence
 * @param {string} storageKey - Unique key for localStorage (e.g., 'doctors', 'patients')
 * @param {string} defaultSortField - Default field to sort by
 * @param {string} defaultSortOrder - Default sort order ('asc' or 'desc')
 * @returns {Object} State and handlers for data list management
 */
export function useDataList(storageKey, defaultSortField = 'name', defaultSortOrder = 'asc') {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(() => 
    localStorage.getItem(`${storageKey}SortField`) || defaultSortField
  );
  const [sortOrder, setSortOrder] = useState(() => 
    localStorage.getItem(`${storageKey}SortOrder`) || defaultSortOrder
  );

  // Persist sort settings to localStorage
  useEffect(() => {
    localStorage.setItem(`${storageKey}SortField`, sortField);
    localStorage.setItem(`${storageKey}SortOrder`, sortOrder);
  }, [sortField, sortOrder, storageKey]);

  const handleSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    handleSortChange,
  };
}
