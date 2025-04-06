import Link from 'next/link';
import { forwardRef } from 'react';
import { ButtonProps } from './types';

export const Button = forwardRef(function Button<T extends 'button' | 'a'>(
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
    as = 'button' as T,
    ...props
  }: ButtonProps & { as?: T },
  ref: T extends 'button' ? React.Ref<HTMLButtonElement> : React.Ref<HTMLAnchorElement>,
) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium';

  const variantClasses = {
    primary: 'bg-[#0F1010] bg-opacity-75 hover:bg-opacity-100 [&>*]:hover:opacity-60',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-blue-600 text-blue-600',
    ghost: 'text-blue-600 hover:bg-blue-50',
    link: 'text-blue-600 hover:underline',
  };

  const sizeClasses = {
    sm: 'text-sm p-1',
    md: 'text-base p-2',
    lg: 'text-lg p-3',
  };

  const Component = as === 'a' ? Link : as;

  return (
    // @ts-expect-error - This is a workaround to avoid the type error
    <Component
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${isLoading ? 'cursor-not-allowed opacity-70' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className || ''} cursor-pointer hover:bg-[inerit]/80`}
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
});

Button.displayName = 'Button';
