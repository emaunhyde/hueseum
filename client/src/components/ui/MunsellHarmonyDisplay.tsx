import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Alert, CircularProgress, Chip } from '@mui/material';
import { getMunsellSlice } from '@/lib/munsell';
import type { MunsellSlice as MunsellSliceType } from '@/lib/munsell';

interface ColorPosition {
  hex: string;
  rgb: number[];
  percentage: number;
  hue: number;
  munsell_notation?: string;
  munsell_hue?: string;
  munsell_value?: number;
  munsell_chroma?: number;
  munsell_hex?: string;
  deltaE?: number;
  saturation: number;
  lightness: number;
  x: number;
  y: number;
}

interface HueSliceData {
  hue: string;
  slice: MunsellSliceType;
  colors: ColorPosition[];
  isLoading: boolean;
  error: string | null;
}

export interface MunsellHarmonyDisplayProps {
  positions: ColorPosition[];
  title?: string;
}

export const MunsellHarmonyDisplay: React.FC<MunsellHarmonyDisplayProps> = ({
  positions,
  title = "Munsell Harmony Analysis",
}) => {
  const [hueSlices, setHueSlices] = useState<HueSliceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadHueSlices = async () => {
      if (!positions || positions.length === 0) {
        setHueSlices([]);
        return;
      }

      // Extract unique hue families from the positions
      const uniqueHues = new Set<string>();
      const hueColorMap = new Map<string, ColorPosition[]>();

      positions.forEach(pos => {
        if (pos.munsell_hue) {
          const hue = pos.munsell_hue;
          uniqueHues.add(hue);
          
          if (!hueColorMap.has(hue)) {
            hueColorMap.set(hue, []);
          }
          hueColorMap.get(hue)!.push(pos);
        }
      });

      if (uniqueHues.size === 0) {
        setHueSlices([]);
        return;
      }

      setIsLoading(true);

      // Sort hues for consistent ordering
      const sortedHues = Array.from(uniqueHues).sort();

      // Initialize hue slice data with loading states
      const initialSlices: HueSliceData[] = sortedHues.map(hue => ({
        hue,
        slice: {},
        colors: hueColorMap.get(hue) || [],
        isLoading: true,
        error: null,
      }));

      setHueSlices(initialSlices);

      // Load each hue slice
      const loadPromises = sortedHues.map(async (hue, index) => {
        try {
          const response = await getMunsellSlice(hue);
          
          setHueSlices(prev => prev.map((slice, i) => 
            i === index 
              ? { ...slice, slice: response.slice, isLoading: false }
              : slice
          ));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load slice';
          
          setHueSlices(prev => prev.map((slice, i) => 
            i === index 
              ? { ...slice, isLoading: false, error: errorMessage }
              : slice
          ));
        }
      });

      await Promise.all(loadPromises);
      setIsLoading(false);
    };

    loadHueSlices();
  }, [positions]);

  if (!positions || positions.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, opacity: 0.6 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No color harmony data available
        </Typography>
      </Paper>
    );
  }

  const getHueColor = (hue: string, hueSlices: HueSliceData[]) => {
    // Find a representative color from the actual Munsell slice
    const hueData = hueSlices.find(slice => slice.hue === hue);
    if (!hueData || !hueData.slice) return '#757575';

    // Look for a mid-value, mid-chroma color to represent the hue
    // Try value 5 or 6 first, then any available value
    const preferredValues = [5, 6, 4, 7, 3, 8, 2, 9, 1];
    const preferredChromas = [6, 8, 4, 10, 12, 2, 14, 16];

    for (const value of preferredValues) {
      if (hueData.slice[value]) {
        for (const chroma of preferredChromas) {
          if (hueData.slice[value][chroma]) {
            return hueData.slice[value][chroma];
          }
        }
      }
    }

    // Fallback: return any available color
    for (const valueRow of Object.values(hueData.slice)) {
      for (const hex of Object.values(valueRow)) {
        if (hex) return hex;
      }
    }

    return '#757575';
  };

  // Create the traditional Munsell chart layout
  const createMunsellChart = () => {
    if (hueSlices.length === 0 || hueSlices.some(slice => slice.isLoading)) {
      return null;
    }

    // Get all values across all slices (Y-axis - static)
    const allValues = new Set<number>();
    hueSlices.forEach(({ slice }) => {
      Object.keys(slice).forEach(value => {
        allValues.add(Number(value));
      });
    });
    const values = Array.from(allValues).sort((a, b) => b - a); // Descending (9 to 1)

    // For each hue, get its chroma range
    const hueChromaData = hueSlices.map(({ hue, slice }) => {
      const chromas = new Set<number>();
      Object.values(slice).forEach(valueRow => {
        Object.keys(valueRow).forEach(chroma => {
          chromas.add(Number(chroma));
        });
      });
      const sortedChromas = Array.from(chromas).sort((a, b) => b - a); // Descending order
      
      // Create single chroma range: high chroma -> neutral
      // /28, /26, /24, ... /2, N
      const chromaRange = [...sortedChromas.filter(c => c > 0), 0]; // Include neutral (0) at the end
      
      return { hue, slice, chromas: chromaRange };
    });

    // Calculate total columns
    const totalColumns = hueChromaData.reduce((sum, { chromas }) => sum + chromas.length, 0);
    const squareSize = Math.max(16, Math.min(32, 800 / totalColumns)); // Responsive square size

    // Create a map to find which colors from the image match each chip
    const imageColorMap = new Map<string, ColorPosition[]>();
    positions.forEach(pos => {
      if (pos.munsell_notation) {
        const key = pos.munsell_notation;
        if (!imageColorMap.has(key)) {
          imageColorMap.set(key, []);
        }
        imageColorMap.get(key)!.push(pos);
      }
    });

    return (
      <Box sx={{ overflowX: 'auto', overflowY: 'hidden', pb: 2 }}>
        {/* Hue headers */}
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Box sx={{ width: 40, flexShrink: 0 }} /> {/* Space for value labels */}
          {hueChromaData.map(({ hue, chromas }) => {
            const hueColor = getHueColor(hue, hueSlices);
            return (
              <Box
                key={hue}
                sx={{
                  width: chromas.length * squareSize,
                  textAlign: 'center',
                  borderBottom: '2px solid',
                  borderColor: hueColor,
                  mb: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: hueColor,
                    fontSize: '0.8rem',
                  }}
                >
                  {hue}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Chroma headers */}
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Box sx={{ width: 40, flexShrink: 0 }} /> {/* Space for value labels */}
          {hueChromaData.map(({ hue, chromas }) => (
            <Box key={`${hue}-chromas`} sx={{ display: 'flex' }}>
              {chromas.map(chroma => (
                <Box
                  key={`${hue}-chroma-${chroma}`}
                  sx={{
                    width: squareSize,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.6rem',
                      color: 'text.secondary',
                      transform: 'rotate(-45deg)',
                      display: 'block',
                      height: 16,
                      lineHeight: '16px',
                    }}
                  >
                    {chroma === 0 ? 'N' : `/${chroma}`}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        {/* Main grid */}
        <Box>
          {values.map(value => (
            <Box key={`value-${value}`} sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Value label */}
              <Box
                sx={{
                  width: 40,
                  textAlign: 'right',
                  pr: 1,
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                  }}
                >
                  {value}/
                </Typography>
              </Box>

              {/* Color squares for each hue */}
              {hueChromaData.map(({ hue, slice, chromas }) => (
                <Box key={`${hue}-${value}`} sx={{ display: 'flex' }}>
                  {chromas.map(chroma => {
                    const hex = slice[value]?.[chroma];
                    const notation = chroma === 0 ? `N ${value}/` : `${hue} ${value}/${chroma}`;
                    const imageColors = imageColorMap.get(notation) || [];
                    const hasImageColor = imageColors.length > 0;

                    return (
                      <Box
                        key={`${hue}-${value}-${chroma}`}
                        sx={{
                          width: squareSize,
                          height: squareSize,
                          backgroundColor: hex || '#f5f5f5',
                          border: '1px solid',
                                                     borderColor: hasImageColor ? getHueColor(hue, hueSlices) : 'grey.300',
                          borderWidth: hasImageColor ? 2 : 1,
                          position: 'relative',
                          cursor: hex ? 'pointer' : 'default',
                          '&:hover': hex ? {
                            transform: 'scale(1.1)',
                            zIndex: 1,
                            boxShadow: 2,
                          } : {},
                        }}
                        title={hex ? `${notation} • ${hex.toUpperCase()}${hasImageColor ? ` • ${imageColors[0].percentage.toFixed(1)}%` : ''}` : undefined}
                      >
                        {/* White dot for image colors */}
                        {hasImageColor && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: Math.max(4, squareSize * 0.25),
                              height: Math.max(4, squareSize * 0.25),
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              border: '1px solid rgba(0,0,0,0.3)',
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {title}
      </Typography>

      {isLoading && hueSlices.length === 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading Munsell hue segments...
          </Typography>
        </Box>
      )}

      {hueSlices.length > 0 && (
        <>
          {/* Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Traditional Munsell chart showing {hueSlices.length} hue {hueSlices.length === 1 ? 'family' : 'families'} from your image:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {hueSlices.map(({ hue, colors }) => (
                <Chip
                  key={hue}
                  label={`${hue} (${colors.length} color${colors.length === 1 ? '' : 's'})`}
                  size="small"
                  sx={{
                    backgroundColor: getHueColor(hue, hueSlices),
                    color: 'white',
                    fontWeight: 600,
                    mb: 1,
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Show errors if any */}
          {hueSlices.some(slice => slice.error) && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Some hue segments failed to load: {hueSlices.filter(s => s.error).map(s => s.hue).join(', ')}
            </Alert>
          )}

          {/* Traditional Munsell Chart */}
          {createMunsellChart()}

          {/* Legend */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              <strong>How to read this chart:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              • <strong>Y-axis:</strong> Value (lightness) from 9/ (light) to 1/ (dark)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              • <strong>X-axis:</strong> Chroma (saturation) from high → neutral (N) → high for each hue
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              • <strong>White dots:</strong> Colors found in your image
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • <strong>Colored borders:</strong> Indicate which hue family each section belongs to
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}; 