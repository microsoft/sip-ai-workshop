import React from 'react';

export const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
};
