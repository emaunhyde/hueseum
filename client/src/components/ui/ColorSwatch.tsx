import React from 'react';
import { Box, BoxProps } from '@mui/material';

export interface ColorSwatchProps extends Omit<BoxProps, 'children'> {
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  shape?: 'square' | 'rounded' | 'circle';
  showChecker?: boolean;
}

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
};

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = 'md',
  shape = 'rounded',
  showChecker = true,
  sx,
  ...props
}) => {
  const sizeValue = typeof size === 'number' ? size : sizeMap[size];
  
  const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? 1 : 0;
  
  const checkerboardBackground = showChecker
    ? `
        conic-gradient(#f0f0f0 0deg 90deg, transparent 90deg 180deg, #f0f0f0 180deg 270deg, transparent 270deg),
        repeating-conic-gradient(#f0f0f0 0deg 45deg, transparent 45deg 90deg)
      `
    : undefined;

  return (
    <Box
      sx={{
        width: sizeValue,
        height: sizeValue,
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
        background: checkerboardBackground,
        backgroundSize: '8px 8px',
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: color,
          borderRadius,
        }}
      />
    </Box>
  );
};