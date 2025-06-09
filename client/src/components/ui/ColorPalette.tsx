import React from 'react';
import { Box, Stack, Typography, Tooltip } from '@mui/material';
import { ColorSwatch } from './ColorSwatch';
import { ColorData } from '@/lib/api/palette';

export interface ColorPaletteProps {
  colors: ColorData[];
  title?: string;
  swatchSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showColorValues?: boolean;
  showPercentages?: boolean;
  layout?: 'row' | 'column' | 'grid';
  maxColumns?: number;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  title,
  swatchSize = 'sm',
  showColorValues = true,
  layout = 'row',
  maxColumns = 4,
}) => {
  const renderSwatch = (color: string, index: number) => (
    <Tooltip 
      key={color + index} 
      title={showColorValues ? color.toUpperCase() : ''} 
      placement="top"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        <ColorSwatch 
          color={color} 
          size={swatchSize}
          shape="rounded"
        />
      </Box>
    </Tooltip>
  );

  const renderLayout = () => {
    if (layout === 'grid') {
      return (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(colors.length, maxColumns)}, 1fr)`,
            gap: 2,
            justifyItems: 'center',
          }}
        >
          {colors.map(renderSwatch)}
        </Box>
      );
    }

    return (
      <Stack 
        direction={layout === 'row' ? 'row' : 'column'} 
        spacing={1}
        flexWrap="wrap"
        alignItems="flex-start"
        justifyContent="flex-start"
      >
        {colors.map(renderSwatch)}
      </Stack>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {title && (
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
      )}
      {renderLayout()}
    </Box>
  );
};