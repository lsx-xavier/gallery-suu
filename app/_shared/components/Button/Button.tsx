import Link from 'next/link';
import { forwardRef } from 'react';
import { ButtonProps } from './types';

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      as = 'button',
      ...props
    },
    ref,
  ) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium p-2';

    const variantClasses = {
      primary: 'bg-[#0F1010] bg-opacity-75 hover:bg-opacity-100 [&>*]:hover:opacity-60',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      ghost: 'text-blue-600 hover:bg-blue-50',
      link: 'text-blue-600 hover:underline',
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const Component = as === 'a' ? Link : as;

    return (
      <Component
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${isLoading ? 'cursor-not-allowed opacity-70' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className || ''}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="mr-3 -ml-1 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Component>
    );
  },
);

Button.displayName = 'Button';
