import React, { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce.js';
import { validateEmail } from '../utils/validation.js';

export const SearchInput = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  React.useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      className="search-input"
    />
  );
};
