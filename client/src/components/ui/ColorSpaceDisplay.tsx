import React from 'react';
import { Box, Grid, Chip } from '@mui/material';
import { getAllColorSpaces } from '@/lib/utils/color-spaces';

export interface ColorSpaceDisplayProps {
  hex: string;
  compact?: boolean;
}

export const ColorSpaceDisplay: React.FC<ColorSpaceDisplayProps> = ({
  hex,
}) => {
  const colorSpaces = React.useMemo(() => getAllColorSpaces(hex), [hex]);

  const colorSpaceOrder = ['rgb', 'hsl', 'hsv', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'xyz', 'cmyk'] as const;


    return (
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={0.5}>
          {colorSpaceOrder.map((key) => {
            const space = colorSpaces[key];
            return (
              <Grid item xs={6} key={key}>
                <Chip
                  label={`${space.shortName}: ${space.formatted}`}
                  size="small"
                  clickable={false}
                  variant="outlined"
                  sx={{
                    fontSize: '0.6rem',
                    height: 20,
                    '& .MuiChip-label': {
                      fontFamily: 'monospace',
                      px: 0.5,
                    },
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
};