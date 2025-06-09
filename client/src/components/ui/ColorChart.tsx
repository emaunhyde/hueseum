import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { ColorData } from '@/lib/api/palette';

export interface ColorChartProps {
  colors: ColorData[];
  title?: string;
  height?: number;
  showPercentages?: boolean;
  borderRadius?: number;
}

export const ColorChart: React.FC<ColorChartProps> = ({
  colors,
  height = 60,
  borderRadius = 8,
}) => {
  const totalPercentage = colors.reduce((sum, color) => sum + color.percentage, 0);

  return (
    <Box sx={{ width: '20%' }}>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height,
          borderRadius: `${borderRadius}px`,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        {colors.map((color, index) => {
          const widthPercentage = (color.percentage / totalPercentage) * 100;
          
          return (
            <Tooltip 
              key={`${color.hex}-${index}`}
              title={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {color.hex.toUpperCase()}
                  </Typography>
                  <Typography variant="caption">
                    {color.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              }
              placement="top"
            >
              <Box
                sx={{
                  backgroundColor: color.hex,
                  width: `${widthPercentage}%`,
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'filter 0.2s ease-in-out',
                  '&:hover': {
                    filter: 'brightness(1.1)',
                  },
                }}
              />
            </Tooltip>
          );
        })}
      </Box>

    </Box>
  );
};