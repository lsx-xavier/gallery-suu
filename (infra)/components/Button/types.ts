import { PropsWithChildren, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

type CommonProps = PropsWithChildren<{
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
   * Classes CSS adicionais
   */
  className?: string;

  /**
   * Muda o component, adaptando para os tipos de clicaveis.
   */
  as?: 'button' | 'a';
}>;

export type AsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { disabled?: boolean };

export type AsAnchor = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    disabled?: never;
  };

export type ButtonProps =
  | ({
      as?: 'button';
    } & AsButton)
  | ({
      as?: 'a';
    } & AsAnchor);
