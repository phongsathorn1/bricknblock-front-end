import { css } from 'styled-components';

export const styles = ({
  variant,
  size,
}: {
  variant: string;
  size: string;
}) => css`
  background-color: ${variant === 'primary' ? 'blue' : 'gray'};
  font-size: ${size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px'};
  padding: ${size === 'sm'
    ? '8px 12px'
    : size === 'md'
    ? '10px 16px'
    : '12px 20px'};
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: ${variant === 'primary' ? 'darkblue' : 'darkgray'};
  }
`;
