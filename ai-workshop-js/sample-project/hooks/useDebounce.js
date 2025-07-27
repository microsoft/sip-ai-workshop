import { useState, useEffect } from 'react';
import { debounce } from '../utils/helpers.js';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedValue(value);
    }, delay);
    
    handler();
    
    return () => {
      // Cleanup handled by debounce function
    };
  }, [value, delay]);
  
  return debouncedValue;
};
