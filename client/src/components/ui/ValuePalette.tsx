import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { rgbToLuminance, posterizeLuminance } from '@/lib/utils/luminance';
import { mapLuminanceToAllaPrima, AllaPrimaColor } from '@/lib/utils/alla-prima';

export interface ValuePaletteProps {
  steps: number;
  selectedValue?: number | null;
  allaPrimaColor?: AllaPrimaColor | null;
  title?: string;
}

export const ValuePalette: React.FC<ValuePaletteProps> = React.memo(({
  steps,
  selectedValue,
  allaPrimaColor,
  title = "Value Steps"
}) => {
  // Generate the value steps from dark to light
  const valueSteps = React.useMemo(() => {
    const stepValues: Array<{ luminance: number; color: string; label: string }> = [];
    
    for (let i = 0; i < steps; i++) {
      // Calculate luminance for this step (0 = darkest, steps-1 = lightest)
      const normalizedStep = i / (steps - 1); // 0 to 1
      const rawLuminance = Math.round(normalizedStep * 255); // 0 to 255
      
      // Apply posterization to get the actual luminance used
      const posterizedLuminance = posterizeLuminance(rawLuminance, steps);
      
      // Apply color mapping if alla prima is enabled
      let color: string;
      if (allaPrimaColor) {
        const allaPrimaRgb = mapLuminanceToAllaPrima(posterizedLuminance, allaPrimaColor);
        color = `rgb(${allaPrimaRgb.r}, ${allaPrimaRgb.g}, ${allaPrimaRgb.b})`;
      } else {
        color = `rgb(${posterizedLuminance}, ${posterizedLuminance}, ${posterizedLuminance})`;
      }
      
      stepValues.push({
        luminance: posterizedLuminance,
        color,
        label: `${Math.round((posterizedLuminance / 255) * 100)}%`
      });
    }
    
    // Reverse to show dark to light (dark at top)
    return stepValues.reverse();
  }, [steps, allaPrimaColor]);

  // Find which step matches the selected value
  const selectedStepIndex = React.useMemo(() => {
    if (selectedValue === null || selectedValue === undefined) return -1;
    
    // Posterize the selected value to match the current steps
    const posterizedSelected = posterizeLuminance(selectedValue, steps);
    
    // Find the closest matching step
    return valueSteps.findIndex(step => step.luminance === posterizedSelected);
  }, [selectedValue, steps, valueSteps]);

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.1)',
        minWidth: 120,
        maxWidth: 150,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center', fontSize: '0.9rem' }}>
        {title}
      </Typography>
      
      <Stack spacing={0.5} sx={{ minHeight: 200 }}>
        {valueSteps.map((step, index) => (
          <Box
            key={`${step.luminance}-${index}`}
            sx={{
              height: Math.max(20, 200 / steps),
              backgroundColor: step.color,
              border: selectedStepIndex === index ? '3px solid #1976d2' : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'default',
              transition: 'border-color 0.2s ease',
            }}
          >
            {/* Value label */}
            <Typography
              variant="caption"
              sx={{
                color: step.luminance > 128 ? '#000' : '#fff',
                fontWeight: selectedStepIndex === index ? 700 : 500,
                fontSize: '0.7rem',
                textShadow: step.luminance > 128 ? 'none' : '1px 1px 2px rgba(0, 0, 0, 0.7)',
              }}
            >
              {step.label}
            </Typography>
            
            {/* Selection indicator */}
            {selectedStepIndex === index && (
              <Box
                sx={{
                  position: 'absolute',
                  right: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid #1976d2',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                }}
              />
            )}
          </Box>
        ))}
      </Stack>
      
      {selectedValue !== null && selectedValue !== undefined && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            backgroundColor: 'white',
            borderRadius: 1,
            border: '1px solid rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
            Selected Value:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {Math.round((selectedValue / 255) * 100)}%
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Luminance: {selectedValue}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

ValuePalette.displayName = 'ValuePalette';