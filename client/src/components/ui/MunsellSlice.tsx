import React from 'react';
import { Box, Typography, Paper, Tooltip, Skeleton } from '@mui/material';
import { MunsellSlice as MunsellSliceType, MunsellMatch } from '@/lib/munsell';

export interface MunsellSliceProps {
  slice: MunsellSliceType;
  selected?: {
    value: number;
    chroma: number;
  };
  hue?: string;
  isLoading?: boolean;
  onChipClick?: (value: number, chroma: number, hex: string) => void;
}

export const MunsellSlice: React.FC<MunsellSliceProps> = ({
  slice,
  selected,
  hue,
  isLoading = false,
  onChipClick,
}) => {
  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Munsell Hue Slice
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={32} height={32} />
          ))}
        </Box>
      </Paper>
    );
  }

  if (!slice || Object.keys(slice).length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Munsell Hue Slice
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No color data available
        </Typography>
      </Paper>
    );
  }

  // Get all values and chromas to determine grid dimensions
  const values = Object.keys(slice).map(Number).sort((a, b) => b - a); // Descending order
  const allChromas = new Set<number>();
  
  Object.values(slice).forEach(valueRow => {
    Object.keys(valueRow).forEach(chroma => {
      allChromas.add(Number(chroma));
    });
  });
  
  const chromas = Array.from(allChromas).sort((a, b) => a - b); // Ascending order
  const maxChroma = Math.max(...chromas);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Munsell Hue Slice {hue && `(${hue})`}
      </Typography>
      
      {/* Grid Labels */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Value (lightness) ↓ × Chroma (saturation) →
        </Typography>
      </Box>

      {/* Color Grid Container with Horizontal Scroll */}
      <Box sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `40px repeat(${chromas.length}, minmax(32px, 1fr))`,
            gap: 1,
            alignItems: 'center',
            minWidth: `${40 + chromas.length * 34}px`, // Ensure minimum width
          }}
        >
        {/* Column headers (Chroma values) */}
        <Box /> {/* Empty corner */}
        {chromas.map(chroma => (
          <Typography
            key={`chroma-${chroma}`}
            variant="caption"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            /{chroma}
          </Typography>
        ))}

        {/* Grid rows */}
        {values.map(value => (
          <React.Fragment key={`value-${value}`}>
            {/* Row header (Value) */}
            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
            >
              {value}/
            </Typography>

            {/* Color chips for this value */}
            {chromas.map(chroma => {
              const hex = slice[value]?.[chroma];
              const isSelected = selected?.value === value && selected?.chroma === chroma;
              
              if (!hex) {
                return (
                  <Box
                    key={`${value}-${chroma}`}
                    sx={{
                      width: 32,
                      height: 32,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 0.5,
                      backgroundColor: 'grey.50',
                    }}
                  />
                );
              }

              return (
                <Tooltip
                  key={`${value}-${chroma}`}
                  title={`${hue || ''} ${value}/${chroma} • ${hex.toUpperCase()}`}
                  placement="top"
                >
                  <Box
                    onClick={() => onChipClick?.(value, chroma, hex)}
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: hex,
                      border: isSelected ? '3px solid' : '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'grey.300',
                      borderRadius: 0.5,
                      cursor: onChipClick ? 'pointer' : 'default',
                      transition: 'all 0.2s ease-in-out',
                      position: 'relative',
                      '&:hover': onChipClick ? {
                        transform: 'scale(1.1)',
                        zIndex: 1,
                        boxShadow: 2,
                      } : {},
                      // Animated outline for selected chip
                      ...(isSelected && {
                        animation: 'munsell-pulse 2s ease-in-out infinite',
                        '@keyframes munsell-pulse': {
                          '0%': {
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)',
                          },
                          '50%': {
                            borderColor: 'primary.light',
                            boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                          },
                          '100%': {
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)',
                          },
                        },
                      }),
                    }}
                  />
                </Tooltip>
              );
            })}
          </React.Fragment>
        ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Click any chip to explore • Selected chip has animated outline
        </Typography>
        {selected && (
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Selected: {hue || ''} {selected.value}/{selected.chroma}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}; 