import React from 'react';
import { Box, Typography, Slider, Stack, FormControlLabel, Switch, IconButton, Tooltip } from '@mui/material';
import { ALLA_PRIMA_COLORS, AllaPrimaColor } from '@/lib/utils/alla-prima';

export interface ValueStudyControlsProps {
  steps: number;
  onStepsChange: (steps: number) => void;
  enableEdgeDetection: boolean;
  onEdgeDetectionChange: (enabled: boolean) => void;
  selectedAllaPrima: AllaPrimaColor | null;
  onAllaPrimaChange: (color: AllaPrimaColor | null) => void;
}

export const ValueStudyControls: React.FC<ValueStudyControlsProps> = React.memo(({
  steps,
  onStepsChange,
  enableEdgeDetection,
  onEdgeDetectionChange,
  selectedAllaPrima,
  onAllaPrimaChange,
}) => {
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    onStepsChange(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  const handleEdgeDetectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onEdgeDetectionChange(event.target.checked);
  };

  const handleAllaPrimaClick = (color: AllaPrimaColor) => {
    if (selectedAllaPrima?.name === color.name) {
      // If clicking the same color, disable alla prima
      onAllaPrimaChange(null);
    } else {
      // Select the new color
      onAllaPrimaChange(color);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.1)',
        minWidth: 300,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Value Study Controls
      </Typography>
      
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Luminance Steps
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
            Adjust how many value levels to display (2-10)
          </Typography>
          
          <Slider
            value={steps}
            onChange={handleSliderChange}
            aria-labelledby="steps-slider"
            valueLabelDisplay="auto"
            step={1}
            min={2}
            max={10}
            marks={[
              { value: 2 },
              { value: 3 },
              { value: 4 },
              { value: 5 },
              { value: 6 },
              { value: 7 },
              { value: 8 },
              { value: 9 },
              { value: 10 }
            ]}
            track={false}
            sx={{
              '& .MuiSlider-mark': {
                backgroundColor: 'currentColor',
              },
              '& .MuiSlider-markLabel': {
                fontSize: '0.75rem',
              },
            }}
          />
        </Box>
        
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Alla Prima Colors
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
            Apply monochromatic color mapping while preserving values
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {ALLA_PRIMA_COLORS.map((color) => {
              const isSelected = selectedAllaPrima?.name === color.name;
              return (
                <Box key={color.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title={isSelected ? `Disable ${color.name} alla prima` : `Enable ${color.name} alla prima`}>
                    <IconButton
                      onClick={() => handleAllaPrimaClick(color)}
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: color.hex,
                        border: isSelected ? '3px solid #1976d2' : '2px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: color.hex,
                          opacity: 0.8,
                        },
                      }}
                    />
                  </Tooltip>
                  <Typography variant="caption" sx={{ fontWeight: isSelected ? 600 : 400, minWidth: 'fit-content' }}>
                    {color.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          {selectedAllaPrima && (
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {selectedAllaPrima.name} alla prima active
            </Typography>
          )}
        </Box>
        
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Edge Detection
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
            Apply Laplacian filter to highlight edges and structure
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={enableEdgeDetection}
                onChange={handleEdgeDetectionChange}
                name="edge-detection"
                color="primary"
              />
            }
            label="Enable Edge Detection"
            sx={{ mt: 1 }}
          />
        </Box>
        
        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderRadius: 1,
            border: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            Current Settings:
          </Typography>
          <Typography variant="body2">
            {steps === 10 ? 'Full luminance range' : `${steps} value steps`}
            {enableEdgeDetection && ' • Edge detection enabled'}
            {selectedAllaPrima && ` • ${selectedAllaPrima.name} alla prima`}
          </Typography>
          {steps < 10 && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Image will be posterized to {steps} distinct value levels
            </Typography>
          )}
          {enableEdgeDetection && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Laplacian filter will highlight edges and structural details
            </Typography>
          )}
          {selectedAllaPrima && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Monochromatic {selectedAllaPrima.name.toLowerCase()} mapping preserves value relationships
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
});

ValueStudyControls.displayName = 'ValueStudyControls';