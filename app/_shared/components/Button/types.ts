import { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Conteúdo do botão
   */
  children: ReactNode;
  
  /**
   * Variante visual do botão
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Tamanho do botão
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * Define se o botão ocupa toda a largura disponível
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Estado de carregamento do botão
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Ícone que aparece antes do texto
   */
  leftIcon?: ReactNode;
  
  /**
   * Ícone que aparece depois do texto
   */
  rightIcon?: ReactNode;
  
  /**
   * Estado desabilitado do botão
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
}