import React from 'react';
import { Box, Typography, Paper, Stack, Skeleton, Divider } from '@mui/material';
import { ColorSwatch } from './ColorSwatch';
import { ColorBreakdown } from './ColorBreakdown';
import { ColorSpaceDisplay } from './ColorSpaceDisplay';

export interface PixelColorData {
  hex: string;
  rgb: number[];
  coordinates: { x: number; y: number };
}

export interface PixelColorDisplayProps {
  pixelColor: PixelColorData | null;
  isLoading?: boolean;
  error?: string | null;
  title?: string;
}

export const PixelColorDisplay: React.FC<PixelColorDisplayProps> = ({
  pixelColor,
  isLoading = false,
  error = null,
  title = "Pixel Color",
}) => {
  if (isLoading) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minWidth: 200,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Skeleton variant="circular" width={64} height={64} />
        <Stack spacing={1} alignItems="center">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={100} />
        </Stack>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minWidth: 200,
          borderColor: 'error.main',
          borderWidth: 1,
          borderStyle: 'solid',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      </Paper>
    );
  }

  if (!pixelColor) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minWidth: 200,
          opacity: 0.6,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Box 
          sx={{ 
            width: 64, 
            height: 64, 
            borderRadius: 1,
            border: '2px dashed',
            borderColor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Move crosshair
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Click on the right image to sample a color
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minWidth: 200,
        maxWidth: 250,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      
      <ColorSwatch 
        color={pixelColor.hex}
        size="2xl"
        shape="rounded"
        showChecker={true}
      />
      
      <Stack spacing={2} alignItems="center">
        <Stack spacing={1} alignItems="center">
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'monospace',
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {pixelColor.hex.toUpperCase()}
          </Typography>
        </Stack>

        {/* Color Breakdown Charts */}
        <ColorBreakdown 
          rgb={pixelColor.rgb}
          size={100}
        />

        <Divider sx={{ width: '100%', my: 1 }} />

        {/* Color Space Information */}
        <ColorSpaceDisplay 
          hex={pixelColor.hex}
          compact={true}
        />
      </Stack>
    </Paper>
  );
};