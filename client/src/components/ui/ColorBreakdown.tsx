import React from 'react';
import { Stack } from '@mui/material';
import { ColorPolarChart } from './ColorPolarChart';
import { rgbToPercentages, rgbToCmyk } from '@/lib/utils/color-conversion';

export interface ColorBreakdownProps {
  rgb: number[];
  size?: number;
}

export const ColorBreakdown: React.FC<ColorBreakdownProps> = ({
  rgb,
  size = 12,
}) => {
  const [r, g, b] = rgb;
  
  // Get RGB percentages
  const rgbPercentages = rgbToPercentages(r, g, b);
  
  // Get CMYK values
  const cmykValues = rgbToCmyk(r, g, b);

  const rgbData = {
    labels: ['Red', 'Green', 'Blue'],
    values: [rgbPercentages.r, rgbPercentages.g, rgbPercentages.b],
    colors: ['#FF0000', '#00FF00', '#0000FF'],
  };

  const cmykData = {
    labels: ['Cyan', 'Magenta', 'Yellow', 'Black'],
    values: [cmykValues.c, cmykValues.m, cmykValues.y, cmykValues.k],
    colors: ['#00FFFF', '#FF00FF', '#FFFF00', '#000000'],
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <ColorPolarChart
        data={rgbData}
        size={size}
        title="RGB"
      />
      <ColorPolarChart
        data={cmykData}
        size={size}
        title="CMYK"
      />
    </Stack>
  );
};