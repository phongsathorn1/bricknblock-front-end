import { ButtonHTMLAttributes } from 'react';
import { styles } from './button.styles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) => {
  return (
    <button className={styles({ variant, size })} {...props}>
      {children}
    </button>
  );
};
